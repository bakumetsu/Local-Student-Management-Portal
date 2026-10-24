import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { validateTeacher } from '../../common/validators.js'
import { sendMessage } from '../../common/queue.js'
import { provisionAccount } from '../../common/accounts.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const data = parseBody(event)
    const errs = validateTeacher(data)
    if (errs.length > 0) return error(errs.join('; '), 400)

    const item = {
      id: String(data.teacherId),
      teacherId: String(data.teacherId),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '',
      department: data.department,
      degree: data.degree || '',
      subject: data.subject || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // insert() trả 409 nếu mã giáo viên đã tồn tại (không ghi đè ngầm).
    table(TABLE.TEACHERS).insert(item)

    // Giáo viên được gán nhóm Staff như trước đây (để quản lý sinh viên và điểm).
    await provisionAccount({ email: data.email, role: 'Staff', name: data.fullName })
    await sendMessage({ type: 'TEACHER_CREATED', teacher: item })

    return success({ message: 'Tạo giáo viên thành công', teacher: item }, 201)
  } catch (err) {
    return fromError(err)
  }
}

// Teachers require Admin role
export const handler = requireRole('Admin')(baseHandler)
