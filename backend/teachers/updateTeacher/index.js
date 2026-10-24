import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { validateTeacher } from '../../common/validators.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return error('Thiếu id', 400)
    const data = parseBody(event)

    const repo = table(TABLE.TEACHERS)
    const current = repo.get(id)
    if (!current) return error('Không tìm thấy giáo viên', 404)

    const fields = ['fullName', 'email', 'phone', 'department', 'degree', 'subject']
    const updates = {}
    for (const f of fields) {
      if (data[f] !== undefined) updates[f] = data[f]
    }

    // Kiểm tra lại dữ liệu sau khi gộp để không lưu email/khoa rỗng.
    const errs = validateTeacher({ ...current, ...updates })
    if (errs.length > 0) return error(errs.join('; '), 400)

    const teacher = repo.update(id, { ...updates, updatedAt: new Date().toISOString() })
    return success({ message: 'Cập nhật thành công', teacher })
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Admin')(baseHandler)
