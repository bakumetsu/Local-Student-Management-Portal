// teachers/deleteTeacher/index.js
import { table, TABLE } from '../../common/db.js'
import { success, error, fromError } from '../../common/response.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return error('Thiếu id', 400)

    if (!table(TABLE.TEACHERS).remove(id)) return error('Không tìm thấy giáo viên', 404)
    return success({ message: 'Xóa thành công' })
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Admin')(baseHandler)
