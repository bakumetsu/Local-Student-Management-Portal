// materials/getMaterialById/index.js
import { table, TABLE } from '../../common/db.js'
import { success, error, fromError } from '../../common/response.js'
import { withDownloadUrl } from '../../common/storage.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return error('Thiếu id', 400)
    const item = table(TABLE.MATERIALS).get(id)
    if (!item) return error('Không tìm thấy tài liệu', 404)
    return success(await withDownloadUrl(item))
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole(['Student', 'Teacher'])(baseHandler)
