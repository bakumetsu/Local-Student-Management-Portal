import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { getStudents } from '../services/studentService'
import { getUserRole, getUserEmail } from '../services/authService'
import api from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const role = getUserRole() || 'Admin'
  const email = getUserEmail() || 'User'

  useEffect(() => {
    if (role === 'Admin') {
      navigate('/admin/dashboard')
    }
  }, [role, navigate])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const studentRes = await getStudents()
        setStudents(studentRes.data.students || studentRes.data || [])

        if (role === 'Admin') {
          const teacherRes = await api.get('/teachers')
          setTeachers(teacherRes.data.teachers || teacherRes.data || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [role])

  // 1. Giao diện Dashboard cho Admin
  if (role === 'Admin') {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <Navbar title="Tổng Quan Hệ Thống (Admin)" />
          <main className="main-content">
            {loading ? (
              <div className="loading-center"><div className="spinner" /><span>Đang tải...</span></div>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Tổng Số Sinh Viên</div>
                    <div className="stat-value">{students.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Tổng Số Giáo Viên</div>
                    <div className="stat-value">{teachers.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Tài khoản người dùng</div>
                    <div className="stat-value">Đang đồng bộ</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Nhóm quyền</div>
                    <div className="stat-value">3 Groups</div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '24px' }}>
                  <h3 className="card-title">Phím tắt nhanh Admin</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to="/admin/users" className="btn btn-primary" style={{ textDecoration: 'none' }}>Xem tài khoản</Link>
                    <Link to="/admin/students" className="btn btn-outline" style={{ textDecoration: 'none' }}>Xem sinh viên</Link>
                    <Link to="/admin/teachers" className="btn btn-outline" style={{ textDecoration: 'none' }}>Xem giáo viên</Link>
                    <Link to="/admin/logs" className="btn btn-outline" style={{ textDecoration: 'none' }}>Xem nhật ký</Link>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    )
  }

  // 2. Giao diện Dashboard cho Giáo viên (Staff)
  if (role === 'Staff' || role === 'Teacher') {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper">
          <Navbar title="Cổng Thông Tin Giáo Viên" />
          <main className="main-content">
            {loading ? (
              <div className="loading-center"><div className="spinner" /><span>Đang tải...</span></div>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Lớp Phụ Trách</div>
                    <div className="stat-value">2</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Tổng Sinh Viên Của Lớp</div>
                    <div className="stat-value">{students.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Bài Đăng Tài Liệu</div>
                    <div className="stat-value">4</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Thông Báo Mới</div>
                    <div className="stat-value">1</div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '24px' }}>
                  <h3 className="card-title">Phím tắt giảng dạy</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to="/classes" className="btn btn-primary" style={{ textDecoration: 'none' }}>Xem lớp</Link>
                    <Link to="/grades" className="btn btn-outline" style={{ textDecoration: 'none' }}>Xem điểm</Link>
                    <Link to="/materials" className="btn btn-outline" style={{ textDecoration: 'none' }}>Xem tài liệu</Link>
                    <Link to="/notifications" className="btn btn-outline" style={{ textDecoration: 'none' }}>Xem thông báo</Link>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    )
  }

  // 3. Giao diện Dashboard cho Sinh viên
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Trang Tin Học Tập Sinh Viên" />
        <main className="main-content">
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
            <h2>Chào mừng quay trở lại, {email}!</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Bạn đang đăng nhập với quyền hạn Sinh viên.</p>
          </div>

          <div className="card" style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
            <h3 className="card-title">Menu thao tác sinh viên</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/profile" className="btn btn-primary" style={{ textDecoration: 'none' }}>Xem hồ sơ</Link>
              <Link to="/grades" className="btn btn-outline" style={{ textDecoration: 'none' }}>Xem điểm</Link>
              <Link to="/materials" className="btn btn-outline" style={{ textDecoration: 'none' }}>Xem tài liệu</Link>
              <Link to="/notifications" className="btn btn-outline" style={{ textDecoration: 'none' }}>Xem thông báo</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
