import { success, error, parseBody, fromError } from '../../common/response.js'
import { getUser, updateUser, ROLES } from '../../common/users.js'
import { requireRole } from '../../common/authMiddleware.js'
import { checkAdminChange } from '../guards.js'

const baseHandler = async (event) => {
  try {
    const username = event.pathParameters?.username
    if (!username) {
      return error('Thiếu tham số username', 400)
    }

    const { role, enabled } = parseBody(event)
    if (enabled !== undefined && typeof enabled !== 'boolean') return error('Trường enabled phải là true hoặc false', 400)
    if (role !== undefined && !ROLES.includes(role)) return error(`Role không hợp lệ. Cho phép: ${ROLES.join(', ')}`, 400)

    const target = getUser(username)
    if (!target) return error('Không tìm thấy tài khoản', 404)

    const blocked = checkAdminChange(event, target, {
      disabling: enabled === false,
      newRole: role
    })
    if (blocked) return error(blocked, 400)

    // Mỗi tài khoản có đúng một nhóm quyền (thay cho việc gỡ/gán Cognito group).
    const changes = {}
    if (enabled !== undefined && enabled !== target.enabled) changes.enabled = enabled
    if (role && role !== target.role) changes.role = role
    updateUser(username, changes)

    return success({ message: 'Cập nhật thông tin tài khoản thành công' })
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi cập nhật tài khoản')
  }
}

export const handler = requireRole('Admin')(baseHandler)
