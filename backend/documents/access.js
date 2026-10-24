// documents/access.js
// Sinh viên (role Student) chỉ được thao tác hồ sơ của chính mình;
// Admin/Staff được thao tác mọi hồ sơ.
import { table, TABLE } from '../common/db.js'
import { currentUser } from '../common/authMiddleware.js'
import { normalizeEmail } from '../common/users.js'

export function canAccessStudent(event, studentId) {
  const user = currentUser(event)
  const groups = user?.groups || []
  if (groups.includes('Admin') || groups.includes('Staff')) return true
  const student = table(TABLE.STUDENTS).get(studentId)
  return Boolean(student) && normalizeEmail(student.email) === user.email
}

export default { canAccessStudent }
