# Tài liệu API (API Documentation)

Base URL: `http://localhost:8080/api` (cùng origin với giao diện).

- Header xác thực: `Authorization: <idToken>` (có hoặc không có tiền tố `Bearer `).
- Body request là JSON. Response thành công: `{ "success": true, "message": "...", "data": ... }`; lỗi: `{ "success": false, "message": "...", "error": "..." }`.
- Quyền: **Admin** và **Staff** luôn được phép; cột "Quyền" liệt kê vai trò bổ sung được phép.

## Auth

| Method | Path | Quyền | Body / Ghi chú |
|---|---|---|---|
| POST | `/auth/login` | Công khai* | `{ email, password }` → `{ idToken, expiresIn, user }` hoặc `{ challenge: "NEW_PASSWORD_REQUIRED", session, email }` |
| POST | `/auth/complete-new-password` | Công khai* | `{ session, newPassword }` → `{ idToken, ... }` |
| GET | `/auth/me` | Đã đăng nhập | → `{ sub, email, name, phone_number, role, status }` |
| PUT | `/auth/me` | Đã đăng nhập | `{ name?, phone? }` |
| POST | `/auth/change-password` | Đã đăng nhập | `{ oldPassword, newPassword }` → token mới (token cũ bị thu hồi) |
| POST | `/auth/forgot-password` | Công khai* | `{ email }` — luôn trả 200; mã 6 số gửi qua email, hết hạn 15 phút |
| POST | `/auth/verify-code` | Công khai* | `{ email, code }` |
| POST | `/auth/reset-password` | Công khai* | `{ email, code, newPassword }` |

\* Giới hạn 20 request / 15 phút / IP. Chính sách mật khẩu: ≥ 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt.

## Students

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/students` | Staff | `{ students, count }` |
| GET | `/students/{id}` | Staff | |
| POST | `/students` | Staff | `{ studentId, fullName, email, phone?, gender?, dateOfBirth?, major?, className?, status?, gpa? }` — 409 nếu trùng mã; tự tạo tài khoản Student + email mời |
| PUT | `/students/{id}` | Staff | Trường bất kỳ ở trên (trừ `studentId`) |
| DELETE | `/students/{id}` | Admin | |
| GET | `/students/{studentId}/documents` | Student (chỉ hồ sơ của mình) | `{ documents, count, studentId }`, mỗi document có `fileUrl` ký sẵn |
| POST | `/students/{studentId}/documents` | Student (chỉ hồ sơ của mình) | `{ fileName, s3Key, documentId?, docType? }` |

## Documents

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| POST | `/documents/upload-url` | Student (chỉ hồ sơ của mình) | `{ fileName, contentType, studentId }` → `{ uploadUrl, s3Key, documentId }` |
| POST | `/documents/metadata` | Student (chỉ hồ sơ của mình) | `{ studentId, fileName, s3Key, documentId?, docType? }` |
| GET | `/documents/metadata?studentId=` | Student (chỉ hồ sơ của mình) | Giống `GET /students/{id}/documents` |

## Teachers

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/teachers` | Staff | |
| GET | `/teachers/{id}` | Staff | |
| POST | `/teachers` | Admin | `{ teacherId, fullName, email, department, phone?, degree?, subject? }` — tự tạo tài khoản nhóm Staff |
| PUT | `/teachers/{id}` | Admin | |
| DELETE | `/teachers/{id}` | Admin | |

## Classes

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/classes` | Đã đăng nhập | |
| GET | `/classes/{id}` | Đã đăng nhập | |
| POST | `/classes` | Admin | `{ classId, className, room?, studentCount?, schedule? }` |
| PUT | `/classes/{id}` | Admin | |
| DELETE | `/classes/{id}` | Admin | |

## Grades

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/grades` | Teacher | |
| GET | `/grades/{id}` | Teacher | |
| POST | `/grades` | Teacher | `{ studentId, teacherId, subject, score (0-10), semester?, note? }` — gửi email điểm cho sinh viên |
| PUT | `/grades/{id}` | Teacher | `{ subject?, semester?, score?, note? }` |
| DELETE | `/grades/{id}` | Admin | |

## Materials

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/materials` | Student, Teacher | `{ materials, count }` |
| GET | `/materials/{id}` | Student, Teacher | |
| POST | `/materials/upload-url` | Teacher | `{ fileName, contentType, type }` → `{ uploadUrl, s3Key }` |
| POST | `/materials/metadata` | Teacher | `{ title, subject, type, fileName, s3Key }` |
| PUT | `/materials/{id}` | Teacher | `{ title?, subject?, type?, s3Key?, fileName? }` — `s3Key` mới thay file và xoá file cũ |
| DELETE | `/materials/{id}` | Teacher | Xoá cả file |

## Files (URL có chữ ký — không cần Authorization)

| Method | Path | Ghi chú |
|---|---|---|
| PUT | `/files/upload?key&ct&exp&sig` | Body là nội dung file; `Content-Type` phải khớp `ct`; tối đa `MAX_UPLOAD_MB` |
| GET | `/files/download?key&exp&sig` | |

## Admin

| Method | Path | Quyền | Ghi chú |
|---|---|---|---|
| GET | `/admin/users` | Admin | `{ users: [{ username, email, name, status, enabled, groups, createdAt }] }` |
| POST | `/admin/users` | Admin | `{ email, role, password?, name? }` — mật khẩu là mật khẩu tạm (trống → tự sinh, gửi qua email) |
| PUT | `/admin/users/{username}` | Admin | `{ role?, enabled? }` |
| POST | `/admin/users/{username}/toggle` | Admin | `{ enabled: boolean }` |
| DELETE | `/admin/users/{username}` | Admin | |
| GET | `/admin/logs?limit=&filterPattern=` | Admin | `{ logs: [{ timestamp, level, message, ip }] }` |

Admin không thể tự xoá / tự khoá / tự hạ quyền, và hệ thống luôn giữ ít nhất một Admin đang hoạt động.

## Khác

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/health` | `{ status: "ok" }` |
