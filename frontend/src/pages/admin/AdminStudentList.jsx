import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getStudents } from '../../services/studentService'

export default function AdminStudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('ALL')
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await getStudents()
      setStudents(res.data.students || res.data || [])
    } catch (e) {
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRefresh = () => {
    load()
    setMessage('Đã làm mới dữ liệu sinh viên.')
  }

  const filtered = students.filter(s => {
    const matchesSearch = !search || s.fullName.toLowerCase().includes(search.toLowerCase()) || s.studentId.includes(search)
    const matchesClass = classFilter === 'ALL' || s.className === classFilter
    return matchesSearch && matchesClass
  })

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Danh Sách Sinh Viên Chỉ Đọc (Học thuật)" />
        <main className="main-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>Hồ Sơ Học Thuật Sinh Viên</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={handleRefresh}>Làm mới</button>
              <Link to="/admin/students/new" className="btn btn-primary">Thêm sinh viên</Link>
            </div>
          </div>

          {message && <div className="alert alert-success" style={{ marginBottom: '15px' }}>{message}</div>}

          <div className="toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sinh viên (Mã SV, họ tên...)"
              style={{ flex: 1 }}
            />
            <select
              className="form-control"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{ maxWidth: '150px' }}
            >
              <option value="ALL">Tất cả lớp</option>
              <option value="SEC01">Lớp SEC01</option>
              <option value="1">Lớp 1</option>
            </select>
          </div>

          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <div className="card">
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Mã Sinh Viên</th>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Lớp học</th>
                    <th>Ngành học</th>
                    <th>GPA</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td>{s.studentId}</td>
                      <td>{s.fullName}</td>
                      <td>{s.email}</td>
                      <td>{s.className || 'Chưa gán'}</td>
                      <td>{s.major}</td>
                      <td><strong>{s.gpa || '—'}</strong></td>
                      <td>
                        <Link to={`/students/${s.id || s.studentId}`} className="btn btn-sm btn-outline">Xem chi tiết</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
