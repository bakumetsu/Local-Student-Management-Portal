import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { verifyResetCode, forgotPassword } from '../../services/authService'

export default function VerifyCode() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!email) return setError('Thiếu email. Vui lòng quay lại bước Quên mật khẩu.')
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await verifyResetCode(email, code.trim())
      setMessage('Xác nhận mã OTP thành công!')
      setTimeout(() => {
        navigate('/reset-password', { state: { email, code: code.trim() } })
      }, 1200)
    } catch (err) {
      setError(err.message || 'Mã xác thực không đúng hoặc đã hết hạn.')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return setError('Thiếu email. Vui lòng quay lại bước Quên mật khẩu.')
    setError('')
    try {
      await forgotPassword(email)
      setMessage('Mã OTP xác nhận mới đã được gửi lại vào email của bạn.')
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã.')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-alt)' }}>
      <div className="card" style={{ width: '400px', padding: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--color-primary)' }}>Xác Nhận Mã OTP</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
          Mã xác thực đã được gửi đến: <strong style={{ color: 'var(--color-text)' }}>{email || 'email của bạn'}</strong>.
        </p>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleVerify}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Mã xác thực OTP (6 chữ số)</label>
            <input
              type="text"
              className="form-control"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>Xác nhận mã</button>
            <button type="button" className="btn btn-secondary" onClick={handleResend}>Gửi lại mã</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/forgot-password')}>Quay lại</button>
          </div>
        </form>
      </div>
    </div>
  )
}
