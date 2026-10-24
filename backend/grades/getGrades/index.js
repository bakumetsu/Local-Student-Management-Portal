import { table, TABLE } from '../../common/db.js'
import { success, fromError } from '../../common/response.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async () => {
  try {
    const grades = table(TABLE.GRADES).scan()
    return success({ grades, count: grades.length })
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Teacher')(baseHandler)
