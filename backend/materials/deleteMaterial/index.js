// materials/deleteMaterial/index.js
import { table, TABLE } from '../../common/db.js'
import { success, error, fromError } from '../../common/response.js'
import { deleteObject } from '../../common/storage.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return error('Thiếu id', 400)

    const repo = table(TABLE.MATERIALS)
    const current = repo.get(id)
    if (!current) return error('Không tìm thấy tài liệu', 404)

    repo.remove(id)
    await deleteObject(current.s3Key)
    return success({ message: 'Xóa tài liệu thành công' })
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Teacher')(baseHandler)
