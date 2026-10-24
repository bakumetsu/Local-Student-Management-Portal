import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getStudents } from '../../services/studentService'
import { listUsers } from '../../services/adminService'
import api from '../../services/api'

export default function AdminDashboard() {
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const studentRes = await getStudents()
        setStudents(studentRes.data.students || studentRes.data || [])

        const teacherRes = await api.get('/teachers')
        setTeachers(teacherRes.data.teachers || teacherRes.data || [])

        const usersRes = await listUsers()
        const userList = usersRes.data.users || usersRes.data || []
        setUsersCount(userList.length)
      } catch (e) {
        console.error("Lỗi tải thông số tổng quan admin:", e)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

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
                  <div className="stat-value">{usersCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Nhóm quyền</div>
                  <div className="stat-value">3 Groups</div>
                </div>
              </div>

              <div className="card" style={{ marginTop: '24px' }}>
                <h3 className="card-title">Phím tắt nhanh Admin</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to="/admin/users" className="btn btn-primary" style={{ textDecoration: 'none' }}>Quản lý tài khoản</Link>
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
