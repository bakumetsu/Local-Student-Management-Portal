// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getSessionTokens } from './services/authService'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyCode from './pages/auth/VerifyCode'
import ResetPassword from './pages/auth/ResetPassword'
import NewPassword from './pages/auth/NewPassword'
import Welcome from './pages/Welcome'

import Dashboard from './pages/Dashboard'
import Profile from './pages/common/Profile'
import ProfileEdit from './pages/common/ProfileEdit'
import ChangePassword from './pages/common/ChangePassword'
import Notifications from './pages/common/Notifications'

import StudentList from './pages/students/StudentList'
import StudentCreate from './pages/students/StudentCreate'
import StudentEdit from './pages/students/StudentEdit'
import StudentDetail from './pages/students/StudentDetail'
import UploadDocument from './pages/students/UploadDocument'
import StudentDocuments from './pages/students/StudentDocuments'

import TeacherList from './pages/teachers/TeacherList'
import TeacherCreate from './pages/teachers/TeacherCreate'
import TeacherDetail from './pages/teachers/TeacherDetail'
import TeacherEdit from './pages/teachers/TeacherEdit'

import GradeList from './pages/grades/GradeList'
import TeacherGrades from './pages/grades/TeacherGrades'
import GradeEdit from './pages/grades/GradeEdit'
import GradeCreate from './pages/grades/GradeCreate'
import GradeDetail from './pages/grades/GradeDetail'

import UploadMaterial from './pages/materials/UploadMaterial'
import StudentMaterials from './pages/materials/StudentMaterials'
import MaterialEdit from './pages/materials/MaterialEdit'
import MaterialDetail from './pages/materials/MaterialDetail'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRoles from './pages/admin/AdminRoles'
import AdminLogs from './pages/admin/AdminLogs'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUserCreate from './pages/admin/AdminUserCreate'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminUserEdit from './pages/admin/AdminUserEdit'
import AdminStudentList from './pages/admin/AdminStudentList'
import AdminTeacherList from './pages/admin/AdminTeacherList'
import AdminStudentCreate from './pages/admin/AdminStudentCreate'
import AdminTeacherCreate from './pages/admin/AdminTeacherCreate'

import ClassList from './pages/teachers/ClassList'
import ClassDetail from './pages/teachers/ClassDetail'

import Forbidden from './pages/errors/Forbidden'
import NotFound from './pages/errors/NotFound'

function AppInit({ children }) {
  const [authState, setAuthState] = useState('initializing') // 'initializing' | 'authenticated' | 'login-needed'

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSessionTokens()
        if (session && session.tokens?.idToken) {
          console.log('✅ Đã đăng nhập từ trước')
          setAuthState('authenticated')
        } else {
          setAuthState('login-needed')
        }
      } catch (err) {
        console.log('🔑 Chưa có session đăng nhập:', err)
        setAuthState('login-needed')
      }
    }

    checkSession()
  }, [])

  if (authState === 'initializing') {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1 className="login-title">Student Portal</h1>
          <p className="login-subtitle">Đang khởi tạo...</p>
        </div>
      </div>
    )
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<ProfileEdit />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/notifications" element={<Notifications />} />
                  
                  <Route path="/students" element={<StudentList />} />
                  <Route path="/students/new" element={<StudentCreate />} />
                  <Route path="/students/:id" element={<StudentDetail />} />
                  <Route path="/students/:id/edit" element={<StudentEdit />} />
                  <Route path="/students/:id/documents" element={<StudentDocuments />} />
                  <Route path="/documents/upload" element={<UploadDocument />} />
                  
                  <Route path="/teachers" element={<TeacherList />} />
                  <Route path="/teachers/new" element={<TeacherCreate />} />
                  <Route path="/teachers/:id" element={<TeacherDetail />} />
                  <Route path="/teachers/:id/edit" element={<TeacherEdit />} />
                  
                  <Route path="/classes" element={<ClassList />} />
                  <Route path="/classes/:classId" element={<ClassDetail />} />
                  
                  <Route path="/grades" element={<GradeList />} />
                  <Route path="/grades/new" element={<GradeCreate />} />
                  <Route path="/grades/:id" element={<GradeDetail />} />
                  <Route path="/grades/:id/edit" element={<GradeEdit />} />
                  <Route path="/teacher-grades" element={<TeacherGrades />} />
                  
                  <Route path="/materials/upload" element={<UploadMaterial />} />
                  <Route path="/materials" element={<StudentMaterials />} />
                  <Route path="/materials/:id" element={<MaterialDetail />} />
                  <Route path="/materials/:id/edit" element={<MaterialEdit />} />
                  
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/users/create" element={<AdminUserCreate />} />
                  <Route path="/admin/users/:username" element={<AdminUserDetail />} />
                  <Route path="/admin/users/:username/edit" element={<AdminUserEdit />} />
                  <Route path="/admin/students" element={<AdminStudentList />} />
                  <Route path="/admin/students/new" element={<AdminStudentCreate />} />
                  <Route path="/admin/teachers" element={<AdminTeacherList />} />
                  <Route path="/admin/teachers/new" element={<AdminTeacherCreate />} />
                  <Route path="/admin/roles" element={<AdminRoles />} />
                  <Route path="/admin/logs" element={<AdminLogs />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  
                  <Route path="/403" element={<Forbidden />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppInit>
    </BrowserRouter>
  )
}
