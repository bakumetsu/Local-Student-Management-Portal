// materials/updateMaterial/index.js
// Cập nhật thông tin tài liệu; nếu gửi s3Key mới (đã upload qua upload-url) thì thay file và xóa file cũ.
import fs from 'node:fs'
import { table, TABLE } from '../../common/db.js'
import { success, error, parseBody, fromError } from '../../common/response.js'
import { resolveKey, deleteObject, withDownloadUrl } from '../../common/storage.js'
import { requireRole } from '../../common/authMiddleware.js'

const baseHandler = async (event) => {
  try {
    const id = event.pathParameters?.id
    if (!id) return error('Thiếu id', 400)
    const data = parseBody(event)

    const repo = table(TABLE.MATERIALS)
    const current = repo.get(id)
    if (!current) return error('Không tìm thấy tài liệu', 404)

    const updates = {}
    for (const f of ['title', 'subject', 'type']) {
      if (data[f] !== undefined) {
        if (String(data[f]).trim() === '') return error(`${f} không được để trống`, 400)
        updates[f] = data[f]
      }
    }

    const replacingFile = data.s3Key && data.s3Key !== current.s3Key
    if (replacingFile) {
      if (!String(data.s3Key).startsWith('materials/')) return error('s3Key không hợp lệ', 400)
      if (!fs.existsSync(resolveKey(data.s3Key))) return error('File mới chưa được upload', 400)
      updates.s3Key = data.s3Key
      updates.fileName = data.fileName || current.fileName
    }

    if (Object.keys(updates).length === 0) return error('Không có trường nào để cập nhật', 400)

    const material = repo.update(id, { ...updates, updatedAt: new Date().toISOString() })
    if (replacingFile) await deleteObject(current.s3Key)

    return success({ message: 'Cập nhật tài liệu thành công', material: await withDownloadUrl(material) })
  } catch (err) {
    return fromError(err)
  }
}

export const handler = requireRole('Teacher')(baseHandler)
