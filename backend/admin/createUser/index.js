import { success, error, parseBody, fromError } from '../../common/response.js'
import { publicUser, getUser, ROLES } from '../../common/users.js'
import { provisionAccount } from '../../common/accounts.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const data = parseBody(event)
    const { email, role, password, name } = data
    if (!email || !role) {
      return error('Thiếu email hoặc role', 400)
    }
    if (!ROLES.includes(role)) {
      return error(`Role không hợp lệ. Cho phép: ${ROLES.join(', ')}`, 400)
    }
    if (getUser(email)) {
      return error('Tài khoản với email này đã tồn tại', 409)
    }

    // Mật khẩu (nếu có) là mật khẩu tạm: người dùng phải đổi ở lần đăng nhập đầu.
    const user = await provisionAccount({ email, role, name: name || '', password: password || undefined })

    return success({ message: 'Tạo tài khoản thành công', user: publicUser(user) }, 201)
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi tạo tài khoản')
  }
}

// Chỉ cho phép Admin truy cập
export const handler = requireRole('Admin')(baseHandler)
