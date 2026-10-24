// src/services/api.js
// Cấu hình axios instance chung cho toàn bộ ứng dụng.
import axios from 'axios'

// Mặc định gọi API cùng origin (/api); đặt VITE_API_ENDPOINT nếu backend ở nơi khác.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT || '/api'
})

// Tự động đính kèm Authorization header (idToken) vào mỗi request.
api.interceptors.request.use(async (config) => {
  try {
    const token = localStorage.getItem('idToken')
    if (token) {
      config.headers.Authorization = token
    }
  } catch (e) {
    // bỏ qua nếu không lấy được token
  }
  return config
})

// Xử lý lỗi 401 -> chuyển về trang login.
api.interceptors.response.use(
  (response) => {
    // Tự động giải nén response wrapper (success: true, data: ...) từ server
    if (response.data && response.data.success === true && Object.prototype.hasOwnProperty.call(response.data, 'data')) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    // Dùng thông báo lỗi tiếng Việt từ server cho err.message
    const serverMessage = error.response?.data?.message
    if (serverMessage) error.message = serverMessage

    // Các endpoint /auth/* công khai (login, quên mật khẩu...) tự xử lý 401, không chuyển trang.
    const isPublicAuthCall = /^\/?auth\/(login|complete-new-password|forgot-password|verify-code|reset-password)/.test(error.config?.url || '')
    if (error.response && error.response.status === 401 && !isPublicAuthCall) {
      localStorage.removeItem('idToken')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
