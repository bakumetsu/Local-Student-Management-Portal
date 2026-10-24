import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getStudentById } from '../../services/studentService'
import { getStudentDocuments, createUploadUrl, saveDocumentMetadata } from '../../services/documentService'

export default function StudentDocuments() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [student, setStudent] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [fileType, setFileType] = useState('transcript')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const studentRes = await getStudentById(id)
        setStudent(studentRes.data)
        
        const docRes = await getStudentDocuments(id)
        setDocuments(docRes.data.documents || [])
      } catch (err) {
        console.error(err)
        setError('Không thể tải hồ sơ sinh viên.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return setError('Vui lòng chọn file cần upload')

    setUploading(true)
    setError('')
    setMessage('')
    try {
      // 1. Lấy URL upload có chữ ký từ server
      const uploadRes = await createUploadUrl({
        fileName: file.name,
        contentType: file.type,
        studentId: id,
        docType: fileType
      })
      const { uploadUrl, s3Key, documentId } = uploadRes.data

      // 2. Upload file trực tiếp lên kho lưu trữ
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      })
      if (!putRes.ok) throw new Error((await putRes.json().catch(() => ({}))).message || 'Không thể tải file lên')

      // 3. Lưu metadata vào database
      await saveDocumentMetadata({
        studentId: id,
        fileName: file.name,
        docType: fileType,
        s3Key,
        documentId
      }, id)

      setMessage('Tải hồ sơ lên thành công!')
      setFile(null)
      
      // Reload danh sách tài liệu
      const docRes = await getStudentDocuments(id)
      setDocuments(docRes.data.documents || [])
    } catch (err) {
      console.error(err)
      setError('Upload thất bại: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Quản Lý Hồ Sơ Sinh Viên" />
        <main className="main-content">
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <h3>Hồ sơ học tập sinh viên: {student?.fullName} ({student?.studentId})</h3>
                <p style={{ margin: 0 }}>Ngành: {student?.major || 'N/A'} | Lớp: {student?.className || 'N/A'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* Upload Form */}
                <div className="card">
                  <h4>Tải lên hồ sơ mới</h4>
                  {message && <div className="alert alert-success">{message}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}

                  <form onSubmit={handleUpload}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label className="form-label">Chọn tệp (PDF, JPG, PNG)</label>
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label">Loại hồ sơ</label>
                      <select
                        className="form-control"
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                      >
                        <option value="transcript">Bảng điểm</option>
                        <option value="id_card">CCCD/CMND</option>
                        <option value="diploma">Bằng tốt nghiệp</option>
                        <option value="other">Hồ sơ khác</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                      {uploading ? 'Đang tải lên...' : 'Tải tài liệu lên'}
                    </button>
                  </form>
                </div>

                {/* Documents List */}
                <div className="card">
                  <h4>Danh sách hồ sơ đã lưu</h4>
                  {documents.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Chưa có tài liệu nào được tải lên cho sinh viên này.</p>
                  ) : (
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '10px' }}>Tên File</th>
                          <th style={{ textAlign: 'left', padding: '10px' }}>Loại</th>
                          <th style={{ textAlign: 'left', padding: '10px' }}>Ngày Tải Lên</th>
                          <th style={{ textAlign: 'center', padding: '10px' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc, idx) => (
                          <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '10px' }}>{doc.fileName}</td>
                            <td style={{ padding: '10px' }}>
                              <span className="badge badge-info">{doc.fileType || 'other'}</span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-sm btn-outline"
                                style={{ display: 'inline-block', textDecoration: 'none' }}
                              >
                                Tải về
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
