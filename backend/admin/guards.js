// admin/guards.js
// Bảo vệ khỏi thao tác tự khóa hệ thống: Admin không thể tự xóa/vô hiệu hóa/hạ quyền
// chính mình, và hệ thống luôn còn ít nhất một Admin đang hoạt động.
import { listUsers, normalizeEmail } from '../common/users.js'
import { currentUser } from '../common/authMiddleware.js'

const activeAdmins = () => listUsers().filter((u) => u.role === 'Admin' && u.enabled)

// Trả về thông báo lỗi nếu thao tác bị chặn, ngược lại null.
export function checkAdminChange(event, target, { removing = false, disabling = false, newRole } = {}) {
  const self = normalizeEmail(currentUser(event)?.username) === target.username
  const demoting = newRole !== undefined && newRole !== 'Admin'
  if (self && (removing || disabling || demoting)) {
    return 'Không thể xóa, vô hiệu hóa hoặc hạ quyền tài khoản đang đăng nhập'
  }
  const losesAdmin = target.role === 'Admin' && target.enabled && (removing || disabling || demoting)
  if (losesAdmin && activeAdmins().length <= 1) {
    return 'Hệ thống phải còn ít nhất một tài khoản Admin đang hoạt động'
  }
  return null
}

export default { checkAdminChange }
