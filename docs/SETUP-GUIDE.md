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

- Trình duyệt tự mở trang portal; giữ cửa sổ console mở trong khi sử dụng.
- Dữ liệu tạo ở `data\` cạnh file `.exe`.
- Cấu hình: tạo file `.env` cạnh file `.exe` (xem bảng biến môi trường trong README) hoặc đặt biến môi trường.
- Dừng bằng `Ctrl+C` hoặc đóng cửa sổ.

### Gửi file .exe cho người khác

Người nhận không cần cài gì thêm, nhưng cần lưu ý:

1. **Máy phải là Windows 10/11 64-bit.** Windows 7/8.1 và Windows 32-bit không chạy được (runtime Node.js không hỗ trợ).
2. **Gửi qua link tải** (Google Drive, OneDrive, GitHub Release...) thay vì đính kèm trực tiếp: nhiều ứng dụng chat/email chặn hoặc làm hỏng file `.exe` ~90 MB. Nếu nén `.zip`, hãy **giải nén ra thư mục** trước khi chạy.
3. **SmartScreen** ("Windows protected your PC"): bấm **More info → Run anyway**. Cảnh báo xuất hiện vì file chưa có chữ ký số.
4. **Antivirus** (kể cả Windows Defender) có thể cách ly file vì là `.exe` lạ chưa ký: kiểm tra *Windows Security → Protection history* và cho phép (Allow) file.
5. **Windows Firewall** có thể hỏi quyền mạng ở lần chạy đầu: chọn Allow (Private networks). Bấm Cancel vẫn dùng được trên chính máy đó.
6. Đặt file ở thư mục có quyền ghi (Desktop, Documents, Downloads...) — không đặt trong `C:\Program Files`, vì dữ liệu được tạo cạnh file.
7. Nếu vẫn không chạy: mở thư mục chứa file, gõ `cmd` vào thanh địa chỉ, rồi chạy `student-portal-win32-x64.exe` trong cửa sổ đó để xem thông báo lỗi; hoặc gửi lại file `startup-error.log` nằm cạnh file `.exe`.

## 6. Xử lý sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| `Cổng ... đang được sử dụng` | Bản `.exe` tự thử 8081–8090; nếu vẫn bận hoặc đã đặt `PORT`, đặt `PORT=<cổng khác>` |
| Double-click `.exe` không thấy gì | Xem mục [Gửi file .exe cho người khác](#gửi-file-exe-cho-người-khác) (SmartScreen, antivirus, Windows 10/11 64-bit) |
| Trang trắng, log báo không tìm thấy frontend build | Chạy `npm run build` (hoặc dùng `npm run dev:web`) |
| Quên mật khẩu Admin duy nhất | Dùng chức năng Quên mật khẩu (mã OTP trong `data/logs/outbox.log` nếu chưa cấu hình SMTP) |
| `ERR_UNKNOWN_BUILTIN_MODULE node:sqlite` | Nâng cấp Node lên ≥ 22.13 |
| Bị đăng xuất sau khi đổi quyền / đổi mật khẩu | Bình thường: token cũ bị thu hồi, đăng nhập lại |
