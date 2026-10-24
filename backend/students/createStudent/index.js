import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { validateStudent } from '../../common/validators.js'
import { sendMessage } from '../../common/queue.js'
import { provisionAccount } from '../../common/accounts.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const data = parseBody(event)
    const errors = validateStudent(data)
    if (errors.length > 0) return error(errors.join('; '), 400)

    const item = {
      id: String(data.studentId),
      studentId: String(data.studentId),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '',
      gender: data.gender || '',
      dateOfBirth: data.dateOfBirth || '',
      major: data.major || '',
      className: data.className || '',
      status: data.status || 'Active',
      gpa: data.gpa !== undefined && data.gpa !== null && data.gpa !== '' ? Number(data.gpa) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // insert() trả 409 nếu mã sinh viên đã tồn tại (không ghi đè ngầm).
    table(TABLE.STUDENTS).insert(item)

    // Tạo tài khoản đăng nhập nhóm Student (mật khẩu tạm gửi qua email).
    await provisionAccount({ email: data.email, role: 'Student', name: data.fullName })

    // Đưa vào hàng đợi để worker gửi email chào mừng.
    await sendMessage({ type: 'STUDENT_CREATED', student: item })

    return success({ message: 'Tạo sinh viên thành công', student: item }, 201)
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Staff')(baseHandler)
