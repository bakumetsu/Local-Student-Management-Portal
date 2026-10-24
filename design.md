# DESIGN.md — Student Management Portal

## 1. Mục đích tài liệu

File `design.md` dùng để quy định **giao diện, style basic, layout, màu sắc, font chữ, component và cách tổ chức UI** cho dự án **AWS Student Management Portal**.

Tài liệu này giúp frontend được thiết kế thống nhất, dễ code bằng ReactJS/Vite và dễ trình bày trong báo cáo.

---

## 2. Phong cách giao diện tổng thể

### 2.1. Style chính

Dự án sử dụng phong cách:

```text
Clean Dashboard UI
Simple Admin Panel
Basic Modern Web App
```

Giao diện nên rõ ràng, dễ nhìn, không quá màu mè.  
Ưu tiên khả năng sử dụng, dễ thao tác và phù hợp với hệ thống quản lý sinh viên.

### 2.2. Từ khóa thiết kế

```text
Simple
Clean
Readable
Professional
Responsive
Dashboard-based
```

### 2.3. Tông giao diện đề xuất

- Nền tổng thể: sáng, xám nhạt.
- Nội dung chính: nền trắng.
- Màu chính: xanh dương.
- Màu phụ: xám.
- Màu cảnh báo: vàng/cam.
- Màu lỗi: đỏ.
- Màu thành công: xanh lá.

---

## 3. Design Tokens

Design tokens là các thông số style dùng chung toàn bộ dự án.

---

## 3.1. Color Palette

### Màu chính

| Tên biến | Mã màu | Mục đích |
|---|---|---|
| `--color-primary` | `#2563EB` | Màu chính, dùng cho button chính, link, icon active |
| `--color-primary-hover` | `#1D4ED8` | Màu hover của button chính |
| `--color-primary-light` | `#DBEAFE` | Nền xanh nhạt cho badge hoặc trạng thái active |

### Màu nền

| Tên biến | Mã màu | Mục đích |
|---|---|---|
| `--color-bg` | `#F3F4F6` | Nền tổng thể |
| `--color-surface` | `#FFFFFF` | Nền card, form, table |
| `--color-sidebar` | `#111827` | Nền sidebar |
| `--color-sidebar-hover` | `#1F2937` | Sidebar item hover |

### Màu chữ

| Tên biến | Mã màu | Mục đích |
|---|---|---|
| `--color-text` | `#111827` | Chữ chính |
| `--color-text-muted` | `#6B7280` | Chữ phụ |
| `--color-text-light` | `#F9FAFB` | Chữ trên nền tối |
| `--color-border` | `#E5E7EB` | Border |

### Màu trạng thái

| Tên biến | Mã màu | Mục đích |
|---|---|---|
| `--color-success` | `#16A34A` | Thành công |
| `--color-success-light` | `#DCFCE7` | Nền trạng thái thành công |
| `--color-warning` | `#F59E0B` | Cảnh báo |
| `--color-warning-light` | `#FEF3C7` | Nền trạng thái cảnh báo |
| `--color-danger` | `#DC2626` | Lỗi, xóa |
| `--color-danger-light` | `#FEE2E2` | Nền trạng thái lỗi |
| `--color-info` | `#0891B2` | Thông tin |
| `--color-info-light` | `#CFFAFE` | Nền trạng thái thông tin |

---

## 3.2. CSS Variables đề xuất

Thêm đoạn này vào `frontend/src/index.css`:

```css
:root {
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-light: #DBEAFE;

  --color-bg: #F3F4F6;
  --color-surface: #FFFFFF;
  --color-sidebar: #111827;
  --color-sidebar-hover: #1F2937;

  --color-text: #111827;
  --color-text-muted: #6B7280;
  --color-text-light: #F9FAFB;
  --color-border: #E5E7EB;

  --color-success: #16A34A;
  --color-success-light: #DCFCE7;
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  --color-danger: #DC2626;
  --color-danger-light: #FEE2E2;
  --color-info: #0891B2;
  --color-info-light: #CFFAFE;

  --font-main: Inter, Arial, Helvetica, sans-serif;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);

  --sidebar-width: 260px;
  --navbar-height: 64px;
}
```

