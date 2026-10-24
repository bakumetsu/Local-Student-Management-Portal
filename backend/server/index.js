// server/index.js
// Điểm khởi chạy server tự host: API + frontend + worker gửi email trong một process.
// Dùng chung cho `npm start` (Node) và bản đóng gói thành file .exe (Node SEA).

// node:sqlite vẫn phát ExperimentalWarning ở một số phiên bản Node; ẩn riêng cảnh báo này.
const emitWarning = process.emitWarning
process.emitWarning = (warning, ...args) => {
  const text = typeof warning === 'string' ? warning : warning?.message
  if (String(text).includes('SQLite')) return
  return emitWarning.call(process, warning, ...args)
}

// Import động để phần chặn cảnh báo ở trên chạy trước khi node:sqlite được nạp.
import('./main.js')
  .then(({ main }) => main())
  .catch((err) => {
    console.error('Không thể khởi động server:', err)
    process.exit(1)
  })
