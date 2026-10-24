import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { listUsers, toggleUser, deleteUser } from '../../services/adminService'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listUsers()
      setUsers(res.data.users || res.data || [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách tài khoản.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleToggleEnable = async (username, currentStatus) => {
    setMessage('')
    setError('')
    try {
      const nextState = !currentStatus
      await toggleUser(username, nextState)
      setMessage(`Đã ${nextState ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản ${username} thành công.`)
      load()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Thay đổi trạng thái tài khoản thất bại.')
    }
  }

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản ${username}?`)) return
    setMessage('')
    setError('')
    try {
      await deleteUser(username)
      setMessage(`Đã xóa tài khoản ${username} thành công.`)
      load()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Xóa tài khoản thất bại.')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Quản Lý Tài Khoản Người Dùng" />
        <main className="main-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>Users</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline" onClick={load} disabled={loading}>Làm mới</button>
              <Link to="/admin/users/create" className="btn btn-primary">Thêm tài khoản</Link>
            </div>
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /><span>Đang tải...</span></div>
          ) : users.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-title">Không tìm thấy tài khoản nào</div>
              </div>
            </div>
          ) : (
            <div className="card">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Email / Username</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Trạng Thái</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Nhóm Quyền (Groups)</th>
                    <th style={{ textAlign: 'center', padding: '12px' }}>Hoạt Động</th>
                    <th style={{ textAlign: 'center', padding: '12px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px' }}>{user.email || user.username}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${user.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {(user.groups || []).map((g, gIdx) => (
                          <span key={gIdx} className="badge badge-info" style={{ marginRight: '4px' }}>{g}</span>
                        ))}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ color: user.enabled ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 'bold' }}>
                          {user.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <Link to={`/admin/users/${user.username}`} className="btn btn-sm btn-outline">Xem</Link>
                          <button 
                            className={`btn btn-sm ${user.enabled ? 'btn-danger' : 'btn-primary'}`}
                            onClick={() => handleToggleEnable(user.username, user.enabled)}
                          >
                            {user.enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteUser(user.username)}
                          >
                            Xóa
                          </button>
                        </div>
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
