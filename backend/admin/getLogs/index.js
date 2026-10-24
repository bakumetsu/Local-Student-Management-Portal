// admin/getLogs/index.js
// Trả về nhật ký hoạt động mới nhất từ logger nội bộ (thay cho CloudWatch Logs).
import { success, fromError } from '../../common/response.js'
import { getLogs } from '../../common/logger.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const params = event.queryStringParameters || {}
    const requested = Number(params.limit)
    const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 1000) : 20
    const filterPattern = String(params.filterPattern || '')

    return success({ logs: getLogs({ limit, filterPattern }) })
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi lấy nhật ký log')
  }
}

export const handler = requireRole('Admin')(baseHandler)
