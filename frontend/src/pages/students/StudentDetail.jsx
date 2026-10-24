import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Pencil, Upload, ArrowLeft } from 'lucide-react'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import { getStudentById } from '../../services/studentService'
import { getStudentDocuments } from '../../services/documentService'
import { getUserRole } from '../../services/authService'

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const role = getUserRole() || 'Student'
  const isAdmin = role === 'Admin'
  const isTeacher = role === 'Staff' || role === 'Teacher'

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getStudentById(id),
      getStudentDocuments(id).catch(() => ({ documents: [] }))
    ])
      .then(([studentRes, docRes]) => {
        setStudent(studentRes.data)
        setDocuments(docRes.documents || docRes.data?.documents || [])
      })
      .catch(() => setStudent(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Layout title="Student Detail"><div className="loading-center"><div className="spinner" /><span>Đang tải...</span></div></Layout>
  if (!student) return <Layout title="Student Detail"><div className="card"><div className="empty-state"><div className="empty-state-title">Không tìm thấy sinh viên</div></div></div></Layout>

  const fields = [
    ['Mã sinh viên', student.studentId],
    ['Họ tên', student.fullName],
    ['Email', student.email],
    ['Số điện thoại', student.phone],
    ['Giới tính', student.gender],
    ['Ngày sinh', student.dateOfBirth],
    ['Ngành', student.major],
    ['Lớp', student.className]
  ]

  return (
    <Layout title="Student Detail">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{student.fullName}</h1>
          <p className="page-description">Mã sinh viên: {student.studentId}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(isAdmin || isTeacher) && (
            <>
              <Link to={`/students/${id}/edit`} className="btn btn-primary"><Pencil size={16} /> Chỉnh sửa</Link>
              <Link to="/grades" className="btn btn-outline">Xem điểm</Link>
            </>
          )}
          <button className="btn btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Quay lại</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title">Thông tin cơ bản</h2>
        <div className="detail-grid">
          {fields.map(([label, value]) => (
            <div className="detail-item" key={label}>
              <span className="detail-label">{label}</span>
              <span className="detail-value">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Danh sách hồ sơ học bạ</h2>
          {(isAdmin || isTeacher) && (
            <Link to={`/students/${id}/documents`} className="btn btn-outline btn-sm"><Upload size={16} /> Upload hồ sơ</Link>
          )}
        </div>
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Chưa có hồ sơ</div>
            <div className="empty-state-description">Chưa có tệp tin học bạ nào được upload.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Tên file</th><th>Loại</th><th>Ngày</th></tr>
              </thead>
              <tbody>
                {documents.map((d, i) => (
                  <tr key={i}>
                    <td>{d.fileName}</td>
                    <td>{d.type}</td>
                    <td>{d.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
