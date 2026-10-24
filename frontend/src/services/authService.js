// src/services/authService.js
// Các hàm xác thực với backend tự host (thay cho Cognito/AWS Amplify).
import api from './api'

const TOKEN_KEY = 'idToken'

// Giải mã payload JWT (không xác minh chữ ký — việc đó do server làm).
const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

const getPayload = () => {
  const idToken = localStorage.getItem(TOKEN_KEY)
  return idToken ? decodeToken(idToken) : null
}

const saveToken = (idToken) => {
  localStorage.setItem(TOKEN_KEY, idToken)
  localStorage.removeItem('accessToken') // khóa cũ của Amplify
}

// Token còn hạn (có trừ hao 30 giây lệch đồng hồ).
export const hasValidSession = () => {
  const payload = getPayload()
  return Boolean(payload?.exp && payload.exp * 1000 > Date.now() + 30000)
}

// Trả về { challenge: 'NEW_PASSWORD_REQUIRED', session, email } nếu phải đổi mật khẩu lần đầu.
export const login = async (username, password) => {
  try {
    const { data } = await api.post('/auth/login', { email: username, password })
    if (data.challenge) return data
    saveToken(data.idToken)
    return data.user
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.')
    }
    throw error
  }
}

export const completeNewPassword = async (session, newPassword) => {
  const { data } = await api.post('/auth/complete-new-password', { session, newPassword })
  saveToken(data.idToken)
  return data.user
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('accessToken')
}

export const logout = async () => {
  clearSession()
}

// Giữ tương thích với code cũ: trả về session hiện tại nếu token còn hạn.
export const getSessionTokens = async () => {
  if (!hasValidSession()) {
    clearSession()
    return { tokens: null }
  }
  return { tokens: { idToken: localStorage.getItem(TOKEN_KEY) } }
}

// Thuộc tính người dùng: { sub, email, name, phone_number, role }
export const getCurrentUserAttributes = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

export const updateCurrentUserAttributes = async ({ name, phone }) => {
  const { data } = await api.put('/auth/me', { name, phone })
  return data
}

export const changePassword = async (oldPassword, newPassword) => {
  const { data } = await api.post('/auth/change-password', { oldPassword, newPassword })
  saveToken(data.idToken) // token cũ bị thu hồi sau khi đổi mật khẩu
  return data
}

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const verifyResetCode = (email, code) => api.post('/auth/verify-code', { email, code })
export const resetPassword = (email, code, newPassword) => api.post('/auth/reset-password', { email, code, newPassword })

export const getUserRole = () => {
  const payload = getPayload()
  if (!payload) return null
  const groups = payload.groups || []
  if (groups.includes('Admin')) return 'Admin'
  if (groups.includes('Staff')) return 'Staff'
  if (groups.includes('Student')) return 'Student'
  if (groups.includes('Teacher')) return 'Teacher'
  return 'User'
}

export const getUserEmail = () => {
  const payload = getPayload()
  return payload ? payload.email || payload.sub || null : null
}

export default {
  login, logout, completeNewPassword, getSessionTokens, getCurrentUserAttributes, updateCurrentUserAttributes,
  changePassword, forgotPassword, verifyResetCode, resetPassword, getUserRole, getUserEmail, hasValidSession
}