---

## 4. Typography

### 4.1. Font chữ

Font đề xuất:

```text
Inter
Arial
Helvetica
sans-serif
```

Nếu không import Google Font, dùng mặc định:

```css
font-family: Inter, Arial, Helvetica, sans-serif;
```

### 4.2. Cỡ chữ

| Thành phần | Font size | Font weight |
|---|---:|---:|
| Page title | 28px | 700 |
| Section title | 22px | 600 |
| Card title | 18px | 600 |
| Body text | 14px - 16px | 400 |
| Table text | 14px | 400 |
| Button text | 14px | 600 |
| Label | 14px | 500 |
| Help text | 13px | 400 |

### 4.3. Quy tắc chữ

- Tiêu đề trang dùng chữ đậm.
- Label form rõ ràng, ngắn gọn.
- Không viết toàn bộ chữ in hoa trừ badge/trạng thái.
- Text trong table cần dễ đọc, không quá nhỏ.
- Error message nên dùng màu đỏ và mô tả ngắn.

---

## 5. Layout tổng thể

### 5.1. Cấu trúc màn hình chính

Layout dashboard gồm:

```text
Sidebar bên trái
Navbar phía trên
Main content ở giữa
```

Sơ đồ:

```text
+--------------------------------------------------+
| Sidebar | Navbar                                 |
|         |----------------------------------------|
|         | Main Content                           |
|         |                                        |
|         | Cards / Tables / Forms                 |
+--------------------------------------------------+
```

### 5.2. Kích thước layout

| Thành phần | Kích thước |
|---|---:|
| Sidebar width | 260px |
| Navbar height | 64px |
| Main content padding | 24px |
| Card padding | 20px |
| Table cell padding | 12px 16px |
| Form gap | 16px |

### 5.3. CSS layout cơ bản

```css
.app-layout {
  min-height: 100vh;
  display: flex;
  background: var(--color-bg);
}

.sidebar {
  width: var(--sidebar-width);
  min-height: 100vh;
  background: var(--color-sidebar);
  color: var(--color-text-light);
  position: fixed;
  left: 0;
  top: 0;
}

.main-wrapper {
  margin-left: var(--sidebar-width);
  width: calc(100% - var(--sidebar-width));
  min-height: 100vh;
}

.navbar {
  height: var(--navbar-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.main-content {
  padding: 24px;
}
```

---

## 6. Responsive Design

### 6.1. Breakpoints

| Thiết bị | Kích thước |
|---|---:|
| Mobile | `< 640px` |
| Tablet | `640px - 1024px` |
| Desktop | `> 1024px` |

### 6.2. Quy tắc responsive

#### Desktop

- Hiển thị sidebar cố định bên trái.
- Nội dung chính nằm bên phải.
- Table hiển thị đầy đủ cột.

#### Tablet

- Sidebar có thể thu nhỏ.
- Card dashboard có thể chia 2 cột.
- Table có thể scroll ngang.

#### Mobile

- Ẩn sidebar hoặc chuyển thành menu.
- Main content chiếm toàn màn hình.
- Form chuyển về 1 cột.
- Table dùng horizontal scroll.

### 6.3. CSS responsive cơ bản

```css
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }

  .main-content {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .table-wrapper {
    overflow-x: auto;
  }
}
```

---

## 7. Component Design

---

## 7.1. Button

### Loại button

| Loại | Mục đích |
|---|---|
| Primary | Thêm, lưu, xác nhận |
| Secondary | Hủy, quay lại |
| Danger | Xóa |
| Ghost | Hành động phụ |
| Icon button | Sửa, xóa, xem chi tiết |

