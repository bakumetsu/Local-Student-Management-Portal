import { table, TABLE } from '../../common/db.js'
import { success, error, fromError } from '../../common/response.js'
import { withAuth } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const classId = event.pathParameters?.classId || event.pathParameters?.id
    if (!classId) {
      return error('Thiếu tham số id lớp học', 400)
    }

    const item = table(TABLE.CLASSES).get(classId)
    if (!item) {
      return error('Không tìm thấy lớp học', 404)
    }

    return success(item)
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi lấy chi tiết lớp học')
  }
}

export const handler = withAuth(baseHandler)
