import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { completeNewPassword, getUserRole } from '../../services/authService'

export default function NewPassword() {
  const location = useLocation()
  const session = location.state?.session
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Chỉ vào được trang này từ bước đăng nhập (cần session đổi mật khẩu).
  if (!session) return <Navigate to="/login" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) return setError('Mật khẩu phải dài tối thiểu 8 ký tự')
    if (password !== confirmPassword) return setError('Mật khẩu xác nhận không khớp')

    setLoading(true)
    setError('')
    try {
      await completeNewPassword(session, password)
      setMessage('Đổi mật khẩu lần đầu thành công! Đang chuyển hướng đến Dashboard...')
      setTimeout(() => {
        navigate(getUserRole() === 'Admin' ? '/admin/dashboard' : '/dashboard')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Đổi mật khẩu thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Đổi mật khẩu lần đầu</h1>
        <p className="login-subtitle">Tài khoản của bạn được khởi tạo bởi Admin, vui lòng đổi mật khẩu để tiếp tục</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label">Mật khẩu mới</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}
