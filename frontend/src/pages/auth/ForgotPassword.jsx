import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { forgotPassword } from '../../services/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setMessage('Yêu cầu gửi mã OTP thành công. Vui lòng check hòm thư email của bạn.')
      setTimeout(() => {
        navigate('/verify-code', { state: { email } })
      }, 1500)
    } catch (err) {
      setError(err.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="card" style={{ width: '400px', padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--color-primary)' }}>Quên Mật Khẩu</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
          Nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã OTP xác nhận về hòm thư của bạn.
        </p>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Email tài khoản</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhapemail@example.com"
              required
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Gửi mã xác nhận
            </button>
            <Link to="/login" className="btn btn-outline" style={{ textAlign: 'center', textDecoration: 'none' }}>
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
