import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { validateStudent } from '../../common/validators.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return error('Thiếu id', 400)

    const data = parseBody(event)
    const repo = table(TABLE.STUDENTS)
    const current = repo.get(id)
    if (!current) return error('Không tìm thấy sinh viên', 404)

    const fields = ['fullName', 'email', 'phone', 'gender', 'dateOfBirth', 'major', 'className', 'status', 'gpa']
    const updates = {}
    for (const f of fields) {
      if (data[f] !== undefined) {
        updates[f] = f === 'gpa' ? (data[f] !== null && data[f] !== '' ? Number(data[f]) : null) : data[f]
      }
    }

    // Kiểm tra lại dữ liệu sau khi gộp để không lưu email/gpa sai.
    const errors = validateStudent({ ...current, ...updates })
    if (errors.length > 0) return error(errors.join('; '), 400)

    const student = repo.update(id, { ...updates, updatedAt: new Date().toISOString() })
    return success({ message: 'Cập nhật thành công', student })
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Staff')(baseHandler)
