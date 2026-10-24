// materials/createUploadUrl/index.js
import { success, error, parseBody, fromError } from '../../common/response.js'
import { getUploadSignedUrl, safeFileName, safeSegment } from '../../common/storage.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const data = parseBody(event)
    const { fileName, contentType, type } = data
    if (!fileName || !type) return error('Thiếu fileName hoặc type', 400)

    const key = `materials/${safeSegment(type)}/${Date.now()}-${safeFileName(fileName)}`
    const uploadUrl = await getUploadSignedUrl(key, contentType || 'application/octet-stream')

    return success({
      uploadUrl,
      s3Key: key
    })
  } catch (err) {
    return fromError(err)
  }
}

// Giáo viên upload tài liệu (Admin/Staff luôn được phép) — cùng quyền với bước lưu metadata.
export const handler = requireRole('Teacher')(baseHandler)
