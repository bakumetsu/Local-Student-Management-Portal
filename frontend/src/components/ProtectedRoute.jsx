// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { hasValidSession, clearSession } from '../services/authService'

export default function ProtectedRoute({ children }) {
  // Kiểm tra token tồn tại, đúng định dạng JWT và chưa hết hạn.
  // (Chữ ký token do server xác minh ở mỗi request.)
  if (!hasValidSession()) {
    console.log('🔒 Không có phiên đăng nhập hợp lệ, chuyển hướng đến đăng nhập')
    clearSession()
    return <Navigate to="/login" replace />
  }

  return children
}
