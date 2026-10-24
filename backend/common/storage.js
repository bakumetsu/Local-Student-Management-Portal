// common/storage.js
// Lưu file trên đĩa cục bộ (data/uploads) thay cho Amazon S3.
// Giữ nguyên luồng "presigned URL": server cấp URL ký HMAC có hạn dùng,
// trình duyệt PUT file trực tiếp lên URL đó, và tải về qua URL ký tương tự.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import config from './config.js'
import { HttpError } from './response.js'

const ROOT = config.uploadDir
const API_PREFIX = '/api/files'

const MIME = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip'
}

export const contentTypeFor = (key) => MIME[path.extname(key).toLowerCase()] || 'application/octet-stream'

// Làm sạch tên file người dùng gửi lên: bỏ đường dẫn, ký tự điều khiển và ký tự cấm trên Windows.
export function safeFileName(fileName) {
  const base = path.basename(String(fileName || '').replace(/\\/g, '/'))
  const cleaned = base.replace(/[\u0000-\u001f<>:"/\\|?*]+/g, '_').replace(/^\.+/, '').trim()
  return (cleaned || 'file').slice(0, 150)
}

// Làm sạch một đoạn path (vd. studentId, type) để ghép vào key.
export const safeSegment = (value) => String(value || '').replace(/[^A-Za-z0-9_-]+/g, '_').slice(0, 64) || '_'

// Chuyển key thành đường dẫn tuyệt đối, chặn path traversal ra ngoài thư mục upload.
export function resolveKey(key) {
  const normalized = String(key || '').replace(/\\/g, '/')
  if (!normalized || normalized.startsWith('/') || normalized.split('/').some((part) => part === '..' || part === '')) {
    throw new HttpError('Key file không hợp lệ', 400)
  }
  const full = path.resolve(ROOT, normalized)
  if (!full.startsWith(ROOT + path.sep)) throw new HttpError('Key file không hợp lệ', 400)
  return full
}

const sign = (op, key, contentType, expires) =>
  crypto.createHmac('sha256', config.jwtSecret).update(`${op}\n${key}\n${contentType}\n${expires}`).digest('hex')

function buildUrl(op, key, contentType, expiresIn) {
  const exp = Math.floor(Date.now() / 1000) + expiresIn
  const params = new URLSearchParams({ key, exp: String(exp), sig: sign(op, key, contentType, exp) })
  if (op === 'upload') params.set('ct', contentType)
  return `${config.publicUrl}${API_PREFIX}/${op}?${params}`
}

export const getUploadSignedUrl = async (key, contentType, expiresIn = 300) => {
  resolveKey(key)
  return buildUrl('upload', key, contentType, expiresIn)
}

export const getDownloadSignedUrl = async (key, expiresIn = 3600) => {
  resolveKey(key)
  return buildUrl('download', key, '', expiresIn)
}

// Kiểm tra chữ ký + hạn dùng của URL; ném HttpError 403 nếu sai.
export function verifySignedRequest(op, query) {
  const key = String(query.key || '')
  const contentType = op === 'upload' ? String(query.ct || '') : ''
  const exp = Number(query.exp)
  const sig = String(query.sig || '')
  const expected = sign(op, key, contentType, exp)
  const valid = Number.isFinite(exp) && sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  if (!valid) throw new HttpError('Chữ ký URL không hợp lệ', 403)
  if (exp < Math.floor(Date.now() / 1000)) throw new HttpError('URL đã hết hạn', 403)
  return { key, contentType, filePath: resolveKey(key) }
}

// Ghi file theo kiểu atomic: ghi ra file tạm rồi rename.
export async function writeObject(filePath, readable, maxBytes = config.maxUploadBytes) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
  const tmp = `${filePath}.${crypto.randomBytes(6).toString('hex')}.tmp`
  let size = 0
  try {
    await new Promise((resolve, reject) => {
      const out = fs.createWriteStream(tmp)
      readable.on('data', (chunk) => {
        size += chunk.length
        if (size > maxBytes) {
          readable.destroy()
          out.destroy()
          reject(new HttpError(`File vượt quá giới hạn ${Math.round(maxBytes / 1024 / 1024)}MB`, 413))
        }
      })
      readable.on('error', reject)
      out.on('error', reject)
      out.on('finish', resolve)
      readable.pipe(out)
    })
    await fs.promises.rename(tmp, filePath)
    return size
  } catch (err) {
    await fs.promises.rm(tmp, { force: true })
    throw err
  }
}

export async function deleteObject(key) {
  if (!key) return
  try {
    await fs.promises.rm(resolveKey(key), { force: true })
  } catch (err) {
    console.warn(`Không thể xóa file ${key}:`, err.message)
  }
}

// Gắn URL tải về mới (có chữ ký) cho item có s3Key; giữ tên trường fileUrl để frontend không đổi.
export async function withDownloadUrl(item) {
  if (!item?.s3Key) return item
  try {
    return { ...item, fileUrl: await getDownloadSignedUrl(item.s3Key) }
  } catch {
    return item
  }
}

export default { getUploadSignedUrl, getDownloadSignedUrl, verifySignedRequest, writeObject, deleteObject, withDownloadUrl }
