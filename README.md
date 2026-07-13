# ChoXeMay - Website Mua Bán Xe Máy Cũ

ChoXeMay là hệ thống hỗ trợ đăng tin, tìm kiếm và mua bán xe máy cũ tại TP. Hồ Chí Minh.

## Công nghệ sử dụng

### Frontend
- ReactJS (Vite)
- React Router DOM
- Axios
- Lucide React

### Backend
- Node.js
- ExpressJS
- JWT Authentication
- Multer

### Database
- Microsoft SQL Server

---

# Yêu cầu cài đặt

- Node.js 18 trở lên
- SQL Server
- SQL Server Management Studio (SSMS)
- Visual Studio Code

---

# Hướng dẫn cài đặt

## Bước 1: Clone project

```bash
git clone https://github.com/pth-aimy04/ChoXeMay.git
```

Hoặc tải file ZIP từ GitHub và giải nén.

---

## Bước 2: Cài đặt Database

1. Mở SQL Server Management Studio (SSMS).
2. Mở file:

```
database/ChoXeMayDB.sql
```

3. Nhấn **Execute** để tạo cơ sở dữ liệu.

Sau khi thực hiện thành công sẽ có database:

```
ChoXeMayDB
```

---

## Bước 3: Cấu hình Backend

Di chuyển đến thư mục backend.

```bash
cd backend
```

Cài đặt các package.

```bash
npm install
```

Tạo file:

```
backend/.env
```

với nội dung:

```env
PORT=5000

DB_USER=sa
DB_PASSWORD=YOUR_SQL_PASSWORD
DB_SERVER=localhost
DB_NAME=ChoXeMayDB

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Thay đổi các giá trị sau:

| Biến | Mô tả |
|-------|------|
| DB_USER | Tài khoản SQL Server |
| DB_PASSWORD | Mật khẩu SQL Server |
| DB_SERVER | Server SQL (thường là localhost) |
| DB_NAME | ChoXeMayDB |
| JWT_SECRET | Chuỗi bí mật dùng để tạo JWT |
| EMAIL_USER | Email dùng gửi OTP |
| EMAIL_PASS | App Password của Gmail |

---

## Bước 4: Chạy Backend

```bash
npm start
```

hoặc

```bash
node server.js
```

Nếu thành công sẽ hiển thị:

```
Server running on port 5000
SQL Server Connected
```

---

## Bước 5: Cài đặt Frontend

Mở terminal mới.

```bash
cd frontend
```

Cài package.

```bash
npm install
```

Tạo file:

```
frontend/.env
```

với nội dung:

```env
VITE_API_URL=http://localhost:5000/api
```

Nếu backend chạy ở server khác, thay đổi địa chỉ tương ứng.

---

## Bước 6: Chạy Frontend

```bash
npm run dev
```

Sau khi chạy thành công sẽ xuất hiện:

```
http://localhost:5173
```

hoặc

```
http://localhost:5174
```

Tùy theo cổng được Vite cấp.

---

# Tài khoản mẫu

## Quản trị viên

Email:

```
admin@gmail.com
```

Mật khẩu:

```
123456
```

## Người dùng

Đăng ký tài khoản mới hoặc sử dụng tài khoản có sẵn trong cơ sở dữ liệu.

---

# Chức năng chính

### Người dùng

- Đăng ký
- Đăng nhập
- Quên mật khẩu (OTP Email)
- Đăng tin bán xe
- Chỉnh sửa/Xóa tin
- Đánh dấu đã bán
- Tìm kiếm
- Lọc xe
- Bình luận
- Theo dõi người bán
- Yêu thích
- Nhắn tin
- Xem lịch sử
- Quản lý hồ sơ
- Nhận thông báo

### Quản trị viên

- Quản lý người dùng
- Quản lý tin đăng
- Duyệt/Từ chối tin
- Quản lý hãng xe
- Quản lý dòng xe
- Quản lý loại xe
- Gửi thông báo
- Thống kê hệ thống

---

# Một số lưu ý

- SQL Server phải được bật trước khi chạy Backend.
- Cần cài đúng các package bằng `npm install`.
- Kiểm tra thông tin kết nối trong file `.env` nếu Backend không kết nối được cơ sở dữ liệu.
- Nếu chức năng gửi OTP không hoạt động, hãy kiểm tra lại `EMAIL_USER` và `EMAIL_PASS`.

---

# Cấu trúc thư mục

```
ChoXeMay
│
├── backend
│
├── frontend
│
├── database
│   └── ChoXeMayDB.sql
│
└── README.md
```

---

# Tác giả

**Phan Thị Ái My**

Sinh viên Khoa Công nghệ Thông tin

Trường Đại học Tài nguyên và Môi trường TP. Hồ Chí Minh