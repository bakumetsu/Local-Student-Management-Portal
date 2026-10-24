import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { resetPassword } from '../../services/authService'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email] = useState(location.state?.email || '')
  const [code] = useState(location.state?.code || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email || !code) {
      setError('Thiếu email hoặc mã xác nhận. Vui lòng thực hiện lại bước Quên mật khẩu.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await resetPassword(email, code, password)
      setMessage('Mật khẩu đã được thiết lập lại thành công!')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Không thể đặt lại mật khẩu.')
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="card" style={{ width: '400px', padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--color-primary)' }}>Đặt Lại Mật Khẩu</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleReset}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label">Mật khẩu mới</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>Đặt lại mật khẩu</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/verify-code', { state: { email } })}>Quay lại</button>
          </div>
        </form>
      </div>
    </div>
  )
}
