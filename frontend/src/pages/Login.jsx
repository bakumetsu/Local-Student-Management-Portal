import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, getUserRole } from '../services/authService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await login(email, password)
      // Tài khoản do Admin tạo phải đổi mật khẩu tạm ở lần đăng nhập đầu.
      if (result?.challenge === 'NEW_PASSWORD_REQUIRED') {
        navigate('/new-password', { state: { session: result.session, email: result.email } })
        return
      }
      const role = getUserRole()
      if (role === 'Admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="card" style={{ width: '400px', padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--color-primary)' }}>ĐĂNG NHẬP</h2>
        {error && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label">Email / Tài khoản</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhapemail@example.com"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            <Link to="/forgot-password" style={{ textAlign: 'center', textDecoration: 'none', fontSize: '14px', color: 'var(--color-primary)' }}>
              Quên mật khẩu
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
