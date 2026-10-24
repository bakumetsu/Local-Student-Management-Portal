import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getCurrentUserAttributes, updateCurrentUserAttributes } from '../../services/authService'

export default function ProfileEdit() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    gender: 'Nam',
    address: ''
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const attrs = await getCurrentUserAttributes()
        if (attrs) {
          setProfile({
            name: attrs.name || attrs.email.split('@')[0],
            phone: attrs.phone_number || '',
            gender: 'Nam',
            address: 'Hà Nội, Việt Nam'
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleAvatarChange = () => {
    setMessage('Mô phỏng chọn và thay đổi ảnh đại diện thành công!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // Họ tên và số điện thoại được lưu vào tài khoản; giới tính/địa chỉ chỉ hiển thị.
      await updateCurrentUserAttributes({ name: profile.name, phone: profile.phone })
      setMessage('Cập nhật hồ sơ cá nhân thành công!')
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Không thể cập nhật hồ sơ.')
      setSaving(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Chỉnh Sửa Hồ Sơ" />
        <main className="main-content">
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'var(--color-primary)'
                }}>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleAvatarChange}>
                  Đổi ảnh đại diện
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Giới tính</label>
                  <select
                    className="form-control"
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Địa chỉ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => navigate('/profile')}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>Lưu thay đổi</button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
