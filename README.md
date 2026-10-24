# Student Management Portal

Hệ thống quản lý sinh viên, giáo viên, lớp học, điểm số và tài liệu học tập — **tự host hoàn toàn, 100% thư viện miễn phí / mã nguồn mở**, không phụ thuộc dịch vụ đám mây trả phí. Toàn bộ dự án có thể đóng gói thành **một file thực thi duy nhất** (`.exe` trên Windows) chạy không cần cài Node.js.

> Phiên bản 2.0 thay thế kiến trúc AWS (API Gateway, Lambda, Cognito, DynamoDB, S3, SQS, SES, CloudWatch) bằng các thành phần tự host tương đương, giữ nguyên toàn bộ chức năng. Xem [docs/architecture.md](docs/architecture.md).

## 1. Công nghệ

| Lớp | Công nghệ (giấy phép) | Thay cho |
|---|---|---|
| Frontend | React 18, React Router 6, Vite 5, axios, lucide-react (MIT/ISC) | — |
| API server | Express 5 (MIT) + adapter giữ nguyên handler kiểu Lambda | API Gateway + Lambda |
| Database | SQLite qua `node:sqlite` tích hợp sẵn trong Node.js | DynamoDB |
| Xác thực | JWT HS256 (`jsonwebtoken`, MIT), băm mật khẩu `scrypt` (`node:crypto`) | Cognito + Amplify |
| Lưu file | Ổ đĩa cục bộ + URL upload/download ký HMAC có hạn dùng | S3 presigned URL |
| Hàng đợi | Bảng job trong SQLite + worker trong process, tự retry | SQS |
| Email | Nodemailer qua SMTP bất kỳ (MIT); không có SMTP → ghi vào `outbox.log` | SES |
| Nhật ký | Logger nội bộ (ring buffer + file `app.log`) | CloudWatch Logs |
| Đóng gói | esbuild (MIT) + Node Single Executable Applications + postject (MIT) | — |

## 2. Yêu cầu

- **Node.js ≥ 22.13** (khuyên dùng Node 22 LTS hoặc 24 LTS) — chỉ cần để phát triển / build. Bản `.exe` đã build không cần Node.

## 3. Chạy nhanh

```bash
npm run install:all     # cài dependencies cho root, backend, frontend
npm run build           # build frontend → frontend/dist
npm run seed            # (tuỳ chọn) nạp dữ liệu mẫu
npm start               # http://localhost:8080 (API + giao diện)
```

Lần chạy đầu tiên server tự tạo tài khoản quản trị:

| Email | Mật khẩu | Ghi chú |
|---|---|---|
| `admin@example.com` | `Abc12345!` | Bắt buộc đổi mật khẩu ở lần đăng nhập đầu |

Đặt `ADMIN_EMAIL` / `ADMIN_PASSWORD` trước lần chạy đầu để dùng thông tin riêng.

### Chế độ phát triển (hot reload)

```bash
npm run dev:api         # backend tại :8080 (node --watch)
npm run dev:web         # Vite tại :3000, proxy /api → :8080
```

### Kiểm thử

```bash
npm test                # integration test end-to-end (server thật + DB tạm)
```

## 4. Đóng gói thành một file thực thi

```bash
npm run build:exe
```

Kết quả: `release/student-portal-win32-x64.exe` (hoặc `-linux-x64`, `-darwin-arm64` khi build trên hệ điều hành tương ứng). File này chứa Node runtime, backend đã bundle và toàn bộ frontend. Double-click file → trình duyệt tự mở `http://localhost:8080` (nếu cổng 8080 bận, tự chuyển sang 8081–8090). Giữ cửa sổ console mở trong khi sử dụng.

