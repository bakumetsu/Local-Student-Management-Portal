import { success, fromError } from '../../common/response.js'
import { listUsers, publicUser } from '../../common/users.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async () => {
  try {
    const users = listUsers().map(publicUser)
    return success({ users })
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi lấy danh sách tài khoản')
  }
}

// Chỉ cho phép Admin truy cập
export const handler = requireRole('Admin')(baseHandler)
