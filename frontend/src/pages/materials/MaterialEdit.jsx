import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getMaterialById, updateMaterial, createUploadUrl } from '../../services/materialService'

export default function MaterialEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', subject: '', type: 'slide', fileName: '' })
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMaterialById(id)
      .then(res => setForm(res.data))
      .catch(err => setError(err.message || 'Không thể tải tài liệu.'))
  }, [id])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setForm({ ...form, fileName: e.target.files[0].name })
      setMessage('Đã chọn file thay thế thành công.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const changes = { title: form.title, subject: form.subject, type: form.type }
      // Nếu chọn file thay thế: upload file mới qua URL có chữ ký rồi gửi s3Key mới.
      if (file) {
        const { data } = await createUploadUrl({ fileName: file.name, contentType: file.type || 'application/octet-stream', type: form.type || 'other' })
        const res = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file })
        if (!res.ok) throw new Error('Upload file thay thế thất bại.')
        changes.s3Key = data.s3Key
        changes.fileName = file.name
      }
      await updateMaterial(id, changes)
      setMessage('Cập nhật thay đổi tài liệu học tập thành công!')
      setTimeout(() => {
        navigate('/materials')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại.')
      setSaving(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Chỉnh Sửa Tài Liệu Giảng Dạy" />
        <main className="main-content">
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Tiêu đề tài liệu</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Môn học</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Tên file đính kèm: <strong>{form.fileName || 'N/A'}</strong></label>
                <div style={{ marginTop: '5px' }}>
                  <input
                    type="file"
                    id="replace-file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button type="button" className="btn btn-outline" onClick={() => document.getElementById('replace-file').click()}>Thay file</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/materials')}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
