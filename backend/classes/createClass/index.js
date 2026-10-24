import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { validateClass } from '../../common/validators.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const data = parseBody(event)
    const errs = validateClass(data)
    if (errs.length > 0) {
      return error(errs.join('; '), 400)
    }

    const item = {
      id: String(data.classId),
      classId: String(data.classId),
      className: data.className,
      room: data.room || '',
      studentCount: data.studentCount !== undefined ? Number(data.studentCount) : 0,
      schedule: data.schedule || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    table(TABLE.CLASSES).insert(item)
    return success({ message: 'Tạo lớp học thành công', class: item }, 201)
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi tạo lớp học')
  }
}

export const handler = requireRole('Admin')(baseHandler)
