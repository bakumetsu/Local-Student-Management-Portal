import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    systemName: 'Student Management Portal',
    maxUploadSize: '10MB',
    emailSender: 'noreply@example.com',
    storage: 'Local (data/uploads)',
    maintenanceMode: false
  })
  const [message, setMessage] = useState('')

  const handleSave = (e) => {
    e.preventDefault()
    setMessage('Đã lưu cấu hình hệ thống thành công!')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Cấu Hình Hệ Thống" />
        <main className="main-content">
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Tên cổng thông tin</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Kích thước file upload tối đa</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.maxUploadSize}
                  onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Email gửi thông báo (SMTP)</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.emailSender}
                  disabled
                />
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label className="form-label">Kho lưu trữ file</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.storage}
                  disabled
                />
              </div>
              <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="maintenance"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="maintenance" className="form-label" style={{ margin: 0 }}>Bật chế độ bảo trì hệ thống</label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ float: 'right' }}>
                Lưu cấu hình
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
