import { table, TABLE } from '../../common/db.js'
import { success, error, fromError } from '../../common/response.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const classId = event.pathParameters?.classId || event.pathParameters?.id
    if (!classId) {
      return error('Thiếu tham số id lớp học', 400)
    }

    if (!table(TABLE.CLASSES).remove(classId)) return error('Không tìm thấy lớp học', 404)

    return success({ message: 'Xóa lớp học thành công' })
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi xóa lớp học')
  }
}

export const handler = requireRole('Admin')(baseHandler)
