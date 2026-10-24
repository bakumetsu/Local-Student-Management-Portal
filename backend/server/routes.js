// server/routes.js
// Bảng định tuyến thay cho API Gateway: [method, path, handler].
// Mọi path được mount dưới tiền tố /api.
import * as auth from '../auth/index.js'

import { handler as createStudent } from '../students/createStudent/index.js'
import { handler as deleteStudent } from '../students/deleteStudent/index.js'
import { handler as getStudentById } from '../students/getStudentById/index.js'
import { handler as getStudents } from '../students/getStudents/index.js'
import { handler as updateStudent } from '../students/updateStudent/index.js'

import { handler as createTeacher } from '../teachers/createTeacher/index.js'
import { handler as deleteTeacher } from '../teachers/deleteTeacher/index.js'
import { handler as getTeacherById } from '../teachers/getTeacherById/index.js'
import { handler as getTeachers } from '../teachers/getTeachers/index.js'
import { handler as updateTeacher } from '../teachers/updateTeacher/index.js'

import { handler as createClass } from '../classes/createClass/index.js'
import { handler as deleteClass } from '../classes/deleteClass/index.js'
import { handler as getClassById } from '../classes/getClassById/index.js'
import { handler as getClasses } from '../classes/getClasses/index.js'
import { handler as updateClass } from '../classes/updateClass/index.js'

import { handler as createGrade } from '../grades/createGrade/index.js'
import { handler as deleteGrade } from '../grades/deleteGrade/index.js'
import { handler as getGradeById } from '../grades/getGradeById/index.js'
import { handler as getGrades } from '../grades/getGrades/index.js'
import { handler as updateGrade } from '../grades/updateGrade/index.js'

import { handler as createDocumentUploadUrl } from '../documents/createUploadUrl/index.js'
import { handler as getStudentDocuments } from '../documents/getStudentDocuments/index.js'
import { handler as saveDocumentMetadata } from '../documents/saveDocumentMetadata/index.js'

import { handler as createMaterialUploadUrl } from '../materials/createUploadUrl/index.js'
import { handler as getMaterials } from '../materials/getMaterials/index.js'
import { handler as getMaterialById } from '../materials/getMaterialById/index.js'
import { handler as saveMaterialMetadata } from '../materials/saveMaterialMetadata/index.js'
import { handler as updateMaterial } from '../materials/updateMaterial/index.js'
import { handler as deleteMaterial } from '../materials/deleteMaterial/index.js'

import { handler as listUsers } from '../admin/listUsers/index.js'
import { handler as createUser } from '../admin/createUser/index.js'
import { handler as updateUser } from '../admin/updateUser/index.js'
import { handler as deleteUser } from '../admin/deleteUser/index.js'
import { handler as toggleUser } from '../admin/toggleUser/index.js'
import { handler as getLogs } from '../admin/getLogs/index.js'

// Các route xác thực công khai bị giới hạn tần suất để chống dò mật khẩu / mã OTP.
export const RATE_LIMITED = new Set([
  '/auth/login', '/auth/complete-new-password', '/auth/forgot-password', '/auth/verify-code', '/auth/reset-password'
])

export const routes = [
  ['POST', '/auth/login', auth.login],
  ['POST', '/auth/complete-new-password', auth.completeNewPassword],
  ['GET', '/auth/me', auth.getMe],
  ['PUT', '/auth/me', auth.updateMe],
  ['POST', '/auth/change-password', auth.changePassword],
  ['POST', '/auth/forgot-password', auth.forgotPassword],
  ['POST', '/auth/verify-code', auth.verifyCode],
  ['POST', '/auth/reset-password', auth.resetPassword],

  ['GET', '/students', getStudents],
  ['POST', '/students', createStudent],
  ['GET', '/students/:id', getStudentById],
  ['PUT', '/students/:id', updateStudent],
  ['DELETE', '/students/:id', deleteStudent],
  ['GET', '/students/:studentId/documents', getStudentDocuments],
  ['POST', '/students/:studentId/documents', saveDocumentMetadata],

  ['GET', '/teachers', getTeachers],
  ['POST', '/teachers', createTeacher],
  ['GET', '/teachers/:id', getTeacherById],
  ['PUT', '/teachers/:id', updateTeacher],
  ['DELETE', '/teachers/:id', deleteTeacher],

  ['GET', '/classes', getClasses],
  ['POST', '/classes', createClass],
  ['GET', '/classes/:id', getClassById],
  ['PUT', '/classes/:id', updateClass],
  ['DELETE', '/classes/:id', deleteClass],

  ['GET', '/grades', getGrades],
  ['POST', '/grades', createGrade],
  ['GET', '/grades/:id', getGradeById],
  ['PUT', '/grades/:id', updateGrade],
  ['DELETE', '/grades/:id', deleteGrade],

  ['POST', '/documents/upload-url', createDocumentUploadUrl],
  ['POST', '/documents/metadata', saveDocumentMetadata],
  ['GET', '/documents/metadata', getStudentDocuments],

  ['GET', '/materials', getMaterials],
  ['POST', '/materials/upload-url', createMaterialUploadUrl],
  ['POST', '/materials/metadata', saveMaterialMetadata],
  ['GET', '/materials/:id', getMaterialById],
  ['PUT', '/materials/:id', updateMaterial],
  ['DELETE', '/materials/:id', deleteMaterial],

  ['GET', '/admin/users', listUsers],
  ['POST', '/admin/users', createUser],
  ['PUT', '/admin/users/:username', updateUser],
  ['DELETE', '/admin/users/:username', deleteUser],
  ['POST', '/admin/users/:username/toggle', toggleUser],
  ['GET', '/admin/logs', getLogs]
]

export default routes
