import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const classId = event.pathParameters?.classId || event.pathParameters?.id
    if (!classId) {
      return error('Thiếu tham số id lớp học', 400)
    }

    const data = parseBody(event)
    const { className, room, studentCount, schedule } = data

    const updates = {}
    if (className !== undefined) {
      if (String(className).trim() === '') return error('className không được để trống', 400)
      updates.className = className
    }
    if (room !== undefined) updates.room = room
    if (studentCount !== undefined) {
      const count = Number(studentCount)
      if (!Number.isFinite(count) || count < 0) return error('studentCount phải là số không âm', 400)
      updates.studentCount = count
    }
    if (schedule !== undefined) updates.schedule = schedule

    if (Object.keys(updates).length === 0) {
      return error('Không có thông tin nào để cập nhật', 400)
    }

    const updated = table(TABLE.CLASSES).update(classId, { ...updates, updatedAt: new Date().toISOString() })
    if (!updated) return error('Không tìm thấy lớp học', 404)

    return success({ message: 'Cập nhật lớp học thành công', class: updated })
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi cập nhật lớp học')
  }
}

export const handler = requireRole('Admin')(baseHandler)
