// server/app.js
// Express app thay cho API Gateway + Lambda: chuyển HTTP request thành event
// kiểu API Gateway, gọi handler và trả response {statusCode, headers, body}.
import fs from 'node:fs'
import express from 'express'
import config from '../common/config.js'
import { requestContext } from '../common/logger.js'
import { error, fromError } from '../common/response.js'
import { verifySignedRequest, writeObject, contentTypeFor } from '../common/storage.js'
import { routes, RATE_LIMITED } from './routes.js'
import { staticMiddleware } from './static.js'

const toEvent = (req) => ({
  httpMethod: req.method,
  path: req.path,
  headers: req.headers,
  pathParameters: req.params,
  queryStringParameters: req.query,
  body: typeof req.body === 'string' ? req.body : '',
  requestContext: { identity: { sourceIp: req.ip } }
})

const send = (res, result) => {
  res.status(result.statusCode || 200)
  for (const [name, value] of Object.entries(result.headers || {})) res.setHeader(name, value)
  res.send(result.body ?? '')
}

const adapt = (handler) => async (req, res) => {
  try {
    send(res, await handler(toEvent(req)))
  } catch (err) {
    send(res, fromError(err))
  }
}

// Giới hạn tần suất đơn giản trong bộ nhớ: tối đa `max` request / `windowMs` cho mỗi IP + route.
function rateLimit({ windowMs = 15 * 60 * 1000, max = 20 } = {}) {
  const hits = new Map()
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key)
  }, windowMs).unref()

  return (req, res, next) => {
    const key = `${req.ip}|${req.path}`
    const now = Date.now()
    const entry = hits.get(key) || { count: 0, reset: now + windowMs }
    if (entry.reset <= now) Object.assign(entry, { count: 0, reset: now + windowMs })
    entry.count++
    hits.set(key, entry)
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.reset - now) / 1000))
      return send(res, error('Quá nhiều yêu cầu, vui lòng thử lại sau', 429))
    }
    next()
  }
}

// Loại file an toàn để hiển thị inline; các loại khác (html, svg...) buộc tải về để tránh XSS.
const INLINE_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'text/plain; charset=utf-8'])

export function createApp({ webDir } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', process.env.TRUST_PROXY === 'true')

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'same-origin')
    requestContext.run({ ip: req.ip }, next)
  })

  const api = express.Router()

  // CORS: chỉ cần khi frontend chạy khác origin (vd. Vite dev server không dùng proxy).
  api.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', config.corsOrigin)
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE')
    if (req.method === 'OPTIONS') return res.status(204).end()
    next()
  })

  api.get('/health', (req, res) => res.json({ status: 'ok' }))

  // Upload trực tiếp qua URL có chữ ký (thay cho S3 presigned PUT). Stream thẳng xuống đĩa.
  api.put('/files/upload', async (req, res) => {
    try {
      const { filePath, contentType } = verifySignedRequest('upload', req.query)
      const sent = String(req.headers['content-type'] || '').split(';')[0].trim()
      if (contentType && contentType !== 'application/octet-stream' && sent && sent !== contentType) {
        return send(res, error('Content-Type không khớp với URL đã ký', 400))
      }
      const declared = Number(req.headers['content-length'])
      if (Number.isFinite(declared) && declared > config.maxUploadBytes) {
        return send(res, error(`File vượt quá giới hạn ${Math.round(config.maxUploadBytes / 1024 / 1024)}MB`, 413))
      }
      await writeObject(filePath, req)
      res.status(200).end()
    } catch (err) {
      send(res, fromError(err))
    }
  })

  api.get('/files/download', (req, res) => {
    try {
      const { key, filePath } = verifySignedRequest('download', req.query)
      if (!fs.existsSync(filePath)) return send(res, error('Không tìm thấy file', 404))
      const type = contentTypeFor(key)
      const name = encodeURIComponent(key.split('/').pop())
      res.setHeader('Content-Type', type)
      res.setHeader('Content-Disposition', `${INLINE_TYPES.has(type) ? 'inline' : 'attachment'}; filename*=UTF-8''${name}`)
      res.setHeader('Cache-Control', 'private, max-age=300')
      fs.createReadStream(filePath).on('error', (err) => send(res, fromError(err))).pipe(res)
    } catch (err) {
      send(res, fromError(err))
    }
  })

  // Body JSON được giữ nguyên dạng chuỗi giống event.body của API Gateway.
  api.use(express.text({ type: () => true, limit: '1mb' }))

  const limiter = rateLimit()
  for (const [method, path, handler] of routes) {
    const middleware = RATE_LIMITED.has(path) ? [limiter] : []
    api[method.toLowerCase()](path, ...middleware, adapt(handler))
  }

  api.use((req, res) => send(res, error(`Không tìm thấy endpoint ${req.method} ${req.path}`, 404)))
  // Lỗi từ body parser (JSON quá lớn, encoding sai...).
  api.use((err, req, res, next) => send(res, error(err.expose ? err.message : 'Yêu cầu không hợp lệ', err.status || 400)))

  app.use('/api', api)
  app.use(staticMiddleware(webDir))
  app.use((req, res) => res.status(404).type('text/plain').send('Not Found'))

  return app
}

export default createApp
