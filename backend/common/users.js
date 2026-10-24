// common/users.js
// Kho tài khoản tự quản lý thay cho Amazon Cognito User Pool.
// - Mật khẩu băm bằng scrypt (node:crypto), so sánh constant-time.
// - Trạng thái giữ nguyên ngữ nghĩa Cognito: FORCE_CHANGE_PASSWORD / CONFIRMED.
// - token_version tăng khi đổi mật khẩu / đổi quyền / vô hiệu hóa để thu hồi token cũ.
import crypto from 'node:crypto'
import db from './db.js'

export const ROLES = ['Admin', 'Staff', 'Teacher', 'Student', 'User']
export const STATUS = { FORCE_CHANGE_PASSWORD: 'FORCE_CHANGE_PASSWORD', CONFIRMED: 'CONFIRMED' }

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 }
const RESET_CODE_TTL_MS = 15 * 60 * 1000
const RESET_CODE_MAX_ATTEMPTS = 5

export class AuthError extends Error {
  constructor(message, statusCode = 400, code = 'AuthError') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

// Chính sách mật khẩu tương đương mặc định của Cognito.
export function validatePassword(password) {
  const p = String(password || '')
  if (p.length < 8) return 'Mật khẩu phải dài tối thiểu 8 ký tự'
  if (!/[a-z]/.test(p)) return 'Mật khẩu phải có ít nhất một chữ thường'
  if (!/[A-Z]/.test(p)) return 'Mật khẩu phải có ít nhất một chữ hoa'
  if (!/[0-9]/.test(p)) return 'Mật khẩu phải có ít nhất một chữ số'
  if (!/[^A-Za-z0-9]/.test(p)) return 'Mật khẩu phải có ít nhất một ký tự đặc biệt'
  return null
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(String(password), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p })
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${hash.toString('base64')}`
}

export function verifyPassword(password, stored) {
  try {
    const [algo, N, r, p, saltB64, hashB64] = String(stored).split('$')
    if (algo !== 'scrypt') return false
    const expected = Buffer.from(hashB64, 'base64')
    const actual = crypto.scryptSync(String(password), Buffer.from(saltB64, 'base64'), expected.length, {
      N: Number(N), r: Number(r), p: Number(p)
    })
    return crypto.timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

// Mật khẩu tạm đáp ứng chính sách (giống mật khẩu tạm Cognito gửi qua email).
export function generateTempPassword() {
  const pick = (chars) => chars[crypto.randomInt(chars.length)]
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '23456789'
  const symbols = '!@#$%^&*'
  const all = lower + upper + digits + symbols
  const chars = [pick(lower), pick(upper), pick(digits), pick(symbols)]
  while (chars.length < 12) chars.push(pick(all))
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

const toUser = (row) => row && ({
  username: row.username,
  email: row.email,
  name: row.name,
  phone: row.phone,
  role: row.role,
  status: row.status,
  enabled: row.enabled === 1,
  tokenVersion: row.token_version,
  passwordHash: row.password_hash,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

// Dạng công khai trả về cho API (không lộ password hash).
export const publicUser = (u) => u && ({
  username: u.username,
  email: u.email,
  name: u.name,
  phone: u.phone,
  status: u.status,
  enabled: u.enabled,
  groups: [u.role],
  createdAt: u.createdAt
})

const stmt = {
  get: db.prepare('SELECT * FROM users WHERE username = ?'),
  list: db.prepare('SELECT * FROM users ORDER BY created_at'),
  count: db.prepare('SELECT COUNT(*) AS n FROM users'),
  insert: db.prepare(`INSERT INTO users (username, email, name, phone, role, password_hash, status, enabled, token_version, created_at, updated_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)`),
  remove: db.prepare('DELETE FROM users WHERE username = ?')
}

export const getUser = (username) => toUser(stmt.get.get(normalizeEmail(username)))
export const listUsers = () => stmt.list.all().map(toUser)
export const countUsers = () => stmt.count.get().n

// Tạo tài khoản. Nếu không truyền password thì sinh mật khẩu tạm.
// Trả về { user, temporaryPassword }.
export function createUser({ email, role, password, name = '', phone = '', forceChange = true }) {
  const username = normalizeEmail(email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) throw new AuthError('Email không hợp lệ')
  if (!ROLES.includes(role)) throw new AuthError(`Role không hợp lệ. Cho phép: ${ROLES.join(', ')}`)
  if (getUser(username)) throw new AuthError('Tài khoản với email này đã tồn tại', 409, 'UsernameExistsException')

  const temporaryPassword = password || generateTempPassword()
  const policyError = validatePassword(temporaryPassword)
  if (policyError) throw new AuthError(policyError)

  const now = new Date().toISOString()
  stmt.insert.run(username, username, name, phone, role, hashPassword(temporaryPassword),
    forceChange ? STATUS.FORCE_CHANGE_PASSWORD : STATUS.CONFIRMED, now, now)
  return { user: getUser(username), temporaryPassword }
}

// Cập nhật một tập trường cho phép; tự tăng token_version khi cần thu hồi token.
export function updateUser(username, changes) {
  const user = getUser(username)
  if (!user) throw new AuthError('Không tìm thấy tài khoản', 404, 'UserNotFoundException')

  const columns = { name: 'name', phone: 'phone', role: 'role', status: 'status', enabled: 'enabled', passwordHash: 'password_hash' }
  const sets = []
  const values = []
  for (const [key, column] of Object.entries(columns)) {
    if (changes[key] === undefined) continue
    if (key === 'role' && !ROLES.includes(changes.role)) throw new AuthError(`Role không hợp lệ. Cho phép: ${ROLES.join(', ')}`)
    sets.push(`${column} = ?`)
    values.push(key === 'enabled' ? (changes.enabled ? 1 : 0) : String(changes[key]))
  }
  const revoke = changes.passwordHash !== undefined || changes.role !== undefined || changes.enabled === false
  if (revoke) sets.push('token_version = token_version + 1')
  if (sets.length === 0) return user

  sets.push('updated_at = ?')
  values.push(new Date().toISOString(), user.username)
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE username = ?`).run(...values)
  return getUser(user.username)
}

