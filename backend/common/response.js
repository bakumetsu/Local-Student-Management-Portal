// common/response.js
// Utilities chuẩn hóa response cho handler (tuân theo README spec)
import config from './config.js'

const headers = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': config.corsOrigin,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
})

export const success = (data, statusCode = 200) => ({
  statusCode,
  headers: headers(),
  body: JSON.stringify({
    success: true,
    message: "Yêu cầu xử lý thành công",
    data: data
  })
})

export const error = (message, statusCode = 500) => ({
  statusCode,
  headers: headers(),
  body: JSON.stringify({
    success: false,
    message: message,
    error: message
  })
})

// Lỗi có statusCode riêng (vd. body JSON sai) để handler trả 4xx thay vì 500.
export class HttpError extends Error {
  constructor(message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

// Đọc body JSON của event; body rỗng trả về {}.
export const parseBody = (event) => {
  if (event.body === undefined || event.body === null || event.body === '') return {}
  if (typeof event.body !== 'string') return event.body
  try {
    const data = JSON.parse(event.body)
    if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new Error()
    return data
  } catch {
    throw new HttpError('Body phải là JSON object hợp lệ', 400)
  }
}

// Chuyển exception thành response; lỗi không xác định trả 500.
export const fromError = (err, fallbackMessage = 'Lỗi máy chủ') => {
  if (err?.statusCode && err.statusCode < 500) return error(err.message, err.statusCode)
  if (err?.code === 'CONFLICT') return error(err.message, 409)
  console.error(err)
  return error(err?.message || fallbackMessage, 500)
}

export default { success, error, parseBody, fromError, HttpError }
