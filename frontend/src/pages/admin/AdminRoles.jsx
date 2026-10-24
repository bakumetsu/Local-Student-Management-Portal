import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const mockGroupRoles = [
  { group: 'Admin', description: 'Toàn quyền cấu hình tài khoản, phân lớp, xem nhật ký hệ thống', usersCount: 2, status: 'Active' },
  { group: 'Staff', description: 'Giảng viên giảng dạy, nhập điểm số, upload tài liệu học thuật', usersCount: 3, status: 'Active' },
  { group: 'Student', description: 'Sinh viên xem kết quả điểm, xem thông tin cá nhân và tải slide', usersCount: 5, status: 'Active' }
]

export default function AdminRoles() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState(mockGroupRoles)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [editDesc, setEditDesc] = useState('')
  const [message, setMessage] = useState('')

  const handleToggleStatus = (groupName) => {
    setGroups(groups.map(g => {
      if (g.group === groupName) {
        const next = g.status === 'Active' ? 'Suspended' : 'Active'
        setMessage(`Đã cập nhật trạng thái hoạt động nhóm ${groupName} thành: ${next}`)
        return { ...g, status: next }
      }
      return g
    }))
  }

  const handleEdit = (g) => {
    setSelectedGroup(g)
    setEditDesc(g.description)
  }

  const handleSave = () => {
    setGroups(groups.map(g => {
      if (g.group === selectedGroup.group) {
        return { ...g, description: editDesc }
      }
      return g
    }))
    setMessage(`Đã lưu cập nhật vai trò nhóm ${selectedGroup.group} thành công.`)
    setSelectedGroup(null)
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Quản Lý Vai Trò và Phân Nhóm Quyền" />
        <main className="main-content">
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>User Groups Status</h2>
          </div>

          {message && <div className="alert alert-success" style={{ marginBottom: '15px' }}>{message}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: selectedGroup ? '1.5fr 1fr' : '1fr', gap: '20px' }}>
            <div className="card">
              <table className="table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Tên Nhóm</th>
                    <th>Mô Tả Quyền Hạn</th>
                    <th>Số User</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td><strong>{g.group}</strong></td>
                      <td>{g.description}</td>
                      <td>{g.usersCount}</td>
                      <td>
                        <span className={`badge ${g.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                          {g.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-sm btn-outline" onClick={() => handleEdit(g)}>Cập nhật vai trò</button>
                          <button className={`btn btn-sm ${g.status === 'Active' ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggleStatus(g.group)}>
                            {g.status === 'Active' ? 'Khóa/Mở khóa' : 'Khóa/Mở khóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedGroup && (
              <div className="card">
                <h3>Cập nhật vai trò nhóm {selectedGroup.group}</h3>
                <div className="form-group" style={{ marginBottom: '15px', marginTop: '15px' }}>
                  <label className="form-label">Mô tả vai trò</label>
                  <textarea
                    className="form-control"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={4}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedGroup(null)}>Hủy</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}>Lưu</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
