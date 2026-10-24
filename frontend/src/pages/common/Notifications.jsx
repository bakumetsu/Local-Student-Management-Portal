import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const mockNotifications = [
  { id: 1, title: 'Hệ thống cập nhật thông tin học tập', body: 'Lịch học quân sự đợt 2 bắt đầu từ ngày 15/09.', date: '10/09/2026', read: false },
  { id: 2, title: 'Thông báo điểm thi môn học', body: 'Điểm số môn Lập trình ứng dụng Web đã được công bố.', date: '08/09/2026', read: true }
]

export default function Notifications() {
  const [list, setList] = useState(mockNotifications)
  const [detail, setDetail] = useState(null)
  const [message, setMessage] = useState('')

  const handleMarkAllRead = () => {
    setList(list.map(n => ({ ...n, read: true })))
    setMessage('Đã đánh dấu tất cả thông báo là đã đọc.')
  }

  const handleDelete = (id) => {
    setList(list.filter(n => n.id !== id))
    if (detail?.id === id) setDetail(null)
    setMessage('Đã xóa thông báo thành công.')
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Thông Báo Hệ Thống" />
        <main className="main-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>Thông báo ({list.filter(n => !n.read).length} chưa đọc)</h2>
            <button className="btn btn-primary" onClick={handleMarkAllRead}>Đánh dấu tất cả đã đọc</button>
          </div>

          {message && <div className="alert alert-success" style={{ marginBottom: '15px' }}>{message}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 1fr' : '1fr', gap: '20px' }}>
            <div className="card">
              {list.length === 0 ? (
                <p>Không có thông báo nào.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {list.map((n) => (
                    <div 
                      key={n.id} 
                      style={{ 
                        border: '1px solid var(--color-border)', 
                        padding: '12px', 
                        borderRadius: '6px',
                        backgroundColor: n.read ? 'transparent' : 'var(--color-primary-light)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>{n.title}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{n.date}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => setDetail(n)}>Xem chi tiết</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)}>Xóa thông báo</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {detail && (
              <div className="card">
                <h3 style={{ color: 'var(--color-primary)', margin: '0 0 10px 0' }}>{detail.title}</h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '15px' }}>
                  Ngày gửi: {detail.date}
                </span>
                <p style={{ lineHeight: '1.6', fontSize: '15px' }}>{detail.body}</p>
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setDetail(null)}>Đóng chi tiết</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
