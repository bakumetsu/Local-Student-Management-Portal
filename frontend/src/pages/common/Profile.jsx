import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { getCurrentUserAttributes, getUserRole } from '../../services/authService'

export default function Profile() {
  const [profile, setProfile] = useState({
    email: '',
    name: '',
    phone: '',
    gender: 'Nam',
    major: 'Công nghệ thông tin',
    status: 'Đang học'
  })
  const [loading, setLoading] = useState(true)
  const role = getUserRole() || 'Admin'

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const attrs = await getCurrentUserAttributes()
        if (attrs) {
          setProfile(prev => ({
            ...prev,
            email: attrs.email || '',
            name: attrs.name || attrs.email || 'Hệ thống Admin',
            phone: attrs.phone_number || ''
          }))
        }
      } catch (e) {
        console.error('Lỗi load profile:', e)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Hồ Sơ Cá Nhân" />
        <main className="main-content">
          {loading ? (
            <p>Đang tải thông tin cá nhân...</p>
          ) : (
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: '0 auto 12px'
                }}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <h2>{profile.name}</h2>
                <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>{role}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                  <strong>Email:</strong> <span style={{ float: 'right' }}>{profile.email}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                  <strong>Số điện thoại:</strong> <span style={{ float: 'right' }}>{profile.phone}</span>
                </div>
                {role === 'Student' && (
                  <>
                    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                      <strong>Ngành học:</strong> <span style={{ float: 'right' }}>{profile.major}</span>
                    </div>
                    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                      <strong>Trạng thái:</strong> <span style={{ float: 'right' }}>{profile.status}</span>
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link to="/profile/edit" className="btn btn-primary">Chỉnh sửa hồ sơ</Link>
                <Link to="/change-password" className="btn btn-outline">Đổi mật khẩu</Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
