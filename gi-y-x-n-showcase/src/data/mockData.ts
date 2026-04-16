export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  badge?: "Hot" | "New" | "Sale";
  discount?: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  status: "Active" | "Hidden";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Staff" | "Customer";
  status: "Active" | "Banned" | "Hidden";
  joined: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  content: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  totalAmount: number;
  status: "Chờ xử lý" | "Đang xử lý" | "Đang giao" | "Đã hoàn thành" | "Đã hủy";
  date: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
}
