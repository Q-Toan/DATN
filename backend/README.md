# Sneaker Showcase - Backend API

Hệ thống cung cấp API cho ứng dụng thương mại điện tử Sneaker Showcase.

## 🛠️ Công nghệ (Tech Stack)

- **Express.js**: Framework web chính.
- **TypeScript**: Ngôn ngữ lập trình chính.
- **Prisma**: ORM để giao tiếp với Database.
- **Zod**: Xác thực dữ liệu (Validation).
- **JWT**: Xác thực người dùng (Authentication).

## 🚀 Cài đặt & Chạy dự án

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Cấu hình môi trường (`.env`):
Tạo file `.env` tại thư mục gốc của `/backend` với các nội dung sau:
```env
DATABASE_URL="postgres://user:password@localhost:5432/dbname"
JWT_SECRET="your_secret_key"
PORT=5000
```

### 3. Cập nhật Database:
```bash
npx prisma db push
```

### 4. Chạy chế độ phát triển (Development):
```bash
npm run dev
```

## 📂 Cấu trúc thư mục

- `src/controllers/`: Xử lý logic request/response.
- `src/routes/`: Khai báo các endpoint API.
- `src/middleware/`: Các hàm trung gian xử lý Auth, Error, v.v.
- `prisma/`: Chứa schema database.

## 📡 API Endpoints (Cơ bản)

- `POST /api/auth/register`: Đăng ký tài khoản.
- `POST /api/auth/login`: Đăng nhập.
- `GET /api/products`: Lấy danh sách sản phẩm.
- `GET /api/cart`: Lấy thông tin giỏ hàng.

---

## ⚠️ Lưu ý khi triển khai Serverless (Vercel)

- Luôn sử dụng biến môi trường được cấu hình trên Dashboard Vercel.
- Kết nối tới Database Online (không sử dụng localhost).
