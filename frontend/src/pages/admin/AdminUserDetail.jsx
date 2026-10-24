import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { listUsers } from '../../services/adminService'

export default function AdminUserDetail() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await listUsers()
        const found = (res.data.users || res.data || []).find(u => u.username === username)
        if (found) {
          setUser(found)
        } else {
          setError('Không tìm thấy tài khoản.')
        }
      } catch (err) {
        console.error(err)
        setError('Lỗi khi tải thông tin chi tiết tài khoản.')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [username])

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Chi Tiết Tài Khoản" />
        <main className="main-content">
          {error && <div className="alert alert-danger">{error}</div>}
          
          {loading ? (
            <div className="loading-center"><div className="spinner" /><span>Đang tải...</span></div>
          ) : user ? (
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Thông tin tài khoản</h3>
                <span className={`badge ${user.enabled ? 'badge-success' : 'badge-danger'}`}>
                  {user.enabled ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '24px' }}>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <strong>Email đăng nhập:</strong> <span style={{ float: 'right' }}>{user.email || user.username}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <strong>Trạng thái tài khoản:</strong> <span style={{ float: 'right' }} className="badge badge-info">{user.status}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <strong>Nhóm quyền gắn liền:</strong> 
                  <span style={{ float: 'right' }}>
                    {(user.groups || []).map((g, i) => (
                      <span key={i} className="badge badge-success" style={{ marginLeft: '4px' }}>{g}</span>
                    ))}
                  </span>
                </div>
                {user.createdAt && (
                  <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                    <strong>Ngày khởi tạo:</strong> <span style={{ float: 'right' }}>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => navigate('/admin/users')}>Quay lại</button>
                <Link to={`/admin/users/${username}/edit`} className="btn btn-primary">Chỉnh sửa</Link>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
