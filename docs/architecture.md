# Kiến trúc hệ thống (Architecture)

## Tổng quan

Một process Node.js duy nhất phục vụ cả giao diện React đã build và REST API. Mọi dữ liệu nằm trong thư mục `data/`:

```
                ┌──────────────────────── Node.js process ────────────────────────┐
 Browser ──HTTP─▶ Express                                                         │
                │  ├─ /            → frontend (đĩa hoặc asset nhúng trong .exe)   │
                │  ├─ /api/*       → adapter → handler (students, grades, ...)    │
                │  │                   ├─ authMiddleware (JWT + bảng users)       │
                │  │                   ├─ db.js ─────────▶ data/portal.db (SQLite)│
                │  │                   └─ queue.sendMessage ─▶ bảng jobs          │
                │  └─ /api/files/* → upload/download có chữ ký ─▶ data/uploads/   │
                │                                                                 │
                │  Worker (setInterval) ◀── bảng jobs ──▶ mailer ─▶ SMTP / outbox │
                │  Logger ─▶ ring buffer (/api/admin/logs) + data/logs/app.log    │
                └─────────────────────────────────────────────────────────────────┘
```

## Ánh xạ từ kiến trúc AWS cũ

| AWS (v1) | Tự host (v2) | File |
|---|---|---|
| API Gateway | Express router + adapter chuyển request thành event kiểu API Gateway | `backend/server/app.js`, `routes.js` |
| Lambda | Handler giữ nguyên chữ ký `handler(event) → {statusCode, headers, body}` | `backend/<module>/<fn>/index.js` |
| Cognito User Pool | Bảng `users` (scrypt, trạng thái `FORCE_CHANGE_PASSWORD`/`CONFIRMED`, một role/tài khoản) | `common/users.js` |
| Cognito JWT + JWKS | JWT HS256 tự phát hành; claim `groups` thay cho `cognito:groups` | `common/authMiddleware.js` |
| Amplify (frontend) | `authService.js` gọi `/api/auth/*` | `frontend/src/services/authService.js` |
| DynamoDB | SQLite (`node:sqlite`), mỗi bảng là `(id TEXT PRIMARY KEY, data JSON)` | `common/db.js` |
| S3 presigned URL | URL ký HMAC-SHA256 có hạn dùng, file trên đĩa | `common/storage.js` |
| SQS + Lambda trigger | Bảng `jobs` + worker trong process, retry backoff tối đa 5 lần | `common/queue.js` |
| SES | Nodemailer (SMTP), không cấu hình → `data/logs/outbox.log` | `common/mailer.js` |
| CloudWatch Logs | Ghi đè `console.*` → ring buffer 2000 dòng + file log xoay vòng | `common/logger.js` |
| CloudFront/S3 hosting | Express phục vụ `frontend/dist` (hoặc asset SEA) với SPA fallback | `server/static.js` |

## Xác thực & phân quyền

1. `POST /api/auth/login` kiểm tra mật khẩu (scrypt, so sánh constant-time, có hash giả để chống dò email qua timing).
2. Tài khoản mới (do Admin/hệ thống tạo) ở trạng thái `FORCE_CHANGE_PASSWORD` → server trả `challenge: NEW_PASSWORD_REQUIRED` + session 10 phút → `POST /api/auth/complete-new-password`.
3. Token chứa `sub`, `email`, `groups`, `tv` (token version). Mỗi request, middleware đọc lại user từ DB: tài khoản bị xoá / khoá / đổi mật khẩu / đổi quyền đều làm token cũ mất hiệu lực ngay.
4. `requireRole(role | role[])`: Admin và Staff luôn được phép (giữ nguyên chính sách cũ).
5. Sinh viên chỉ đọc/ghi hồ sơ tài liệu của chính mình (khớp email tài khoản với email sinh viên).
6. Các endpoint xác thực công khai bị giới hạn 20 request / 15 phút / IP.

## Luồng upload tài liệu

1. Client gọi `POST /api/documents/upload-url` (hoặc `/materials/upload-url`) → nhận `uploadUrl` (hết hạn 5 phút) + `s3Key`.
2. Client `PUT` file thẳng vào `uploadUrl`; server kiểm tra chữ ký, hạn dùng, Content-Type, dung lượng; ghi file atomic (file tạm → rename).
3. Client gọi `POST .../metadata`; server xác nhận `s3Key` thuộc đúng thư mục và file đã tồn tại, lưu metadata, đưa job email vào hàng đợi.
4. Khi đọc danh sách, server cấp `fileUrl` mới có chữ ký (hết hạn 1 giờ). Loại file không an toàn (HTML, SVG...) luôn tải về dạng attachment.

Key file được làm sạch (bỏ `..`, ký tự cấm) và luôn được kiểm tra nằm trong `data/uploads/`.

## Đóng gói file thực thi

`scripts/build-exe.mjs`: Vite build → esbuild bundle backend thành một file CommonJS → `node --experimental-sea-config` tạo blob kèm toàn bộ `frontend/dist` dưới dạng SEA asset → sao chép binary `node` và tiêm blob bằng `postject`. Khi chạy, `static.js` phát hiện `sea.isSea()` và đọc frontend từ asset nhúng.
