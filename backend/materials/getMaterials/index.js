// materials/getMaterials/index.js
import { table, TABLE } from '../../common/db.js'
import { success, fromError } from '../../common/response.js'
import { withDownloadUrl } from '../../common/storage.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async () => {
  try {
    const materials = await Promise.all(table(TABLE.MATERIALS).scan().map(withDownloadUrl))
    return success({ materials, count: materials.length })
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole(['Student', 'Teacher'])(baseHandler)
