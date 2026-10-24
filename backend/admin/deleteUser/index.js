import { success, error, fromError } from '../../common/response.js'
import { getUser, deleteUser } from '../../common/users.js'
import { requireRole } from '../../common/authMiddleware.js'
import { checkAdminChange } from '../guards.js'

const baseHandler = async (event) => {
  try {
    const username = event.pathParameters?.username
    if (!username) {
      return error('Thiếu tham số username', 400)
    }

    const target = getUser(username)
    if (!target) return error('Không tìm thấy tài khoản', 404)

    const blocked = checkAdminChange(event, target, { removing: true })
    if (blocked) return error(blocked, 400)

    deleteUser(username)
    return success({ message: 'Xóa tài khoản thành công' })
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi xóa tài khoản')
  }
}

// Chỉ cho phép Admin truy cập
export const handler = requireRole('Admin')(baseHandler)
