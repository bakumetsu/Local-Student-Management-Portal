// common/accounts.js
// Tạo tài khoản đăng nhập kèm email mời (thay cho Cognito AdminCreateUser + DesiredDeliveryMediums EMAIL).
import { createUser, getUser } from './users.js'
import { sendMessage } from './queue.js'

// Tạo tài khoản nếu chưa có; trả về user mới hoặc null nếu email đã có tài khoản.
export async function provisionAccount({ email, role, name = '', password }) {
  if (getUser(email)) {
    console.warn(`⚠️ Tài khoản ${email} đã tồn tại, bỏ qua bước tạo tài khoản.`)
    return null
  }
  console.log(`Tạo tài khoản đăng nhập (${role}) cho ${email}...`)
  const { user, temporaryPassword } = createUser({ email, role, name, password })
  await sendMessage({ type: 'USER_CREATED', email: user.email, role, temporaryPassword })
  return user
}

export default { provisionAccount }
