// server/main.js
import path from 'node:path'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { installLogger } from '../common/logger.js'
import config from '../common/config.js'
import db from '../common/db.js'
import { countUsers, createUser } from '../common/users.js'
import { startWorker, stopWorker } from '../common/queue.js'
import { processMessage } from '../notifications/sendEmailWorker/index.js'
import { createApp } from './app.js'
import { fatal, isPackaged } from './fatal.js'

// Thư mục chứa file này (hoạt động cả khi chạy ESM lẫn khi đã bundle sang CommonJS).
const here = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// Số cổng thử thêm khi cổng mặc định bị chiếm (chỉ khi người dùng không tự đặt PORT).
const PORT_FALLBACK_ATTEMPTS = 10

// Mở trình duyệt mặc định (chỉ dùng cho bản .exe). Lỗi được bỏ qua: người dùng vẫn tự mở URL được.
function openBrowser(url) {
  const [cmd, args] = process.platform === 'win32' ? ['explorer.exe', [url]]
    : process.platform === 'darwin' ? ['open', [url]]
      : ['xdg-open', [url]]
  try {
    const child = spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: true })
    child.on('error', () => {})
    child.unref()
  } catch {
    // bỏ qua
  }
}

// Lần chạy đầu: tạo tài khoản Admin mặc định để có thể đăng nhập.
function ensureAdmin() {
  if (countUsers() > 0) return
  const usingDefault = !process.env.ADMIN_PASSWORD
  createUser({
    email: config.admin.email,
    password: config.admin.password,
    role: 'Admin',
    name: 'Administrator',
    // Mật khẩu mặc định công khai trong tài liệu nên bắt buộc đổi ở lần đăng nhập đầu.
    forceChange: usingDefault
  })
  console.warn(`⚠️ Đã tạo tài khoản Admin đầu tiên: ${config.admin.email}` +
    (usingDefault ? ` / ${config.admin.password} (bắt buộc đổi mật khẩu khi đăng nhập lần đầu)` : ''))
}

export function main() {
  installLogger()
  ensureAdmin()
  startWorker(processMessage)

  const webDir = process.env.WEB_DIR || path.resolve(here, '../../frontend/dist')
  const app = createApp({ webDir })
  const server = http.createServer(app)
  const portIsExplicit = process.env.PORT !== undefined && process.env.PORT !== ''
  const firstPort = config.port
  let attempts = 0

  server.on('listening', () => {
    config.port = server.address().port
    const url = config.publicUrl || `http://localhost:${config.port}`
    if (config.port !== firstPort && firstPort !== 0) console.warn(`⚠️ Cổng ${firstPort} đang bận, chuyển sang cổng ${config.port}.`)
    console.log(`🚀 Student Management Portal đang chạy tại ${url}`)
    console.log(`📁 Dữ liệu lưu tại ${config.dataDir}`)
    if (isPackaged()) {
      console.log('👉 Giữ cửa sổ này mở trong khi sử dụng. Đóng cửa sổ (hoặc nhấn Ctrl+C) để dừng server.')
      if (process.env.NO_BROWSER !== '1') openBrowser(`http://localhost:${config.port}`)
    }
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !portIsExplicit && attempts < PORT_FALLBACK_ATTEMPTS) {
      attempts++
      server.listen(firstPort + attempts, config.host)
      return
    }
    fatal(err.code === 'EADDRINUSE'
      ? `Cổng ${portIsExplicit ? config.port : `${firstPort}-${firstPort + attempts}`} đang được sử dụng. Đặt biến môi trường PORT (hoặc PORT=... trong file .env) để dùng cổng khác.`
      : err.code === 'EACCES'
        ? `Không có quyền mở cổng ${firstPort + attempts}. Hãy dùng cổng khác qua biến PORT.`
        : `Lỗi server: ${err.message}`)
  })

  server.listen(firstPort, config.host)

  let closing = false
  const shutdown = (signal) => {
    if (closing) return
    closing = true
    console.log(`Nhận ${signal}, đang dừng server...`)
    stopWorker()
    server.close(() => {
      db.close()
      process.exit(0)
    })
    setTimeout(() => process.exit(0), 5000).unref()
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))

  return server
}

export default main
