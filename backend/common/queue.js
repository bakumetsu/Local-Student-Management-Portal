// common/queue.js
// Hàng đợi job bền vững trên SQLite thay cho Amazon SQS.
// sendMessage() giữ nguyên chữ ký cũ; worker chạy trong cùng process, tự retry
// với backoff tăng dần và giữ job lại qua các lần khởi động lại server.
import db from './db.js'

const POLL_INTERVAL_MS = 2000
const MAX_ATTEMPTS = 5
const BATCH_SIZE = 10

const insertStmt = db.prepare('INSERT INTO jobs (body, status, attempts, run_at, created_at) VALUES (?, ?, 0, ?, ?)')
const claimStmt = db.prepare(`SELECT * FROM jobs WHERE status = 'pending' AND run_at <= ? ORDER BY id LIMIT ${BATCH_SIZE}`)
// Job đã xong bị xóa nội dung (có thể chứa mật khẩu tạm / mã OTP), chỉ giữ metadata.
const doneStmt = db.prepare(`UPDATE jobs SET status = 'done', body = '{}', attempts = attempts + 1, last_error = NULL WHERE id = ?`)
const retryStmt = db.prepare('UPDATE jobs SET status = ?, attempts = ?, run_at = ?, last_error = ? WHERE id = ?')
const cleanupStmt = db.prepare(`DELETE FROM jobs WHERE status = 'done' AND created_at < ?`)

export const sendMessage = async (messageBody) => {
  const body = typeof messageBody === 'string' ? messageBody : JSON.stringify(messageBody)
  const info = insertStmt.run(body, 'pending', Date.now(), new Date().toISOString())
  scheduleSoon()
  return { MessageId: String(info.lastInsertRowid) }
}

let processor = null
let timer = null
let running = false

function scheduleSoon() {
  if (processor && !running) setImmediate(() => tick().catch((err) => console.error('Queue worker error:', err)))
}

async function tick() {
  if (running || !processor) return
  running = true
  try {
    let jobs
    // Dừng vòng lặp khi stopWorker() được gọi; job chưa xử lý vẫn nằm trong hàng đợi.
    while (processor && (jobs = claimStmt.all(Date.now())).length > 0) {
      for (const job of jobs) {
        const handle = processor
        if (!handle) break
        try {
          await handle(JSON.parse(job.body))
          doneStmt.run(job.id)
        } catch (err) {
          const attempts = job.attempts + 1
          const failed = attempts >= MAX_ATTEMPTS
          const delay = Math.min(60_000 * 2 ** (attempts - 1), 30 * 60_000)
          retryStmt.run(failed ? 'failed' : 'pending', attempts, Date.now() + delay, String(err?.message || err), job.id)
          console.error(`Job #${job.id} lỗi (lần ${attempts}/${MAX_ATTEMPTS})${failed ? ', bỏ qua' : ''}:`, err?.message || err)
        }
      }
    }
  } finally {
    running = false
  }
}

// Bắt đầu worker; processor(message) ném lỗi để yêu cầu retry.
export function startWorker(handler) {
  processor = handler
  if (timer) return
  timer = setInterval(() => { tick().catch((err) => console.error('Queue worker error:', err)) }, POLL_INTERVAL_MS)
  timer.unref()
  // Dọn job đã xong quá 7 ngày.
  cleanupStmt.run(new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())
  scheduleSoon()
}

export function stopWorker() {
  if (timer) clearInterval(timer)
  timer = null
  processor = null
}

export default { sendMessage, startWorker, stopWorker }
