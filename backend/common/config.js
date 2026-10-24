// common/config.js
// Cấu hình tập trung cho server tự host (thay cho biến môi trường Lambda/AWS).
// Mọi giá trị đều có mặc định hợp lý để chạy ngay mà không cần cấu hình.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import sea from 'node:sea'

const env = process.env

// Thư mục dữ liệu: chứa database SQLite, file upload, log và secret.
// Mặc định: ./data trong thư mục làm việc; với bản .exe là thư mục data cạnh file .exe.
const baseDir = sea.isSea() ? path.dirname(process.execPath) : process.cwd()

// Nạp file .env (nếu có) cạnh thư mục gốc; biến môi trường đã đặt sẵn được ưu tiên.
const envFile = path.join(baseDir, '.env')
if (fs.existsSync(envFile)) process.loadEnvFile(envFile)
const DATA_DIR = path.resolve(env.DATA_DIR || path.join(baseDir, 'data'))
fs.mkdirSync(DATA_DIR, { recursive: true })

// JWT secret: lấy từ env, nếu không có thì sinh ngẫu nhiên một lần và lưu lại
// để token không bị vô hiệu sau mỗi lần khởi động lại.
function loadSecret() {
  if (env.JWT_SECRET) return env.JWT_SECRET
  const secretFile = path.join(DATA_DIR, '.jwt-secret')
  if (fs.existsSync(secretFile)) return fs.readFileSync(secretFile, 'utf8').trim()
  const secret = crypto.randomBytes(48).toString('hex')
  fs.writeFileSync(secretFile, secret, { mode: 0o600 })
  return secret
}

const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// PORT=0 hợp lệ (hệ điều hành tự chọn cổng trống, dùng trong test).
const port = env.PORT !== undefined && /^\d+$/.test(env.PORT) && Number(env.PORT) <= 65535 ? Number(env.PORT) : 8080

export const config = {
  port,
  host: env.HOST || '0.0.0.0',
  publicUrl: (env.PUBLIC_URL || '').replace(/\/+$/, ''),
  corsOrigin: env.CORS_ORIGIN || '*',
  dataDir: DATA_DIR,
  dbFile: path.join(DATA_DIR, 'portal.db'),
  uploadDir: path.join(DATA_DIR, 'uploads'),
  logDir: path.join(DATA_DIR, 'logs'),
  jwtSecret: loadSecret(),
  tokenTtlSeconds: toInt(env.TOKEN_TTL_SECONDS, 8 * 3600),
  maxUploadBytes: toInt(env.MAX_UPLOAD_MB, 10) * 1024 * 1024,
  admin: {
    email: (env.ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
    password: env.ADMIN_PASSWORD || 'Abc12345!'
  },
  mail: {
    host: env.SMTP_HOST || '',
    port: toInt(env.SMTP_PORT, 587),
    secure: env.SMTP_SECURE === 'true',
    user: env.SMTP_USER || '',
    pass: env.SMTP_PASS || '',
    from: env.FROM_EMAIL || 'noreply@example.com'
  }
}

fs.mkdirSync(config.uploadDir, { recursive: true })
fs.mkdirSync(config.logDir, { recursive: true })

export default config
