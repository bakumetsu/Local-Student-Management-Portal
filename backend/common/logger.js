// common/logger.js
// Thay cho CloudWatch Logs: bắt toàn bộ console.log/warn/error, giữ một ring buffer
// trong bộ nhớ cho trang Admin Logs và ghi song song ra file data/logs/app.log.
import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import { AsyncLocalStorage } from 'node:async_hooks'
import config from './config.js'

const MAX_ENTRIES = 2000
const MAX_FILE_BYTES = 10 * 1024 * 1024
const buffer = []
const logFile = path.join(config.logDir, 'app.log')
let stream = null

function openStream() {
  // Xoay vòng file log đơn giản: đổi tên thành app.log.1 khi vượt quá giới hạn.
  try {
    if (fs.existsSync(logFile) && fs.statSync(logFile).size > MAX_FILE_BYTES) {
      fs.renameSync(logFile, `${logFile}.1`)
    }
  } catch {
    // bỏ qua lỗi xoay vòng, vẫn tiếp tục ghi log
  }
  stream = fs.createWriteStream(logFile, { flags: 'a' })
  stream.on('error', () => { stream = null })
}

const formatTimestamp = (date) => date.toISOString().replace('T', ' ').substring(0, 19)

function record(level, args) {
  const message = util.format(...args)
  const entry = { timestamp: formatTimestamp(new Date()), level, message, ip: requestContext.getStore()?.ip || '-' }
  buffer.push(entry)
  if (buffer.length > MAX_ENTRIES) buffer.shift()
  stream?.write(`${entry.timestamp} [${level}] ${message}\n`)
}

// Ngữ cảnh theo từng request (IP client), an toàn khi nhiều request chạy song song.
export const requestContext = new AsyncLocalStorage()

let installed = false
export function installLogger() {
  if (installed) return
  installed = true
  openStream()
  const original = { log: console.log, info: console.info, warn: console.warn, error: console.error }
  console.log = (...args) => { record('INFO', args); original.log(...args) }
  console.info = (...args) => { record('INFO', args); original.info(...args) }
  console.warn = (...args) => { record('WARN', args); original.warn(...args) }
  console.error = (...args) => { record('ERROR', args); original.error(...args) }
}

// Trả về log mới nhất trước, lọc theo chuỗi con (không phân biệt hoa thường).
export function getLogs({ limit = 20, filterPattern = '' } = {}) {
  const needle = filterPattern.toLowerCase()
  const result = []
  for (let i = buffer.length - 1; i >= 0 && result.length < limit; i--) {
    const entry = buffer[i]
    if (!needle || entry.message.toLowerCase().includes(needle) || entry.level.toLowerCase() === needle) {
      result.push(entry)
    }
  }
  return result
}

export default { installLogger, getLogs, requestContext }
