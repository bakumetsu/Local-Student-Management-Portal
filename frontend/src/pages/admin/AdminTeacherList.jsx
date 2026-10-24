import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import api from '../../services/api'

export default function AdminTeacherList() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/teachers')
      setTeachers(res.data.teachers || res.data || [])
    } catch (e) {
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRefresh = () => {
    load()
    setMessage('Đã làm mới danh sách giáo viên.')
  }

  const filtered = teachers.filter(t => {
    const matchesSearch = !search || t.fullName.toLowerCase().includes(search.toLowerCase()) || t.teacherId.includes(search)
    const matchesDept = deptFilter === 'ALL' || t.department === deptFilter
    return matchesSearch && matchesDept
  })

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Danh Sách Giáo Viên Chỉ Đọc" />
        <main className="main-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>Đội Ngũ Giảng Viên</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" onClick={handleRefresh}>Làm mới</button>
              <Link to="/admin/teachers/new" className="btn btn-primary">Thêm giáo viên</Link>
            </div>
          </div>

          {message && <div className="alert alert-success" style={{ marginBottom: '15px' }}>{message}</div>}

          <div className="toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm giảng viên (Mã GV, họ tên...)"
              style={{ flex: 1 }}
            />
            <select
              className="form-control"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ maxWidth: '180px' }}
            >
              <option value="ALL">Tất cả khoa</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>

          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <div className="card">
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Mã Giáo Viên</th>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Khoa giảng dạy</th>
                    <th>Môn học phụ trách</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td>{t.teacherId}</td>
                      <td>{t.fullName}</td>
                      <td>{t.email}</td>
                      <td>{t.department}</td>
                      <td>{t.subject || 'Chưa phân công'}</td>
                      <td>
                        <Link to={`/teachers/${t.id || t.teacherId}`} className="btn btn-sm btn-outline">Xem chi tiết</Link>
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
