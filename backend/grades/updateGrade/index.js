import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { validateGrade } from '../../common/validators.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return error('Thiếu id', 400)
    const data = parseBody(event)

    const fields = ['subject', 'semester', 'score', 'note']
    const updates = {}
    for (const f of fields) {
      if (data[f] !== undefined) updates[f] = f === 'score' ? Number(data[f]) : data[f]
    }
    if (Object.keys(updates).length === 0) return error('Không có trường nào để cập nhật', 400)

    const repo = table(TABLE.GRADES)
    const current = repo.get(id)
    if (!current) return error('Không tìm thấy điểm', 404)

    // Kiểm tra lại sau khi gộp (vd. score ngoài khoảng 0-10).
    const errs = validateGrade({ ...current, ...updates })
    if (errs.length > 0) return error(errs.join('; '), 400)

    const grade = repo.update(id, updates)
    return success({ message: 'Cập nhật điểm thành công', grade })
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Teacher')(baseHandler)
