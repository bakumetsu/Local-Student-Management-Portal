// server/main.js
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { installLogger } from '../common/logger.js'
import config from '../common/config.js'
import db from '../common/db.js'
import { countUsers, createUser } from '../common/users.js'
import { startWorker, stopWorker } from '../common/queue.js'
import { processMessage } from '../notifications/sendEmailWorker/index.js'
import { createApp } from './app.js'

// Thư mục chứa file này (hoạt động cả khi chạy ESM lẫn khi đã bundle sang CommonJS).
const here = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

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
  const server = app.listen(config.port, config.host, () => {
    const url = config.publicUrl || `http://localhost:${config.port}`
    console.log(`🚀 Student Management Portal đang chạy tại ${url}`)
    console.log(`📁 Dữ liệu lưu tại ${config.dataDir}`)
  })

  server.on('error', (err) => {
    console.error(err.code === 'EADDRINUSE'
      ? `Cổng ${config.port} đang được sử dụng. Đặt biến môi trường PORT để dùng cổng khác.`
      : `Lỗi server: ${err.message}`)
    process.exit(1)
  })

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
