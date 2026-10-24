import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import Layout from '../../components/Layout'
import { createUploadUrl, saveMaterialMetadata } from '../../services/materialService'

export default function UploadMaterial() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [type, setType] = useState('slide')
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    setStatus({ type: '', message: '' })
    if (!title || !subject) return setStatus({ type: 'danger', message: 'Vui lòng nhập tiêu đề và môn học.' })
    if (!file) return setStatus({ type: 'danger', message: 'Vui lòng chọn file.' })

    setLoading(true)
    try {
      const { data } = await createUploadUrl({ fileName: file.name, contentType: file.type || 'application/octet-stream', type })
      const contentType = file.type || 'application/octet-stream'
      const putRes = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file })
      if (!putRes.ok) throw new Error((await putRes.json().catch(() => ({}))).message || 'Không thể tải file lên')
      await saveMaterialMetadata({ title, subject, type, fileName: file.name, s3Key: data.s3Key })
      setStatus({ type: 'success', message: 'Tải tài liệu lên thành công!' })
      setTitle(''); setSubject(''); setFile(null)
      setTimeout(() => {
        navigate('/materials')
      }, 1500)
    } catch (err) {
      setStatus({ type: 'danger', message: err.message || 'Tải lên thất bại.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Upload Material">
      <div className="page-header">
        <div>
          <h1 className="page-title">Upload tài liệu học tập</h1>
          <p className="page-description">Tải tài liệu (PDF, slide...) lên hệ thống.</p>
        </div>
      </div>

      {status.message && <div className={`alert alert-${status.type}`} style={{ marginBottom: '15px' }}>{status.message}</div>}

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label className="form-label">Tiêu đề tài liệu</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Slide chương 1..."
          />
        </div>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label className="form-label">Tên môn học</label>
          <input
            type="text"
            className="form-control"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="An toàn thông tin..."
          />
        </div>
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label className="form-label">Loại tài liệu</label>
          <select
            className="form-control"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="slide">Slide giảng dạy</option>
            <option value="exercise">Bài tập</option>
            <option value="exam">Đề thi mẫu</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">File tài liệu</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="file"
              id="file-select"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button className="btn btn-outline" onClick={() => document.getElementById('file-select').click()}>Chọn file</button>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              {file ? file.name : 'Chưa có file nào được chọn'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={() => navigate('/materials')}>Hủy</button>
          <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
            <Upload size={16} /> Tải lên
          </button>
        </div>
      </div>
    </Layout>
  )
}
