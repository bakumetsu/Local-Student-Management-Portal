// src/pages/UploadDocument.jsx
import { useState } from 'react'
import { Upload, FileText } from 'lucide-react'
import Layout from '../../components/Layout'
import { createUploadUrl, saveDocumentMetadata } from '../../services/documentService'

const DOC_TYPES = [
  { value: 'transcript', label: 'Bảng điểm' },
  { value: 'identity', label: 'CCCD/CMND' },
  { value: 'avatar', label: 'Ảnh sinh viên' },
  { value: 'certificate', label: 'Giấy xác nhận' },
  { value: 'other', label: 'Hồ sơ khác' }
]

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default function UploadDocument() {
  const [studentId, setStudentId] = useState('')
  const [docType, setDocType] = useState('transcript')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    setStatus({ type: '', message: '' })
    if (!studentId) return setStatus({ type: 'danger', message: 'Vui lòng nhập mã sinh viên.' })
    if (!file) return setStatus({ type: 'danger', message: 'Vui lòng chọn file.' })

    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) return setStatus({ type: 'danger', message: 'Chỉ cho phép file PDF, JPG, PNG.' })
    if (file.size > MAX_SIZE) return setStatus({ type: 'danger', message: 'File tối đa 5MB.' })

    setLoading(true)
    try {
      const { data } = await createUploadUrl({
        fileName: file.name,
        contentType: file.type,
        studentId,
        docType
      })

      const putRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      })
      if (!putRes.ok) throw new Error((await putRes.json().catch(() => ({}))).message || 'Không thể tải file lên')

      await saveDocumentMetadata({
        studentId,
        fileName: file.name,
        docType,
        s3Key: data.s3Key,
        documentId: data.documentId
      })

      setStatus({ type: 'success', message: 'Tải lên thành công! Email xác nhận đang được gửi.' })
      setFile(null)
    } catch (err) {
      setStatus({ type: 'danger', message: err.message || 'Tải lên thất bại.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Upload Document">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload tài liệu</h1>
          <p className="page-description">Tải hồ sơ sinh viên lên hệ thống bằng URL upload có chữ ký.</p>
        </div>
      </div>

      {status.message && <div className={`alert alert-${status.type}`}>{status.message}</div>}

      <div className="card">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Mã sinh viên *</label>
            <input className="form-input" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="SV001" />
          </div>
          <div className="form-group">
            <label className="form-label">Loại hồ sơ *</label>
            <select className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Chọn file (PDF, JPG, PNG - tối đa 5MB)</label>
            <input className="form-input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
            <Upload size={16} /> {loading ? 'Đang tải lên...' : 'Tải lên'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2 className="card-title">Hướng dẫn</h2>
        <p className="card-description">
          <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          File được upload trực tiếp lên kho lưu trữ của server qua URL có chữ ký (hết hạn sau 5 phút). Sau khi upload, metadata được lưu vào database và hệ thống gửi email xác nhận qua hàng đợi nội bộ + SMTP.
        </p>
      </div>
    </Layout>
  )
}
