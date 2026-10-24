import { table, TABLE } from '../../common/db.js'
import { success, fromError } from '../../common/response.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async () => {
  try {
    const students = table(TABLE.STUDENTS).scan()
    return success({ students, count: students.length })
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Staff')(baseHandler)