export function deleteUser(username) {
  const changes = stmt.remove.run(normalizeEmail(username)).changes
  if (changes === 0) throw new AuthError('Không tìm thấy tài khoản', 404, 'UserNotFoundException')
}

// Xác thực đăng nhập. Thông báo lỗi chung để không lộ email nào tồn tại.
// Hash giả để email không tồn tại vẫn tốn thời gian băm như bình thường (chống dò tài khoản qua timing).
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'))

export function authenticate(email, password) {
  const user = getUser(email)
  const ok = verifyPassword(password, user ? user.passwordHash : DUMMY_HASH) && Boolean(user)
  if (!ok) throw new AuthError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.', 401, 'NotAuthorizedException')
  if (!user.enabled) throw new AuthError('Tài khoản đã bị vô hiệu hóa', 403, 'UserDisabledException')
  return user
}

export function setPassword(username, newPassword, { confirm = true } = {}) {
  const policyError = validatePassword(newPassword)
  if (policyError) throw new AuthError(policyError)
  return updateUser(username, {
    passwordHash: hashPassword(newPassword),
    ...(confirm ? { status: STATUS.CONFIRMED } : {})
  })
}

// ---- Quên mật khẩu: mã 6 chữ số, hết hạn sau 15 phút, tối đa 5 lần thử ----

const hashCode = (code) => crypto.createHash('sha256').update(String(code)).digest('hex')

// Trả về mã (để gửi email) hoặc null nếu tài khoản không tồn tại / bị khóa.
export function createResetCode(email) {
  const user = getUser(email)
  if (!user || !user.enabled) return null
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
  db.prepare(`INSERT INTO reset_codes (username, code_hash, expires_at, attempts) VALUES (?, ?, ?, 0)
              ON CONFLICT(username) DO UPDATE SET code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0`)
    .run(user.username, hashCode(code), Date.now() + RESET_CODE_TTL_MS)
  return { user, code }
}

// Kiểm tra mã; consume = true thì xóa mã sau khi dùng thành công.
export function checkResetCode(email, code, { consume = false } = {}) {
  const username = normalizeEmail(email)
  const row = db.prepare('SELECT * FROM reset_codes WHERE username = ?').get(username)
  const invalid = new AuthError('Mã xác thực không đúng hoặc đã hết hạn', 400, 'CodeMismatchException')
  if (!row) throw invalid
  if (row.expires_at < Date.now() || row.attempts >= RESET_CODE_MAX_ATTEMPTS) {
    db.prepare('DELETE FROM reset_codes WHERE username = ?').run(username)
    throw invalid
  }
  const expected = Buffer.from(row.code_hash, 'hex')
  const actual = Buffer.from(hashCode(String(code || '').trim()), 'hex')
  if (!crypto.timingSafeEqual(expected, actual)) {
    db.prepare('UPDATE reset_codes SET attempts = attempts + 1 WHERE username = ?').run(username)
    throw invalid
  }
  if (consume) db.prepare('DELETE FROM reset_codes WHERE username = ?').run(username)
  return true
}
