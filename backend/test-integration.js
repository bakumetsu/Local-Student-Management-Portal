// test-integration.js
// Kiểm thử tích hợp end-to-end: khởi động server thật trên cổng ngẫu nhiên với thư mục
// dữ liệu tạm, rồi chạy qua toàn bộ luồng nghiệp vụ qua HTTP.
// Chạy: npm test
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-test-'))
process.env.DATA_DIR = dataDir
process.env.PORT = '0'
process.env.HOST = '127.0.0.1'
delete process.env.ADMIN_PASSWORD
delete process.env.SMTP_HOST

const { main } = await import('./server/main.js')
const server = main()
await new Promise((resolve) => server.once('listening', resolve))
const base = `http://127.0.0.1:${server.address().port}`
const outbox = path.join(dataDir, 'logs', 'outbox.log')

let passed = 0
let failed = 0
async function step(name, fn) {
  try {
    await fn()
    passed++
    process.stdout.write(`  ✅ ${name}\n`)
  } catch (err) {
    failed++
    process.stdout.write(`  ❌ ${name}\n     ${err.stack?.split('\n').slice(0, 3).join('\n     ')}\n`)
  }
}

async function call(method, url, { token, body, raw, headers = {} } = {}) {
  const res = await fetch(url.startsWith('http') ? url : `${base}/api${url}`, {
    method,
    headers: {
      ...(token ? { Authorization: token } : {}),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined)
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* không phải JSON */ }
  return { status: res.status, json, text, data: json?.data }
}

// Chờ worker ghi email vào outbox rồi lấy giá trị theo regex.
async function fromOutbox(regex) {
  for (let i = 0; i < 50; i++) {
    const content = fs.existsSync(outbox) ? fs.readFileSync(outbox, 'utf8') : ''
    const matches = [...content.matchAll(new RegExp(regex, 'g'))]
    if (matches.length) return matches.at(-1)[1]
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`Không thấy email khớp ${regex} trong outbox`)
}

async function loginWithFirstChange(email, password, newPassword) {
  const first = await call('POST', '/auth/login', { body: { email, password } })
  assert.equal(first.status, 200, first.text)
  assert.equal(first.data.challenge, 'NEW_PASSWORD_REQUIRED')
  const done = await call('POST', '/auth/complete-new-password', { body: { session: first.data.session, newPassword } })
  assert.equal(done.status, 200, done.text)
  return done.data.idToken
}

let admin
const ADMIN_PW = 'NewAdmin#2026'

console.log(`\n🧪 Integration test — ${base} (data: ${dataDir})\n`)

await step('health check', async () => {
  const r = await call('GET', '/health')
  assert.equal(r.status, 200)
})

await step('đăng nhập sai mật khẩu → 401, thiếu token → 401', async () => {
  assert.equal((await call('POST', '/auth/login', { body: { email: 'admin@example.com', password: 'wrong' } })).status, 401)
  assert.equal((await call('POST', '/auth/login', { body: { email: 'nobody@example.com', password: 'x' } })).status, 401)
  assert.equal((await call('GET', '/students')).status, 401)
  assert.equal((await call('GET', '/students', { token: 'abc.def.ghi' })).status, 401)
})

await step('admin mặc định: bắt buộc đổi mật khẩu lần đầu (chính sách mật khẩu được áp dụng)', async () => {
  const first = await call('POST', '/auth/login', { body: { email: 'admin@example.com', password: 'Abc12345!' } })
  const weak = await call('POST', '/auth/complete-new-password', { body: { session: first.data.session, newPassword: 'short' } })
  assert.equal(weak.status, 400)
  admin = await loginWithFirstChange('admin@example.com', 'Abc12345!', ADMIN_PW)
  const me = await call('GET', '/auth/me', { token: admin })
  assert.equal(me.data.email, 'admin@example.com')
  assert.equal(me.data.role, 'Admin')
})

await step('cập nhật hồ sơ cá nhân', async () => {
  const r = await call('PUT', '/auth/me', { token: admin, body: { name: 'Quản trị viên', phone: '0901234567' } })
  assert.equal(r.status, 200, r.text)
  assert.equal((await call('GET', '/auth/me', { token: admin })).data.name, 'Quản trị viên')
})

await step('body JSON sai → 400, endpoint lạ → 404', async () => {
  const bad = await call('POST', '/students', { token: admin, raw: '{not json', headers: { 'Content-Type': 'application/json' } })
  assert.equal(bad.status, 400)
  assert.equal((await call('GET', '/nope', { token: admin })).status, 404)
})

const student = { studentId: 'SV100', fullName: 'Nguyen Van Test', email: 'sv100@example.com', major: 'IT', className: 'IT01', gpa: 3.2 }

await step('students: tạo, trùng mã → 409, lấy, sửa, validate', async () => {
  const created = await call('POST', '/students', { token: admin, body: student })
  assert.equal(created.status, 201, created.text)
  assert.equal(created.data.student.gpa, 3.2)
  assert.equal((await call('POST', '/students', { token: admin, body: student })).status, 409)
  assert.equal((await call('POST', '/students', { token: admin, body: { ...student, studentId: 'SV101', email: 'bad' } })).status, 400)
  const got = await call('GET', '/students/SV100', { token: admin })
  assert.equal(got.data.fullName, student.fullName)
  const upd = await call('PUT', '/students/SV100', { token: admin, body: { status: 'Warning', gpa: '2.5' } })
  assert.equal(upd.data.student.status, 'Warning')
  assert.equal(upd.data.student.gpa, 2.5)
  assert.equal((await call('PUT', '/students/SV100', { token: admin, body: { gpa: 7 } })).status, 400)
  assert.equal((await call('PUT', '/students/NOPE', { token: admin, body: { status: 'Active' } })).status, 404)
  const list = await call('GET', '/students', { token: admin })
  assert.equal(list.data.count, 1)
})

await step('tạo sinh viên → tài khoản Student + email mời + email chào mừng', async () => {
  await fromOutbox('Subject: Chào mừng đến với Student Portal')
  const users = await call('GET', '/admin/users', { token: admin })
  const acct = users.data.users.find((u) => u.email === 'sv100@example.com')
  assert.ok(acct, 'thiếu tài khoản sinh viên')
  assert.deepEqual(acct.groups, ['Student'])
  assert.equal(acct.status, 'FORCE_CHANGE_PASSWORD')
})

let studentToken
await step('sinh viên đăng nhập bằng mật khẩu tạm + RBAC', async () => {
  const temp = await fromOutbox('Email: sv100@example\\.com\\nMật khẩu tạm: (\\S+)')
  studentToken = await loginWithFirstChange('sv100@example.com', temp, 'Student#2026')
  assert.equal((await call('GET', '/students', { token: studentToken })).status, 403)
  assert.equal((await call('GET', '/admin/users', { token: studentToken })).status, 403)
  assert.equal((await call('GET', '/materials', { token: studentToken })).status, 200)
})

await step('teachers: tạo (kèm tài khoản Staff), sửa, xóa', async () => {
  const body = { teacherId: 'GV100', fullName: 'Tran Giang Vien', email: 'gv100@example.com', department: 'CS' }
  assert.equal((await call('POST', '/teachers', { token: admin, body })).status, 201)
  assert.equal((await call('POST', '/teachers', { token: studentToken, body })).status, 403)
  const upd = await call('PUT', '/teachers/GV100', { token: admin, body: { degree: 'PhD' } })
  assert.equal(upd.data.teacher.degree, 'PhD')
  assert.equal((await call('PUT', '/teachers/GV100', { token: admin, body: { department: '' } })).status, 400)
  assert.equal((await call('GET', '/teachers', { token: admin })).data.count, 1)
  assert.equal((await call('DELETE', '/teachers/GV100', { token: admin })).status, 200)
  assert.equal((await call('GET', '/teachers/GV100', { token: admin })).status, 404)
  await fromOutbox('Subject: Chào mừng giảng viên')
})

await step('classes: CRUD', async () => {
  assert.equal((await call('POST', '/classes', { token: admin, body: { classId: 'C1', className: 'Lớp 1' } })).status, 201)
  assert.equal((await call('GET', '/classes', { token: studentToken })).data.count, 1)
  const upd = await call('PUT', '/classes/C1', { token: admin, body: { room: 'A1', studentCount: 30 } })
  assert.equal(upd.data.class.studentCount, 30)
  assert.equal((await call('PUT', '/classes/NOPE', { token: admin, body: { room: 'x' } })).status, 404)
  assert.equal((await call('DELETE', '/classes/C1', { token: admin })).status, 200)
  assert.equal((await call('DELETE', '/classes/C1', { token: admin })).status, 404)
})

await step('grades: danh sách rỗng, tạo (subject có "/"), sửa, email điểm, xóa', async () => {
  const empty = await call('GET', '/grades', { token: admin })
  assert.equal(empty.status, 200, empty.text)
  assert.equal(empty.data.count, 0)
  const created = await call('POST', '/grades', { token: admin, body: { studentId: 'SV100', teacherId: 'GV1', subject: 'Toán/Lý', score: 8 } })
  assert.equal(created.status, 201, created.text)
  const id = created.data.grade.id
  assert.ok(!id.includes('/'))
  assert.equal((await call('GET', `/grades/${encodeURIComponent(id)}`, { token: admin })).data.score, 8)
  assert.equal((await call('PUT', `/grades/${encodeURIComponent(id)}`, { token: admin, body: { score: 11 } })).status, 400)
  assert.equal((await call('PUT', `/grades/${encodeURIComponent(id)}`, { token: admin, body: { score: 9.5 } })).data.grade.score, 9.5)
  await fromOutbox('Subject: Điểm môn Toán/Lý đã được công bố')
  assert.equal((await call('DELETE', `/grades/${encodeURIComponent(id)}`, { token: admin })).status, 200)
})

await step('documents: upload-url → PUT → metadata → tải về (cả 2 endpoint)', async () => {
  const payload = Buffer.from('%PDF-1.4 test document')
  const urlRes = await call('POST', '/documents/upload-url', {
    token: studentToken, body: { fileName: '../../evil name.pdf', contentType: 'application/pdf', studentId: 'SV100' }
  })
  assert.equal(urlRes.status, 200, urlRes.text)
  assert.ok(!urlRes.data.s3Key.includes('..'))
  const put = await fetch(new URL(urlRes.data.uploadUrl, base), { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: payload })
  assert.equal(put.status, 200)
  const saved = await call('POST', '/students/SV100/documents', {
    token: studentToken, body: { fileName: 'evil name.pdf', docType: 'transcript', s3Key: urlRes.data.s3Key, documentId: urlRes.data.documentId }
  })
  assert.equal(saved.status, 201, saved.text)
  const viaPath = await call('GET', '/students/SV100/documents', { token: studentToken })
  const viaQuery = await call('GET', '/documents/metadata?studentId=SV100', { token: admin })
  assert.equal(viaPath.data.count, 1)
  assert.equal(viaQuery.data.count, 1)
  const dl = await fetch(new URL(viaPath.data.documents[0].fileUrl, base))
  assert.equal(dl.status, 200)
  assert.equal(Buffer.from(await dl.arrayBuffer()).toString(), payload.toString())
  await fromOutbox('Subject: Tài liệu mới được upload')
})

await step('documents: sinh viên không truy cập được hồ sơ người khác; metadata khi chưa upload → 400', async () => {
  await call('POST', '/students', { token: admin, body: { studentId: 'SV200', fullName: 'Other', email: 'sv200@example.com' } })
  assert.equal((await call('GET', '/students/SV200/documents', { token: studentToken })).status, 403)
  assert.equal((await call('POST', '/documents/upload-url', { token: studentToken, body: { fileName: 'a.pdf', studentId: 'SV200' } })).status, 403)
  const missing = await call('POST', '/documents/metadata', { token: admin, body: { studentId: 'SV200', fileName: 'x.pdf', s3Key: 'documents/SV200/none.pdf' } })
  assert.equal(missing.status, 400)
})

await step('files: chữ ký sai / key traversal / hết hạn → 403', async () => {
  const urlRes = await call('POST', '/materials/upload-url', { token: admin, body: { fileName: 'a.txt', type: 'slide', contentType: 'text/plain' } })
  const tampered = urlRes.data.uploadUrl.replace(/sig=[0-9a-f]+/, 'sig=' + '0'.repeat(64))
  assert.equal((await fetch(new URL(tampered, base), { method: 'PUT', body: 'x' })).status, 403)
  const traversal = urlRes.data.uploadUrl.replace(/key=[^&]+/, 'key=..%2F..%2Fportal.db')
  assert.equal((await fetch(new URL(traversal, base), { method: 'PUT', body: 'x' })).status, 403)
  const expired = urlRes.data.uploadUrl.replace(/exp=\d+/, 'exp=1')
  assert.equal((await fetch(new URL(expired, base), { method: 'PUT', body: 'x' })).status, 403)
})

await step('materials: upload, lấy theo id, sửa (thay file), xóa', async () => {
  const up = async (name) => {
    const u = await call('POST', '/materials/upload-url', { token: admin, body: { fileName: name, type: 'slide', contentType: 'text/plain' } })
    const r = await fetch(new URL(u.data.uploadUrl, base), { method: 'PUT', headers: { 'Content-Type': 'text/plain' }, body: name })
    assert.equal(r.status, 200)
    return u.data.s3Key
  }
  assert.equal((await call('POST', '/materials/upload-url', { token: studentToken, body: { fileName: 'a', type: 'slide' } })).status, 403)
  const key1 = await up('v1.txt')
  const saved = await call('POST', '/materials/metadata', { token: admin, body: { title: 'Slide 1', subject: 'Mạng', type: 'slide', fileName: 'v1.txt', s3Key: key1 } })
  assert.equal(saved.status, 201, saved.text)
  const id = saved.data.material.id
  const got = await call('GET', `/materials/${id}`, { token: studentToken })
  assert.equal(got.data.title, 'Slide 1')
  const key2 = await up('v2.txt')
  const upd = await call('PUT', `/materials/${id}`, { token: admin, body: { title: 'Slide 1 (v2)', s3Key: key2, fileName: 'v2.txt' } })
  assert.equal(upd.status, 200, upd.text)
  assert.equal(await (await fetch(new URL(upd.data.material.fileUrl, base))).text(), 'v2.txt')
  assert.ok(!fs.existsSync(path.join(dataDir, 'uploads', key1)), 'file cũ phải bị xóa')
  assert.equal((await call('DELETE', `/materials/${id}`, { token: admin })).status, 200)
  assert.equal((await call('GET', `/materials/${id}`, { token: admin })).status, 404)
  assert.ok(!fs.existsSync(path.join(dataDir, 'uploads', key2)))
})

await step('admin users: tạo, trùng → 409, đổi quyền thu hồi token, vô hiệu hóa', async () => {
  assert.equal((await call('POST', '/admin/users', { token: admin, body: { email: 'staff@example.com', role: 'Staff', password: 'Staff#2026a' } })).status, 201)
  assert.equal((await call('POST', '/admin/users', { token: admin, body: { email: 'staff@example.com', role: 'Staff' } })).status, 409)
  assert.equal((await call('POST', '/admin/users', { token: admin, body: { email: 'x@example.com', role: 'Hacker' } })).status, 400)
  const staff = await loginWithFirstChange('staff@example.com', 'Staff#2026a', 'Staff#2026b')
  assert.equal((await call('GET', '/students', { token: staff })).status, 200)
  assert.equal((await call('PUT', '/admin/users/staff@example.com', { token: admin, body: { role: 'Teacher' } })).status, 200)
  assert.equal((await call('GET', '/students', { token: staff })).status, 401, 'token cũ phải bị thu hồi khi đổi quyền')
  assert.equal((await call('POST', '/admin/users/staff@example.com/toggle', { token: admin, body: { enabled: false } })).status, 200)
  assert.equal((await call('POST', '/auth/login', { body: { email: 'staff@example.com', password: 'Staff#2026b' } })).status, 403)
  assert.equal((await call('POST', '/admin/users/staff@example.com/toggle', { token: admin, body: { enabled: true } })).status, 200)
  assert.equal((await call('DELETE', '/admin/users/staff@example.com', { token: admin })).status, 200)
  assert.equal((await call('DELETE', '/admin/users/staff@example.com', { token: admin })).status, 404)
})

await step('admin không thể tự xóa / tự vô hiệu hóa / hạ quyền Admin cuối cùng', async () => {
  assert.equal((await call('DELETE', '/admin/users/admin@example.com', { token: admin })).status, 400)
  assert.equal((await call('POST', '/admin/users/admin@example.com/toggle', { token: admin, body: { enabled: false } })).status, 400)
  assert.equal((await call('PUT', '/admin/users/admin@example.com', { token: admin, body: { role: 'Staff' } })).status, 400)
})

await step('quên mật khẩu: mã sai bị từ chối, mã đúng đặt lại được, mã chỉ dùng một lần', async () => {
  assert.equal((await call('POST', '/auth/forgot-password', { body: { email: 'ghost@example.com' } })).status, 200)
  assert.equal((await call('POST', '/auth/forgot-password', { body: { email: 'sv100@example.com' } })).status, 200)
  const code = await fromOutbox('Mã xác nhận của bạn là: (\\d{6})')
  const wrong = code === '000000' ? '111111' : '000000'
  assert.equal((await call('POST', '/auth/verify-code', { body: { email: 'sv100@example.com', code: wrong } })).status, 400)
  assert.equal((await call('POST', '/auth/verify-code', { body: { email: 'sv100@example.com', code } })).status, 200)
  const reset = await call('POST', '/auth/reset-password', { body: { email: 'sv100@example.com', code, newPassword: 'Reset#2026x' } })
  assert.equal(reset.status, 200, reset.text)
  assert.equal((await call('POST', '/auth/reset-password', { body: { email: 'sv100@example.com', code, newPassword: 'Reset#2026y' } })).status, 400)
  assert.equal((await call('GET', '/materials', { token: studentToken })).status, 401, 'token cũ phải bị thu hồi sau reset')
  const login = await call('POST', '/auth/login', { body: { email: 'sv100@example.com', password: 'Reset#2026x' } })
  assert.ok(login.data.idToken)
})

await step('đổi mật khẩu: sai mật khẩu cũ → 400, thành công trả token mới, token cũ bị thu hồi', async () => {
  assert.equal((await call('POST', '/auth/change-password', { token: admin, body: { oldPassword: 'wrong', newPassword: 'Another#2026' } })).status, 400)
  const r = await call('POST', '/auth/change-password', { token: admin, body: { oldPassword: ADMIN_PW, newPassword: 'Another#2026' } })
  assert.equal(r.status, 200, r.text)
  assert.equal((await call('GET', '/auth/me', { token: admin })).status, 401)
  admin = r.data.idToken
  assert.equal((await call('GET', '/auth/me', { token: admin })).status, 200)
})

await step('admin logs: có nhật ký thật, lọc được', async () => {
  const r = await call('GET', '/admin/logs?limit=500&filterPattern=đăng nhập', { token: admin })
  assert.equal(r.status, 200)
  assert.ok(r.data.logs.length > 0)
  assert.ok(r.data.logs.every((l) => l.message.toLowerCase().includes('đăng nhập')))
})

await step('xóa sinh viên', async () => {
  assert.equal((await call('DELETE', '/students/SV100', { token: admin })).status, 200)
  assert.equal((await call('GET', '/students/SV100', { token: admin })).status, 404)
})

server.close()
const { stopWorker } = await import('./common/queue.js')
const { default: db } = await import('./common/db.js')
stopWorker()
await new Promise((r) => setTimeout(r, 200))
db.close()
try {
  fs.rmSync(dataDir, { recursive: true, force: true, maxRetries: 3 })
} catch {
  // Windows có thể còn giữ file log đang mở; thư mục tạm sẽ được hệ điều hành dọn sau.
}
console.log(`\n${failed === 0 ? '🎉' : '💥'} ${passed} passed, ${failed} failed\n`)
process.exit(failed === 0 ? 0 : 1)
