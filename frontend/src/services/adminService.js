import api from './api'

export const listUsers = () => api.get('/admin/users')
export const createUser = (data) => api.post('/admin/users', data)
export const toggleUser = (username, enabled) => api.post(`/admin/users/${encodeURIComponent(username)}/toggle`, { enabled })
export const deleteUser = (username) => api.delete(`/admin/users/${encodeURIComponent(username)}`)
export const updateUser = (username, data) => api.put(`/admin/users/${encodeURIComponent(username)}`, data)
export const getActivityLogs = (params = {}) => api.get('/admin/logs', { params })

export default { listUsers, createUser, toggleUser, deleteUser, updateUser, getActivityLogs }
