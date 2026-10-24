import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { validateGrade } from '../../common/validators.js'
import { sendMessage } from '../../common/queue.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const data = parseBody(event)
    const errs = validateGrade(data)
    if (errs.length > 0) return error(errs.join('; '), 400)

    const item = {
      // Bỏ ký tự như "/" khỏi id để URL /grades/:id luôn hợp lệ.
      id: `${data.studentId}-${String(data.subject).trim().replace(/[^\p{L}\p{N}_-]+/gu, '_')}-${Date.now()}`,
      studentId: String(data.studentId),
      teacherId: String(data.teacherId),
      subject: data.subject,
      semester: data.semester || '',
      score: Number(data.score),
      note: data.note || '',
      createdAt: new Date().toISOString()
    }

    table(TABLE.GRADES).insert(item)
    await sendMessage({ type: 'GRADE_POSTED', grade: item })

    return success({ message: 'Đăng điểm thành công', grade: item }, 201)
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Teacher')(baseHandler)
