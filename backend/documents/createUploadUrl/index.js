import { success, error, parseBody, fromError } from '../../common/response.js'
import { getUploadSignedUrl, safeFileName, safeSegment } from '../../common/storage.js'
import { requireRole } from '../../common/authMiddleware.js'
import { canAccessStudent } from '../access.js'

const baseHandler = async (event) => {
  try {
    const data = parseBody(event)
    const { fileName, contentType, studentId, documentId } = data
    if (!fileName || !studentId) return error('Thiếu fileName hoặc studentId', 400)
    if (!canAccessStudent(event, studentId)) return error('Không có quyền upload hồ sơ cho sinh viên này', 403)

    const docId = safeSegment(documentId || `DOC${Date.now()}`)
    const key = `documents/${safeSegment(studentId)}/${docId}-${safeFileName(fileName)}`
    const uploadUrl = await getUploadSignedUrl(key, contentType || 'application/octet-stream')

    return success({
      uploadUrl,
      s3Key: key,
      documentId: docId
    })
  } catch (err) {
    return fromError(err)
  }
}

// Chỉ Student hoặc Staff (Admin luôn được phép).
export const handler = requireRole(['Student', 'Staff'])(baseHandler)
