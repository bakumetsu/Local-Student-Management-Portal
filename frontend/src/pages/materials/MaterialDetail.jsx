import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getMaterialById } from '../../services/materialService'

export default function MaterialDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [material, setMaterial] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMaterialById(id)
      .then(res => setMaterial(res.data))
      .catch(err => setError(err.message || 'Không thể tải tài liệu.'))
  }, [id])

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Chi Tiết Tài Liệu" />
        <main className="main-content">
          {material ? (
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3>{material.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Môn học: <strong>{material.subject}</strong>
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '24px' }}>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <strong>Tên tệp:</strong> <span style={{ float: 'right' }}>{material.fileName}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <strong>Loại tài liệu:</strong> <span style={{ float: 'right' }} className="badge badge-info">{material.type}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <strong>Ngày đăng tải:</strong> <span style={{ float: 'right' }}>{material.uploadedAt ? new Date(material.uploadedAt).toLocaleDateString() : 'Chưa rõ'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => navigate('/materials')}>Quay lại</button>
                <a href={material.fileUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                  Tải xuống
                </a>
              </div>
            </div>
          ) : error ? <div className="alert alert-danger">{error}</div> : <p>Đang tải chi tiết tài liệu...</p>}
        </main>
      </div>
    </div>
  )
}