- Dữ liệu (database, file upload, log, secret) nằm trong thư mục `data/` **cạnh file thực thi**.
- Cấu hình bằng biến môi trường hoặc file `.env` đặt cạnh file thực thi.
- Script chạy trên hệ điều hành nào thì tạo binary cho hệ điều hành đó (Node SEA không cross-compile).
- Nếu khởi động lỗi, cửa sổ giữ nguyên để đọc thông báo và lỗi được ghi vào `startup-error.log` cạnh file thực thi.
- Bản Windows yêu cầu **Windows 10/11 64-bit**. Gửi cho người khác: xem [docs/SETUP-GUIDE.md](docs/SETUP-GUIDE.md#gửi-file-exe-cho-người-khác).

Chi tiết: [docs/SETUP-GUIDE.md](docs/SETUP-GUIDE.md#5-đóng-gói-file-thực-thi).

## 5. Biến môi trường

Tất cả đều tuỳ chọn. Có thể đặt trong file `.env` (thư mục chạy server, hoặc cạnh file `.exe`).

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `8080` | Cổng HTTP (không đặt → tự thử 8081–8090 nếu 8080 bận; đặt rõ → báo lỗi nếu bận) |
| `HOST` | `0.0.0.0` | Địa chỉ lắng nghe |
| `DATA_DIR` | `./data` (cạnh `.exe` khi chạy bản đóng gói) | Thư mục database / upload / log |
| `PUBLIC_URL` | _(trống — dùng URL tương đối)_ | URL công khai, dùng cho link trong email |
| `JWT_SECRET` | tự sinh, lưu ở `data/.jwt-secret` | Khoá ký token & URL file |
| `TOKEN_TTL_SECONDS` | `28800` (8 giờ) | Thời hạn phiên đăng nhập |
| `MAX_UPLOAD_MB` | `10` | Dung lượng file upload tối đa |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@example.com` / `Abc12345!` | Tài khoản Admin tạo ở lần chạy đầu |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | _(trống)_ | Máy chủ SMTP; trống → email ghi vào `data/logs/outbox.log` |
| `FROM_EMAIL` | `noreply@example.com` | Địa chỉ gửi / nhận thông báo hệ thống |
| `CORS_ORIGIN` | `*` | Chỉ cần khi frontend chạy khác origin |
| `TRUST_PROXY` | `false` | Đặt `true` khi chạy sau reverse proxy (lấy IP thật cho rate limit / log) |
| `NO_BROWSER` | _(trống)_ | Đặt `1` để bản `.exe` không tự mở trình duyệt |
| `WEB_DIR` | `frontend/dist` | Thư mục frontend đã build (khi không chạy bản `.exe`) |
| `VITE_API_ENDPOINT` _(build frontend)_ | `/api` | URL API nếu backend không cùng origin |

SMTP miễn phí để thử nghiệm: [Mailpit](https://github.com/axllent/mailpit) (`SMTP_HOST=localhost SMTP_PORT=1025`).

## 6. Chức năng & phân quyền

Bốn vai trò: **Admin**, **Staff** (giáo viên được tạo qua trang Giáo viên thuộc nhóm này), **Teacher**, **Student**. Admin và Staff được phép mọi thao tác.

| Module | Chức năng |
|---|---|
| Xác thực | Đăng nhập, đổi mật khẩu lần đầu (mật khẩu tạm), quên mật khẩu bằng mã OTP qua email, đổi mật khẩu, sửa hồ sơ |
| Sinh viên | CRUD, tự tạo tài khoản đăng nhập + email mời, hồ sơ/tài liệu sinh viên (upload, tải về) |
| Giáo viên | CRUD, tự tạo tài khoản đăng nhập |
| Lớp học | CRUD |
| Điểm | CRUD, email thông báo điểm cho sinh viên |
| Tài liệu học tập | Upload, xem, sửa (thay file), xoá |
| Quản trị | Quản lý tài khoản (tạo, đổi quyền, khoá/mở, xoá), nhật ký hệ thống trực tiếp |

Ma trận quyền chi tiết theo endpoint: [docs/api-documentation.md](docs/api-documentation.md).

## 7. Cấu trúc thư mục

```
├── backend/
│   ├── server/          # Express app, bảng route, phục vụ frontend, entrypoint
│   ├── common/          # config, db (SQLite), users, auth middleware, storage, queue, mailer, logger
│   ├── auth/            # login, đổi/quên mật khẩu, hồ sơ
│   ├── students/ teachers/ classes/ grades/ documents/ materials/ admin/   # handler theo module
│   ├── notifications/   # worker gửi email
│   ├── seed-all-data.js # dữ liệu mẫu
│   └── test-integration.js
├── frontend/            # React + Vite
├── scripts/build-exe.mjs  # đóng gói file thực thi
├── postman/             # Postman collection (apiUrl = http://localhost:8080/api)
└── docs/
```

## 8. Sao lưu

Dừng server rồi sao chép toàn bộ thư mục `data/` (gồm `portal.db`, `uploads/`, `.jwt-secret`). Khôi phục bằng cách chép lại thư mục này.
