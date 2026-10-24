// server/static.js
// Phục vụ frontend đã build (Vite dist) — từ đĩa khi chạy bằng Node,
// hoặc từ asset nhúng trong file thực thi khi chạy bản standalone (Node SEA).
import fs from 'node:fs'
import path from 'node:path'
import sea from 'node:sea'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
}

// Nguồn file: trả về Buffer hoặc null.
function createSource(webDir) {
  if (sea.isSea()) {
    const manifest = new Set(JSON.parse(sea.getAsset('web-manifest.json', 'utf8')))
    return {
      description: 'embedded assets',
      read: (rel) => (manifest.has(rel) ? Buffer.from(sea.getAsset(`web/${rel}`)) : null)
    }
  }
  const root = path.resolve(webDir)
  if (!fs.existsSync(path.join(root, 'index.html'))) return null
  return {
    description: root,
    read: (rel) => {
      const full = path.resolve(root, rel)
      if (!full.startsWith(root + path.sep)) return null
      try {
        return fs.statSync(full).isFile() ? fs.readFileSync(full) : null
      } catch {
        return null
      }
    }
  }
}

export function staticMiddleware(webDir) {
  const source = createSource(webDir)
  if (!source) {
    console.warn(`⚠️ Không tìm thấy frontend build tại ${webDir}. Chạy "npm run build" trong thư mục frontend (hoặc dùng Vite dev server).`)
    return (req, res, next) => next()
  }
  console.log(`Phục vụ frontend từ: ${source.description}`)
  const indexHtml = source.read('index.html')

  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    let rel
    try {
      rel = decodeURIComponent(req.path).replace(/^\/+/, '')
    } catch {
      return next()
    }
    const file = rel && !rel.split('/').includes('..') ? source.read(rel) : null
    if (file) {
      res.setHeader('Content-Type', TYPES[path.extname(rel).toLowerCase()] || 'application/octet-stream')
      // File trong assets/ có hash trong tên nên cache lâu dài được.
      res.setHeader('Cache-Control', rel.startsWith('assets/') ? 'public, max-age=31536000, immutable' : 'no-cache')
      return res.end(req.method === 'HEAD' ? undefined : file)
    }
    // Đường dẫn có phần mở rộng mà không tồn tại → 404 thật, còn lại là route SPA.
    if (path.extname(rel)) return next()
    res.setHeader('Content-Type', TYPES['.html'])
    res.setHeader('Cache-Control', 'no-cache')
    res.end(req.method === 'HEAD' ? undefined : indexHtml)
  }
}

export default staticMiddleware
