import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { listUsers, updateUser } from '../../services/adminService'

export default function AdminUserEdit() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', role: 'Student', enabled: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await listUsers()
        const found = (res.data.users || res.data || []).find(u => u.username === username)
        if (found) {
          setForm({
            email: found.email || found.username,
            role: found.groups?.includes('Admin') ? 'Admin' : found.groups?.includes('Staff') ? 'Staff' : 'Student',
            enabled: found.enabled
          })
        } else {
          setError('Không tìm thấy tài khoản.')
        }
      } catch (err) {
        console.error(err)
        setError('Lỗi khi tải thông tin tài khoản.')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [username])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await updateUser(username, {
        role: form.role,
        enabled: form.enabled
      })
      setMessage('Cập nhật quyền và trạng thái hoạt động thành công!')
      setTimeout(() => {
        navigate(`/admin/users/${username}`)
      }, 1500)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || err.message || 'Cập nhật tài khoản thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Sửa Trạng Thái và Nhóm Quyền" />
        <main className="main-content">
          {error && <div className="alert alert-danger" style={{ maxWidth: '600px', margin: '0 auto 15px' }}>{error}</div>}
          {message && <div className="alert alert-success" style={{ maxWidth: '600px', margin: '0 auto 15px' }}>{message}</div>}

          {loading ? (
            <div className="loading-center"><div className="spinner" /><span>Đang tải...</span></div>
          ) : (
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Email tài khoản</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    disabled
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label className="form-label">Nhóm quyền hạn (Role)</label>
                  <select
                    className="form-control"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="Student">Sinh viên (Student)</option>
                    <option value="Staff">Giáo viên / Cán bộ (Staff)</option>
                    <option value="Admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={form.enabled}
                    onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="enabled" className="form-label" style={{ margin: 0 }}>Cho phép hoạt động (Enabled)</label>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" onClick={() => navigate(`/admin/users/${username}`)} disabled={saving}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