### CSS button

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-ghost {
  background: transparent;
  color: var(--color-primary);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Ví dụ sử dụng

```jsx
<button className="btn btn-primary">Thêm sinh viên</button>
<button className="btn btn-secondary">Hủy</button>
<button className="btn btn-danger">Xóa</button>
```

---

## 7.2. Card

Card dùng để chứa nội dung dashboard, form, thông tin sinh viên.

### CSS card

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
}

.card-description {
  font-size: 14px;
  color: var(--color-text-muted);
}
```

### Ví dụ sử dụng

```jsx
<div className="card">
  <h2 className="card-title">Thông tin sinh viên</h2>
  <p className="card-description">Quản lý thông tin cơ bản của sinh viên.</p>
</div>
```

---

## 7.3. Input và Form

### CSS form

```css
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--color-text);
  background: white;
  outline: none;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-error {
  font-size: 13px;
  color: var(--color-danger);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
```

### Quy tắc form

- Các field bắt buộc cần có dấu `*`.
- Input phải có label rõ ràng.
- Khi lỗi, hiển thị message ngay dưới input.
- Form thêm/sửa sinh viên nên dùng chung component `StudentForm.jsx`.
- Form dài nên chia thành nhiều nhóm thông tin.

---

## 7.4. Table

Table dùng để hiển thị danh sách sinh viên.

### CSS table

```css
.table-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #F9FAFB;
}

.table th {
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.table td {
  font-size: 14px;
  color: var(--color-text);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.table tr:hover {
  background: #F9FAFB;
}

.table-actions {
  display: flex;
  gap: 8px;
}
```

### Cột table sinh viên đề xuất

| Cột | Nội dung |
|---|---|
| Mã sinh viên | `studentId` |
| Họ tên | `fullName` |
| Email | `email` |
| Số điện thoại | `phone` |
| Ngành | `major` |
| Lớp | `className` |
| Trạng thái | `status` |
| Hành động | Xem / Sửa / Xóa |

---

## 7.5. Badge trạng thái

Badge dùng để hiển thị trạng thái sinh viên.

### Trạng thái đề xuất

| Trạng thái | Ý nghĩa | Style |
|---|---|---|
| Active | Đang học | Xanh lá |
| Inactive | Tạm ngưng | Xám |
| Graduated | Đã tốt nghiệp | Xanh dương |
| Warning | Cần bổ sung hồ sơ | Vàng |
| Deleted | Đã xóa | Đỏ |

### CSS badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  color: var(--color-success);
  background: var(--color-success-light);
}

.badge-warning {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.badge-danger {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.badge-info {
  color: var(--color-info);
  background: var(--color-info-light);
}

.badge-muted {
  color: var(--color-text-muted);
  background: #F3F4F6;
}
```

---

## 7.6. Sidebar

Sidebar gồm logo/tên hệ thống và menu điều hướng.

### Menu đề xuất

```text
Dashboard
Students
Documents
Notifications
Settings
Logout
```

### CSS sidebar

```css
.sidebar-header {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.sidebar-menu {
  padding: 16px 12px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #D1D5DB;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
}

.sidebar-link:hover {
  background: var(--color-sidebar-hover);
  color: white;
}

.sidebar-link.active {
  background: var(--color-primary);
  color: white;
}
```

---

## 7.7. Navbar

Navbar dùng để hiển thị tiêu đề trang, tên người dùng và nút đăng xuất.

### CSS navbar

```css
.navbar-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.navbar-user-role {
  font-size: 12px;
  color: var(--color-text-muted);
}
```

---

## 7.8. Alert

Alert dùng để hiển thị thông báo thành công, lỗi hoặc cảnh báo.

### CSS alert

```css
.alert {
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  font-size: 14px;
  margin-bottom: 16px;
}

.alert-success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.alert-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.alert-danger {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.alert-info {
  background: var(--color-info-light);
  color: var(--color-info);
}
```

---

## 7.9. Modal

Modal dùng để xác nhận xóa sinh viên hoặc xác nhận thao tác quan trọng.

### CSS modal

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-md);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.modal-description {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
```

---

## 8. Thiết kế từng màn hình

---

## 8.1. Login Page

### Mục đích

Trang đăng nhập người dùng thông qua Amazon Cognito.

### Thành phần

- Logo hoặc tên hệ thống.
- Form email.
- Form password.
- Nút đăng nhập.
- Alert lỗi đăng nhập.
- Link quên mật khẩu nếu cần.

### Layout

```text
+--------------------------------+
| AWS Student Management Portal  |
|--------------------------------|
| Email                          |
| Password                       |
| [Login]                        |
+--------------------------------+
```

### CSS login

```css
.login-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-md);
}

