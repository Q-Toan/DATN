# E-commerce Sneaker Showcase - Đồ án Tốt nghiệp (DATN)

Dự án này là một hệ thống thương mại điện tử hoàn chỉnh dành cho việc kinh doanh giày sneaker, bao gồm giao diện người dùng (Frontend) và hệ thống máy chủ xử lý dữ liệu (Backend).

## 📂 Cấu trúc dự án

Dự án được chia thành hai phần chính:

*   **[`/gi-y-x-n-showcase`](./gi-y-x-n-showcase)**: Giao diện người dùng được xây dựng bằng React và Vite.
*   **[`/backend`](./backend)**: Hệ thống API xử lý logic, kết nối database và xác thực người dùng.

---

## 🚀 Công nghệ sử dụng

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI / shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router DOM
- **Form Handling:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Authentication:** JSON Web Token (JWT) & bcryptjs
- **Validation:** Zod

---

## 🛠️ Hướng dẫn cài đặt

### 1. Chuẩn bị môi trường
- NodeJS (v18 trở lên)
- Một Database (PostgreSQL hoặc MySQL tùy cấu hình Prisma)

### 2. Cài đặt Backend
```bash
cd backend
npm install
# Tạo file .env và điền DATABASE_URL
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Cài đặt Frontend
```bash
cd gi-y-x-n-showcase
npm install
npm run dev
```

---

## 🌐 Triển khai (Deployment)

Dự án có thể được triển khai trên **Vercel** (cho cả Front và Back):
- **Frontend:** Tự động nhận diện Vite project.
- **Backend:** Cần file `vercel.json` để chạy dưới dạng Serverless Functions.
- **Database:** Cần sử dụng Database Online (như Supabase, MongoDB Atlas, v.v.).

---

## 🤝 Liên hệ
- **Project Name:** Sneaker Showcase Showcase
- **Status:** Development / Đồ án tốt nghiệp
