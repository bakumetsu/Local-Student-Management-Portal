// backend/documents/getStudentDocuments/index.js
import { table, TABLE } from '../../common/db.js'
import { success, error, fromError } from '../../common/response.js'
import { withDownloadUrl } from '../../common/storage.js'
import { requireRole } from '../../common/authMiddleware.js'
import { canAccessStudent } from '../access.js'

const baseHandler = async (event) => {
  try {
    // Endpoint mới: /students/{studentId}/documents
    // Endpoint cũ: /documents/metadata?studentId=...
    const studentId = event.pathParameters?.studentId || event.pathParameters?.id ||
      event.queryStringParameters?.studentId

    if (!studentId) {
      return error('Thiếu studentId trong path hoặc query', 400)
    }
    if (!canAccessStudent(event, studentId)) return error('Không có quyền xem hồ sơ của sinh viên này', 403)

    const items = table(TABLE.DOCUMENTS).findBy('studentId', String(studentId))
    // Mỗi lần đọc cấp URL tải về mới có chữ ký (thay cho URL S3 công khai).
    const documents = await Promise.all(items.map(withDownloadUrl))

    return success({
      documents,
      count: documents.length,
      studentId: String(studentId)
    })
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi lấy tài liệu')
  }
}

export const handler = requireRole('Student')(baseHandler)