.login-title {
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}
```

---

## 8.2. Dashboard Page

### Mục đích

Hiển thị tổng quan hệ thống.

### Thành phần

- Tổng số sinh viên.
- Số sinh viên đang học.
- Số hồ sơ đã upload.
- Số thông báo đã gửi.
- Bảng sinh viên mới nhất.

### Card thống kê

| Card | Dữ liệu |
|---|---|
| Total Students | Tổng sinh viên |
| Active Students | Sinh viên đang học |
| Documents | Tổng hồ sơ |
| Notifications | Tổng thông báo |

### Layout

```text
Page Title: Dashboard

[Total Students] [Active Students] [Documents] [Notifications]

[Recent Students Table]
```

### CSS dashboard

```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-muted);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 8px;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 8.3. Student List Page

### Mục đích

Hiển thị danh sách sinh viên và cho phép thao tác.

### Thành phần

- Tiêu đề trang.
- Nút thêm sinh viên.
- Ô tìm kiếm.
- Bộ lọc trạng thái.
- Table danh sách sinh viên.
- Nút xem/sửa/xóa.

### Layout

```text
Students
[Search input] [Filter status] [Add Student]

Table:
Mã SV | Họ tên | Email | Lớp | Ngành | Trạng thái | Hành động
```

### Quy tắc

- Nút `Thêm sinh viên` đặt góc phải.
- Tìm kiếm đặt phía trên table.
- Table có hover row.
- Xóa sinh viên cần có modal xác nhận.
- Nếu không có dữ liệu, hiển thị empty state.

---

## 8.4. Student Create Page

### Mục đích

Thêm sinh viên mới.

### Form field

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| studentId | Có | Không trùng |
| fullName | Có | Họ tên đầy đủ |
| email | Có | Đúng định dạng email |
| phone | Không | Số điện thoại |
| gender | Không | Male/Female/Other |
| dateOfBirth | Không | yyyy-mm-dd |
| major | Có | Ngành học |
| className | Có | Lớp |
| status | Có | Active mặc định |

### Layout

```text
Create Student

[Thông tin cơ bản]
studentId | fullName
email     | phone
gender    | dateOfBirth
major     | className
status

[Cancel] [Save]
```

---

## 8.5. Student Edit Page

### Mục đích

Cập nhật thông tin sinh viên.

### Quy tắc

- `studentId` không nên cho sửa.
- Các field còn lại cho phép sửa.
- Nút chính là `Update`.
- Nếu cập nhật thành công, hiển thị alert và quay về danh sách.

---

## 8.6. Student Detail Page

### Mục đích

Hiển thị chi tiết thông tin sinh viên.

### Thành phần

- Thông tin cơ bản.
- Trạng thái.
- Danh sách hồ sơ đã upload.
- Nút sửa thông tin.
- Nút upload hồ sơ.

### Layout

```text
Student Detail

[Basic Information Card]
[Document List Card]
[Action Buttons]
```

---

## 8.7. Upload Document Page

### Mục đích

Upload hồ sơ sinh viên lên S3 bằng Presigned URL.

### Thành phần

- Chọn loại hồ sơ.
- Chọn file.
- Nút upload.
- Progress hoặc loading state.
- Alert thành công/thất bại.

### Loại hồ sơ đề xuất

