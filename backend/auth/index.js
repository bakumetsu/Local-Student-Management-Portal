// backend/auth/index.js
// Các endpoint xác thực thay cho AWS Amplify / Cognito Hosted flows.
import jwt from 'jsonwebtoken'
import config from '../common/config.js'
import { success, error, parseBody, fromError } from '../common/response.js'
import { withAuth, issueToken, currentUser } from '../common/authMiddleware.js'
import { sendMessage } from '../common/queue.js'
import {
  authenticate, getUser, updateUser, setPassword, verifyPassword, validatePassword,
  createResetCode, checkResetCode, publicUser, STATUS, AuthError
} from '../common/users.js'

const CHALLENGE_TTL_SECONDS = 10 * 60

const sessionResponse = (user) => success({
  idToken: issueToken(user),
  expiresIn: config.tokenTtlSeconds,
  user: publicUser(user)
})

// Token ngắn hạn cho bước "đổi mật khẩu lần đầu" (tương đương Cognito NEW_PASSWORD_REQUIRED).
const challengeToken = (user) => jwt.sign(
  { purpose: 'new_password', tv: user.tokenVersion },
  config.jwtSecret,
  { algorithm: 'HS256', subject: user.username, expiresIn: CHALLENGE_TTL_SECONDS }
)

// POST /auth/login
export const login = async (event) => {
  try {
    const { email, password } = parseBody(event)
    if (!email || !password) return error('Thiếu email hoặc mật khẩu', 400)

    const user = authenticate(email, password)
    if (user.status === STATUS.FORCE_CHANGE_PASSWORD) {
      return success({ challenge: 'NEW_PASSWORD_REQUIRED', session: challengeToken(user), email: user.email })
    }
    console.log(`User ${user.email} đăng nhập thành công.`)
    return sessionResponse(user)
  } catch (err) {
    if (err instanceof AuthError) console.warn(`Đăng nhập thất bại: ${err.message}`)
    return fromError(err)
  }
}

// POST /auth/complete-new-password
export const completeNewPassword = async (event) => {
  try {
    const { session, newPassword } = parseBody(event)
    if (!session || !newPassword) return error('Thiếu session hoặc mật khẩu mới', 400)

    let claims
    try {
      claims = jwt.verify(session, config.jwtSecret, { algorithms: ['HS256'] })
    } catch {
      return error('Phiên đổi mật khẩu đã hết hạn, vui lòng đăng nhập lại', 401)
    }
    const user = getUser(claims.sub)
    if (claims.purpose !== 'new_password' || !user || !user.enabled || user.tokenVersion !== claims.tv ||
        user.status !== STATUS.FORCE_CHANGE_PASSWORD) {
      return error('Phiên đổi mật khẩu không hợp lệ, vui lòng đăng nhập lại', 401)
    }
    if (verifyPassword(newPassword, user.passwordHash)) return error('Mật khẩu mới phải khác mật khẩu tạm', 400)

    const updated = setPassword(user.username, newPassword)
    console.log(`User ${updated.email} đã đổi mật khẩu lần đầu.`)
    return sessionResponse(updated)
  } catch (err) {
    return fromError(err)
  }
}

// GET /auth/me — thuộc tính người dùng (thay cho fetchUserAttributes của Amplify).
export const getMe = withAuth(async (event) => {
  const user = getUser(currentUser(event).username)
  return success({
    sub: user.username,
    email: user.email,
    name: user.name,
    phone_number: user.phone,
    role: user.role,
    status: user.status
  })
})

// PUT /auth/me — cập nhật tên, số điện thoại.
export const updateMe = withAuth(async (event) => {
  try {
    const { name, phone } = parseBody(event)
    const changes = {}
    if (name !== undefined) changes.name = String(name).trim().slice(0, 100)
    if (phone !== undefined) {
      const p = String(phone).trim()
      if (p && !/^[0-9+()\s.-]{6,20}$/.test(p)) return error('Số điện thoại không hợp lệ', 400)
      changes.phone = p
    }
    const user = updateUser(currentUser(event).username, changes)
    return success({ message: 'Cập nhật hồ sơ thành công', user: publicUser(user) })
  } catch (err) {
    return fromError(err)
  }
})

// POST /auth/change-password — trả về token mới vì token cũ bị thu hồi.
export const changePassword = withAuth(async (event) => {
  try {
    const { oldPassword, newPassword } = parseBody(event)
    if (!oldPassword || !newPassword) return error('Thiếu mật khẩu hiện tại hoặc mật khẩu mới', 400)
    const user = getUser(currentUser(event).username)
    if (!verifyPassword(oldPassword, user.passwordHash)) return error('Mật khẩu hiện tại không đúng', 400)
    if (oldPassword === newPassword) return error('Mật khẩu mới phải khác mật khẩu hiện tại', 400)

    const updated = setPassword(user.username, newPassword)
    console.log(`User ${updated.email} đã đổi mật khẩu.`)
    return sessionResponse(updated)
  } catch (err) {
    return fromError(err)
  }
})

// POST /auth/forgot-password — luôn trả 200 để không lộ email nào tồn tại.
export const forgotPassword = async (event) => {
  try {
    const { email } = parseBody(event)
    if (!email) return error('Thiếu email', 400)
    const result = createResetCode(email)
    if (result) {
      await sendMessage({ type: 'PASSWORD_RESET', email: result.user.email, code: result.code })
      console.log(`Đã tạo mã đặt lại mật khẩu cho ${result.user.email}.`)
    }
    return success({ message: 'Nếu email tồn tại, mã xác nhận đã được gửi.' })
  } catch (err) {
    return fromError(err)
  }
}

// POST /auth/verify-code — kiểm tra mã trước khi cho nhập mật khẩu mới (không tiêu thụ mã).
export const verifyCode = async (event) => {
  try {
    const { email, code } = parseBody(event)
    if (!email || !code) return error('Thiếu email hoặc mã xác nhận', 400)
    checkResetCode(email, code)
    return success({ message: 'Mã xác nhận hợp lệ' })
  } catch (err) {
    return fromError(err)
  }
}

// POST /auth/reset-password
export const resetPassword = async (event) => {
  try {
    const { email, code, newPassword } = parseBody(event)
    if (!email || !code || !newPassword) return error('Thiếu email, mã xác nhận hoặc mật khẩu mới', 400)
    const policyError = validatePassword(newPassword)
    if (policyError) return error(policyError, 400)

    checkResetCode(email, code, { consume: true })
    const user = setPassword(email, newPassword)
    console.log(`User ${user.email} đã đặt lại mật khẩu.`)
    return success({ message: 'Đặt lại mật khẩu thành công' })
  } catch (err) {
    return fromError(err)
  }
}

export default { login, completeNewPassword, getMe, updateMe, changePassword, forgotPassword, verifyCode, resetPassword }
