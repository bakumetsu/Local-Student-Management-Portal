// materials/saveMaterialMetadata/index.js
import fs from 'node:fs'
import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { sendMessage } from '../../common/queue.js'
import { resolveKey, withDownloadUrl } from '../../common/storage.js'
import { requireRole, currentUser } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const data = parseBody(event)
    const { title, subject, type, fileName, s3Key } = data
    if (!title || !subject || !s3Key) return error('Thiếu title, subject hoặc s3Key', 400)
    if (!String(s3Key).startsWith('materials/')) return error('s3Key không hợp lệ', 400)
    if (!fs.existsSync(resolveKey(s3Key))) return error('File chưa được upload', 400)

    const now = new Date().toISOString()
    const item = {
      id: `${type || 'other'}-${Date.now()}`,
      title,
      subject,
      type: type || 'other',
      fileName,
      s3Key,
      uploadedBy: currentUser(event)?.email || '',
      createdAt: now,
      uploadedAt: now
    }

    table(TABLE.MATERIALS).insert(item)
    await sendMessage({ type: 'MATERIAL_UPLOADED', material: item })

    return success({ message: 'Lưu tài liệu thành công', material: await withDownloadUrl(item) }, 201)
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Teacher')(baseHandler)
