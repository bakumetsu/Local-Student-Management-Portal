# Hướng Dẫn Cài Đặt và Chạy

## 1. Yêu cầu

- **Node.js ≥ 22.13** (khuyên dùng bản LTS 22 hoặc 24): https://nodejs.org — chọn bộ cài chính thức (cần cho bước đóng gói `.exe`).
- Git.

Không cần tài khoản đám mây, database server hay dịch vụ trả phí nào.

## 2. Cài đặt

```bash
git clone <repo-url>
cd Local-Student-Management-Portal
npm run install:all
```

## 3. Chạy

### Chạy như production (một cổng duy nhất)

```bash
npm run build      # build giao diện vào frontend/dist
npm run seed       # (tuỳ chọn) dữ liệu mẫu: 4 sinh viên, 2 giáo viên, 2 lớp, điểm, tài liệu
npm start          # http://localhost:8080
```

Đăng nhập bằng `admin@example.com` / `Abc12345!` — hệ thống yêu cầu đổi mật khẩu ở lần đầu.

### Chạy chế độ phát triển

Mở hai terminal:

```bash
npm run dev:api    # API tại http://localhost:8080 (tự khởi động lại khi sửa code)
npm run dev:web    # giao diện tại http://localhost:3000 (Vite HMR, proxy /api sang :8080)
```

## 4. Email

Mặc định không gửi email thật: nội dung (mật khẩu tạm, mã OTP quên mật khẩu, thông báo) được ghi vào `data/logs/outbox.log`.

Để gửi thật, cấu hình SMTP trong `.env` (ví dụ Gmail App Password, Mailgun, Postfix tự host...):

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=secret
FROM_EMAIL=portal@example.com
PUBLIC_URL=https://portal.example.com
```

Thử nghiệm cục bộ với [Mailpit](https://github.com/axllent/mailpit): `SMTP_HOST=localhost`, `SMTP_PORT=1025`.

## 5. Đóng gói file thực thi

```bash
npm run build:exe
```

Script `scripts/build-exe.mjs` sẽ:

1. Cài dependencies còn thiếu (bỏ qua bằng `-- --skip-install`).
2. Build frontend (Vite).
3. Bundle backend + thư viện thành một file bằng esbuild.
4. Tạo blob Node SEA, nhúng toàn bộ frontend.
5. Sao chép binary Node đang dùng và tiêm blob bằng postject.

Kết quả nằm ở `release/` (đổi bằng `-- --out=<thư mục>`), ví dụ `release/student-portal-win32-x64.exe` (~80–100 MB vì chứa cả Node runtime).

Lưu ý:

- Build trên hệ điều hành nào thì ra binary cho hệ điều hành đó. Muốn bản Linux/macOS, chạy lệnh trên máy Linux/macOS (hoặc CI).
- Trên Windows, file `.exe` không có chữ ký số (trừ khi có `signtool` và bạn tự ký) nên SmartScreen có thể cảnh báo lần đầu.
- Cần dùng binary Node chính thức (bộ cài từ nodejs.org, nvm, fnm...). Một số bản Node đóng gói lại không hỗ trợ SEA.

### Chạy bản đóng gói

```
student-portal-win32-x64.exe
```

- Dữ liệu tạo ở `data\` cạnh file `.exe`.
- Cấu hình: tạo file `.env` cạnh file `.exe` (xem bảng biến môi trường trong README) hoặc đặt biến môi trường.
- Dừng bằng `Ctrl+C`.

## 6. Xử lý sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| `Cổng 8080 đang được sử dụng` | Đặt `PORT=8081` |
| Trang trắng, log báo không tìm thấy frontend build | Chạy `npm run build` (hoặc dùng `npm run dev:web`) |
| Quên mật khẩu Admin duy nhất | Dùng chức năng Quên mật khẩu (mã OTP trong `data/logs/outbox.log` nếu chưa cấu hình SMTP) |
| `ERR_UNKNOWN_BUILTIN_MODULE node:sqlite` | Nâng cấp Node lên ≥ 22.13 |
| Bị đăng xuất sau khi đổi quyền / đổi mật khẩu | Bình thường: token cũ bị thu hồi, đăng nhập lại |
