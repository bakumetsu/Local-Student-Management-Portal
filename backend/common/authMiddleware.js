// backend/common/authMiddleware.js
// Middleware xác thực JWT (HS256) do server tự phát hành, thay cho Cognito Authorizer.
// Giữ nguyên giao diện withAuth / requireRole để các handler không phải thay đổi.
// Mỗi request đều đối chiếu với bảng users: tài khoản bị xóa, bị vô hiệu hóa hoặc
// đã đổi mật khẩu/quyền (token_version thay đổi) sẽ bị từ chối ngay.
import jwt from 'jsonwebtoken'
import config from './config.js'
import { getUser } from './users.js'
import { error } from './response.js'

const ISSUER = 'student-portal'

export function issueToken(user) {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      groups: [user.role],
      tv: user.tokenVersion
    },
    config.jwtSecret,
    { algorithm: 'HS256', subject: user.username, issuer: ISSUER, expiresIn: config.tokenTtlSeconds }
  )
}

function extractToken(event) {
  const headers = event.headers || {}
  const raw = headers.authorization || headers.Authorization || ''
  const token = raw.startsWith('Bearer ') ? raw.substring(7) : raw
  return token.trim() || null
}

// Trả về event đã gắn user, hoặc một response lỗi (có statusCode).
export const verifyToken = async (event) => {
  const token = extractToken(event)
  if (!token) return error('Thiếu Authorization header', 401)

  let claims
  try {
    claims = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'], issuer: ISSUER })
  } catch (err) {
    console.warn('JWT verification failed:', err.message)
    return error('Xác thực token thất bại', 401)
  }

  const user = getUser(claims.sub)
  if (!user || !user.enabled || user.tokenVersion !== claims.tv) {
    return error('Phiên đăng nhập không còn hiệu lực', 401)
  }

  event.requestContext = event.requestContext || {}
  event.requestContext.authorizer = {
    ...(event.requestContext.authorizer || {}),
    user: {
      username: user.username,
      email: user.email,
      name: user.name,
      groups: [user.role],
      token: claims
    }
  }
  return event
}

// Middleware wrapper cho handler: chỉ yêu cầu đăng nhập.
export const withAuth = (handler) => {
  return async (event) => {
    if (!event.requestContext?.authorizer?.user) {
      const authResult = await verifyToken(event)
      if (authResult.statusCode) return authResult
      event = authResult
    }
    return handler(event)
  }
}

// Kiểm tra quyền. requiredRole có thể là một role hoặc mảng role.
// Admin và Staff được bypass mọi kiểm tra quyền (giữ nguyên chính sách cũ).
export const requireRole = (requiredRole) => {
  const allowed = [].concat(requiredRole || [])
  return (handler) => withAuth(async (event) => {
    const groups = event.requestContext.authorizer.user.groups || []
    const permitted = allowed.length === 0 ||
      groups.includes('Admin') || groups.includes('Staff') ||
      allowed.some((role) => groups.includes(role))
    if (!permitted) return error('Không có quyền truy cập', 403)
    return handler(event)
  })
}

export const currentUser = (event) => event.requestContext?.authorizer?.user || null

export default { withAuth, requireRole, verifyToken, issueToken, currentUser }
