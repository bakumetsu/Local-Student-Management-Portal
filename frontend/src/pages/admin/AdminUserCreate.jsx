import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { createUser } from '../../services/adminService'

export default function AdminUserCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', role: 'Student', password: 'Abc12345!' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await createUser({
        email: form.email,
        role: form.role,
        password: form.password
      })
      setMessage(`Đã tạo thành công tài khoản ${form.email} (Quyền: ${form.role})!`)
      setTimeout(() => {
        navigate('/admin/users')
      }, 1500)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || err.message || 'Khởi tạo tài khoản thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Thêm Tài Khoản Mới" />
        <main className="main-content">
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3>Tạo tài khoản đăng nhập</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Mật khẩu tạm thời sẽ được tự động gửi qua email đăng ký. Người dùng phải thay đổi mật khẩu ở lần đăng nhập đầu tiên.
            </p>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Email tài khoản</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Vai trò / Nhóm quyền</label>
                <select
                  className="form-control"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Student">Sinh viên (Student group)</option>
                  <option value="Staff">Giáo viên / Cán bộ (Staff group)</option>
                  <option value="Admin">Quản trị viên (Admin group)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Mật khẩu tạm thời</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/users')}>Hủy</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
