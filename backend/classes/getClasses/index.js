import { table, TABLE } from '../../common/db.js'
import { success, fromError } from '../../common/response.js'
import { withAuth } from '../../common/authMiddleware.js'

const baseHandler = async () => {
  try {
    const classes = table(TABLE.CLASSES).scan()
    return success({ classes, count: classes.length })
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi lấy danh sách lớp học')
  }
}

export const handler = withAuth(baseHandler)