| Loại | Giá trị |
|---|---|
| Bảng điểm | transcript |
| CCCD/CMND | identity |
| Ảnh sinh viên | avatar |
| Giấy xác nhận | certificate |
| Hồ sơ khác | other |

### Quy tắc

- Chỉ cho phép file PDF, JPG, PNG.
- File size đề xuất tối đa 5MB hoặc 10MB.
- Upload xong cần lưu metadata vào DynamoDB.
- Không hiển thị trực tiếp S3 private URL nếu bucket không public.

---

## 9. Empty State

Khi không có dữ liệu, hiển thị trạng thái rỗng.

### Ví dụ

```text
Chưa có sinh viên nào.
Nhấn "Thêm sinh viên" để tạo sinh viên đầu tiên.
```

### CSS

```css
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-muted);
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
}
```

---

## 10. Loading State

Khi đang gọi API, hiển thị loading.

### Cách đơn giản

```text
Loading...
```

### CSS spinner cơ bản

```css
.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## 11. Error State

Khi API lỗi, hiển thị thông báo rõ ràng.

### Ví dụ lỗi

| Lỗi | Message hiển thị |
|---|---|
| 401 | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại. |
| 403 | Bạn không có quyền thực hiện thao tác này. |
| 404 | Không tìm thấy dữ liệu. |
| 500 | Hệ thống đang gặp lỗi. Vui lòng thử lại sau. |

---

## 12. Validation Form

### Quy tắc validation

| Field | Quy tắc |
|---|---|
| studentId | Bắt buộc, không chứa khoảng trắng |
| fullName | Bắt buộc, tối thiểu 2 ký tự |
| email | Bắt buộc, đúng định dạng email |
| phone | 9-11 số |
| major | Bắt buộc |
| className | Bắt buộc |
| status | Bắt buộc |

### Message đề xuất

```text
Vui lòng nhập mã sinh viên.
Vui lòng nhập họ tên.
Email không hợp lệ.
Số điện thoại không hợp lệ.
Vui lòng chọn ngành học.
Vui lòng nhập lớp.
```

---

## 13. Icon đề xuất

Có thể dùng thư viện:

```bash
npm install lucide-react
```

Icon đề xuất:

| Chức năng | Icon |
|---|---|
| Dashboard | LayoutDashboard |
| Students | Users |
| Documents | FileText |
| Notifications | Bell |
| Settings | Settings |
| Logout | LogOut |
| Add | Plus |
| Edit | Pencil |
| Delete | Trash2 |
| View | Eye |
| Upload | Upload |
| Search | Search |

---

## 14. File CSS cơ bản nên tạo

Đề xuất tạo:

```text
frontend/src/index.css
frontend/src/styles/layout.css
frontend/src/styles/components.css
frontend/src/styles/pages.css
```

Nếu muốn đơn giản hơn, có thể chỉ dùng:

```text
frontend/src/index.css
```

---

## 15. Basic CSS hoàn chỉnh để bắt đầu

Có thể copy đoạn dưới vào `frontend/src/index.css`:

```css
:root {
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-light: #DBEAFE;

  --color-bg: #F3F4F6;
  --color-surface: #FFFFFF;
  --color-sidebar: #111827;
  --color-sidebar-hover: #1F2937;

  --color-text: #111827;
  --color-text-muted: #6B7280;
  --color-text-light: #F9FAFB;
  --color-border: #E5E7EB;

  --color-success: #16A34A;
  --color-success-light: #DCFCE7;
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  --color-danger: #DC2626;
  --color-danger-light: #FEE2E2;
  --color-info: #0891B2;
  --color-info-light: #CFFAFE;

  --font-main: Inter, Arial, Helvetica, sans-serif;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);

  --sidebar-width: 260px;
  --navbar-height: 64px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-main);
  background: var(--color-bg);
  color: var(--color-text);
}

a {
  color: inherit;
}

