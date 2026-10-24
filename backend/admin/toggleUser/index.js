import { success, error, parseBody, fromError } from '../../common/response.js'
import { getUser, updateUser } from '../../common/users.js'
import { requireRole } from '../../common/authMiddleware.js'
import { checkAdminChange } from '../guards.js'

const baseHandler = async (event) => {
  try {
    // Trích xuất username từ tham số đường dẫn
    const username = event.pathParameters?.username
    if (!username) {
      return error('Thiếu tham số username', 400)
    }

    const { enabled } = parseBody(event)
    if (typeof enabled !== 'boolean') return error('Trường enabled phải là true hoặc false', 400)

    const target = getUser(username)
    if (!target) return error('Không tìm thấy tài khoản', 404)

    if (!enabled) {
      const blocked = checkAdminChange(event, target, { disabling: true })
      if (blocked) return error(blocked, 400)
    }

    updateUser(username, { enabled })

    return success({ message: `Đã ${enabled ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản thành công` })
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi thay đổi trạng thái tài khoản')
  }
}

// Chỉ cho phép Admin truy cập
export const handler = requireRole('Admin')(baseHandler)
