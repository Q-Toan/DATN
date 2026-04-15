# Sneaker Showcase - Frontend

Giao diện người dùng cho hệ thống thương mại điện tử Sneaker Showcase.

## 🚀 Công nghệ sử dụng

- **React 18** & **Vite**: Nền tảng phát triển nhanh và tối ưu.
- **Tailwind CSS**: Framework thiết kế giao diện linh hoạt.
- **shadcn/ui**: Bộ component UI cao cấp dựa trên Radix UI.
- **TanStack Query (React Query)**: Quản lý trạng thái và dữ liệu từ API.
- **React Router DOM**: Điều hướng giữa các trang.
- **Lucide React**: Hệ thống icon đồng bộ.

## 🛠️ Cài đặt & Chạy dự án

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Cấu hình môi trường:
Tạo file `.env` (nếu cần) để cấu hình đường dẫn API:
```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Chạy chế độ phát triển (Development):
```bash
npm run dev
```

### 4. Build sản phẩm:
```bash
npm run build
```

## 📂 Miêu tả các thư mục chính

- `src/components/`: Các component UI dùng chung và component chức năng.
- `src/pages/`: Các trang giao diện chính (Home, Shop, Cart, Account...).
- `src/hooks/`: Các custom hooks xử lý logic và gọi API.
- `src/lib/`: Cấu hình thư viện (axios, utils...).

---

## 🎨 UI/UX Design

Dự án sử dụng ngôn ngữ thiết kế hiện đại, tập trung vào trải nghiệm người dùng với:
- Chế độ Dark/Light mode.
- Hiệu ứng chuyển cảnh mượt mà.
- Đáp ứng tốt trên thiết bị di động (Responsive).

