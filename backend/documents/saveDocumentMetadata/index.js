import fs from 'node:fs'
import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { sendMessage } from '../../common/queue.js'
import { resolveKey, safeSegment, withDownloadUrl } from '../../common/storage.js'
import { requireRole, currentUser } from '../../common/authMiddleware.js'
import { canAccessStudent } from '../access.js'

const baseHandler = async (event) => {
  try {
    const data = parseBody(event)

    let studentId = data.studentId
    if (!studentId && (event.pathParameters?.studentId || event.pathParameters?.id)) {
      studentId = event.pathParameters.studentId || event.pathParameters.id
    }
    if (!studentId) return error('Thiếu studentId', 400)
    studentId = String(studentId)
    if (!canAccessStudent(event, studentId)) return error('Không có quyền lưu hồ sơ cho sinh viên này', 403)

    const { fileName, fileType, docType, s3Key } = data
    if (!fileName || !s3Key) return error('Thiếu fileName hoặc s3Key', 400)

    // s3Key phải thuộc thư mục của đúng sinh viên và file phải đã được upload.
    if (!String(s3Key).startsWith(`documents/${safeSegment(studentId)}/`)) return error('s3Key không thuộc sinh viên này', 400)
    if (!fs.existsSync(resolveKey(s3Key))) return error('File chưa được upload', 400)

    const actualDocumentId = String(data.documentId || `DOC${Date.now()}`)

    const item = {
      id: `${studentId}-${actualDocumentId}`,
      studentId,
      documentId: actualDocumentId,
      fileName,
      fileType: fileType || docType || 'other',
      s3Key,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser(event)?.email || data.uploadedBy || 'unknown'
    }

    table(TABLE.DOCUMENTS).put(item)

    await sendMessage({
      type: 'DOCUMENT_UPLOADED',
      document: item
    })

    return success({
      message: 'Lưu metadata thành công',
      document: await withDownloadUrl(item)
    }, 201)
  } catch (err) {
    return fromError(err, 'Lỗi máy chủ khi lưu metadata')
  }
}

export const handler = requireRole('Student')(baseHandler)