button,
input,
select,
textarea {
  font-family: inherit;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  background: var(--color-bg);
}

.sidebar {
  width: var(--sidebar-width);
  min-height: 100vh;
  background: var(--color-sidebar);
  color: var(--color-text-light);
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-header {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.sidebar-menu {
  padding: 16px 12px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #D1D5DB;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
}

.sidebar-link:hover {
  background: var(--color-sidebar-hover);
  color: white;
}

.sidebar-link.active {
  background: var(--color-primary);
  color: white;
}

.main-wrapper {
  margin-left: var(--sidebar-width);
  width: calc(100% - var(--sidebar-width));
  min-height: 100vh;
}

.navbar {
  height: var(--navbar-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.navbar-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-user-name {
  font-size: 14px;
  font-weight: 500;
}

.navbar-user-role {
  font-size: 12px;
  color: var(--color-text-muted);
}

.main-content {
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.page-description {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 6px;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px 0;
}

.card-description {
  font-size: 14px;
  color: var(--color-text-muted);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-ghost {
  background: transparent;
  color: var(--color-primary);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 14px;
  color: var(--color-text);
  background: white;
  outline: none;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-error {
  font-size: 13px;
  color: var(--color-danger);
}

.table-wrapper {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #F9FAFB;
}

.table th {
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.table td {
  font-size: 14px;
  color: var(--color-text);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.table tr:hover {
  background: #F9FAFB;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  color: var(--color-success);
  background: var(--color-success-light);
}

.badge-warning {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.badge-danger {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.badge-info {
  color: var(--color-info);
  background: var(--color-info-light);
}

.badge-muted {
  color: var(--color-text-muted);
  background: #F3F4F6;
}

.alert {
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  font-size: 14px;
  margin-bottom: 16px;
}

.alert-success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.alert-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.alert-danger {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.alert-info {
  background: var(--color-info-light);
  color: var(--color-info);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-muted);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-muted);
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-md);
}

.login-title {
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main-wrapper {
    margin-left: 0;
    width: 100%;
  }

  .main-content {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 16. Component React mẫu

---

## 16.1. Layout mẫu

File đề xuất:

```text
frontend/src/components/Layout.jsx
```

```jsx
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({ children, title }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title={title} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
```

---

## 16.2. Sidebar mẫu

File đề xuất:

```text
frontend/src/components/Sidebar.jsx
```

```jsx
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Student Portal</div>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/students" className="sidebar-link">
          Students
        </NavLink>

        <NavLink to="/documents" className="sidebar-link">
          Documents
        </NavLink>

        <NavLink to="/notifications" className="sidebar-link">
          Notifications
        </NavLink>

        <NavLink to="/settings" className="sidebar-link">
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
```

---

## 16.3. Navbar mẫu

File đề xuất:

```text
frontend/src/components/Navbar.jsx
```

```jsx
function Navbar({ title }) {
  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>

      <div className="navbar-user">
        <div>
          <div className="navbar-user-name">Admin</div>
          <div className="navbar-user-role">Administrator</div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
```

---

## 16.4. StudentForm mẫu

File đề xuất:

```text
frontend/src/components/StudentForm.jsx
```

```jsx
function StudentForm({ formData, onChange, onSubmit, submitText = "Save" }) {
  return (
    <form onSubmit={onSubmit} className="card">
      <h2 className="card-title">Thông tin sinh viên</h2>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Mã sinh viên *</label>
          <input
            className="form-input"
            name="studentId"
            value={formData.studentId || ""}
            onChange={onChange}
            placeholder="SV001"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Họ tên *</label>
          <input
            className="form-input"
            name="fullName"
            value={formData.fullName || ""}
            onChange={onChange}
            placeholder="Nguyen Van A"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            className="form-input"
            name="email"
            value={formData.email || ""}
            onChange={onChange}
            placeholder="student@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Số điện thoại</label>
          <input
            className="form-input"
            name="phone"
            value={formData.phone || ""}
            onChange={onChange}
            placeholder="0909123456"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Ngành học *</label>
          <input
            className="form-input"
            name="major"
            value={formData.major || ""}
            onChange={onChange}
            placeholder="Information Technology"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Lớp *</label>
          <input
            className="form-input"
            name="className"
            value={formData.className || ""}
            onChange={onChange}
            placeholder="IT01"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Trạng thái *</label>
          <select
            className="form-select"
            name="status"
            value={formData.status || "Active"}
            onChange={onChange}
          >
            <option value="Active">Đang học</option>
            <option value="Inactive">Tạm ngưng</option>
            <option value="Graduated">Đã tốt nghiệp</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button type="submit" className="btn btn-primary">
          {submitText}
        </button>

        <button type="button" className="btn btn-secondary">
          Hủy
        </button>
      </div>
    </form>
  );
}

export default StudentForm;
```

---

## 17. Quy tắc đặt tên class CSS

Sử dụng class rõ nghĩa, dễ hiểu:

```text
app-layout
main-wrapper
main-content
page-header
page-title
card
card-title
btn
btn-primary
form-group
form-input
table-wrapper
badge-success
alert-danger
```

Không nên đặt tên quá chung như:

```text
box
item
left
right
abc
style1
```

---

## 18. Quy tắc UX cơ bản

- Mỗi trang phải có tiêu đề rõ ràng.
- Nút chính luôn nổi bật bằng màu xanh.
- Hành động xóa phải dùng màu đỏ.
- Xóa dữ liệu phải có confirm modal.
- Form dài nên chia nhóm.
- Khi đang loading phải báo cho người dùng biết.
- Khi thao tác thành công phải có alert.
- Khi lỗi phải hiển thị message dễ hiểu.
- Không để trang trắng khi chưa có dữ liệu.
- Không hiển thị lỗi kỹ thuật quá dài cho người dùng cuối.

---

## 19. Checklist thiết kế giao diện

Trước khi hoàn thành frontend, kiểm tra:

- [ ] Có layout sidebar + navbar.
- [ ] Có trang login.
- [ ] Có dashboard.
- [ ] Có trang danh sách sinh viên.
- [ ] Có form thêm sinh viên.
- [ ] Có form sửa sinh viên.
- [ ] Có trang chi tiết sinh viên.
- [ ] Có chức năng upload hồ sơ.
- [ ] Có loading state.
- [ ] Có empty state.
- [ ] Có error message.
- [ ] Có responsive mobile cơ bản.
- [ ] Table không bị vỡ trên màn hình nhỏ.
- [ ] Button, input, card dùng style thống nhất.
- [ ] Màu sắc đúng theo design tokens.
- [ ] Code CSS không bị trùng lặp quá nhiều.

---

## 20. Gợi ý màu theo vai trò

Nếu cần hiển thị role người dùng:

| Role | Màu |
|---|---|
| Admin | Đỏ hoặc tím |
| Staff | Xanh dương |
| Teacher | Xanh lá |
| Student | Xám |

CSS đề xuất:

```css
.role-admin {
  background: #FEE2E2;
  color: #DC2626;
}

.role-staff {
  background: #DBEAFE;
  color: #2563EB;
}

.role-teacher {
  background: #DCFCE7;
  color: #16A34A;
}

.role-student {
  background: #F3F4F6;
  color: #6B7280;
}
```

---

## 21. Kết luận

Giao diện của dự án **AWS Student Management Portal** nên đi theo hướng **basic, clean, dễ dùng và dễ triển khai**.

Bộ style trong tài liệu này đủ để xây dựng:

- Dashboard
- Sidebar
- Navbar
- Login page
- Student table
- Student form
- Upload document page
- Alert
- Badge
- Modal
- Loading state
- Empty state

Khi triển khai frontend, nên bắt đầu từ `index.css`, sau đó tạo từng component theo đúng cấu trúc đã định để dự án dễ bảo trì và dễ trình bày trong báo cáo.
