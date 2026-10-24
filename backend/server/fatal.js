// server/fatal.js
// Xử lý lỗi khởi động nghiêm trọng. Khi người dùng double-click file .exe, cửa sổ console
// sẽ đóng ngay khi process thoát nên không đọc được lỗi. Module này ghi lỗi ra file
// startup-error.log và giữ cửa sổ mở cho tới khi bấm Enter.
// Không import config/db để vẫn chạy được khi chính các module đó lỗi.
import fs from 'node:fs'
import path from 'node:path'
import sea from 'node:sea'

export const isPackaged = () => sea.isSea()

export function fatal(message, err) {
  const detail = err ? `\n${err.stack || err}` : ''
  console.error(`\n❌ ${message}${detail}\n`)

  if (!isPackaged()) process.exit(1)

  const logPath = path.join(path.dirname(process.execPath), 'startup-error.log')
  try {
    fs.writeFileSync(logPath, `${new Date().toISOString()}\n${message}${detail}\n`)
    console.error(`Chi tiết lỗi đã được ghi vào: ${logPath}`)
  } catch {
    // thư mục không ghi được (vd. chạy trong Program Files) — chỉ hiển thị trên màn hình
  }

  if (!process.stdin.isTTY) process.exit(1)
  console.error('Nhấn Enter để đóng cửa sổ...')
  process.stdin.resume()
  process.stdin.once('data', () => process.exit(1))
}

export default fatal
