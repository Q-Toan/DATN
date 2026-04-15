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

const shoeImages = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop",
];

const shoeNames = [
  "Nike Air Max 270", "Adidas Ultraboost 22", "Nike Air Force 1", "Puma RS-X",
  "New Balance 574", "Converse Chuck 70", "Vans Old Skool", "Nike Dunk Low",
  "Adidas Stan Smith", "Nike Jordan 1", "Reebok Classic", "Asics Gel-Lyte",
  "Nike Blazer Mid", "Adidas Superstar", "Puma Suede", "Nike Air Max 90",
];

function generateProducts(category: string, badge: Product["badge"], count: number): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const price = Math.floor(Math.random() * 2000000) + 800000;
    const hasDiscount = category === "sale" || Math.random() > 0.5;
    const discount = category === "sale" ? Math.floor(Math.random() * 30) + 10 : hasDiscount ? Math.floor(Math.random() * 20) + 5 : 0;
    return {
      id: `${category}-${i}`,
      name: shoeNames[(i + (category === "best-seller" ? 0 : category === "new-arrival" ? 4 : category === "featured" ? 8 : 12)) % shoeNames.length],
      image: shoeImages[(i + (category === "best-seller" ? 0 : category === "new-arrival" ? 3 : category === "featured" ? 6 : 9)) % shoeImages.length],
      price,
      salePrice: discount > 0 ? Math.floor(price * (1 - discount / 100)) : undefined,
      badge,
      discount: discount > 0 ? discount : undefined,
      category,
    };
  });
}

export const bestSellers = generateProducts("best-seller", "Hot", 16);
export const newArrivals = generateProducts("new-arrival", "New", 16);
export const featuredProducts = generateProducts("featured", undefined, 16);
export const saleProducts = generateProducts("sale", "Sale", 16);

export const allProducts = [...bestSellers, ...newArrivals, ...featuredProducts, ...saleProducts];

export const mockCategories: Category[] = [
  { id: "1", name: "Best Sellers", slug: "best-seller", productCount: 16, status: "Active" },
  { id: "2", name: "New Arrivals", slug: "new-arrival", productCount: 16, status: "Active" },
  { id: "3", name: "Featured", slug: "featured", productCount: 16, status: "Active" },
  { id: "4", name: "Sale", slug: "sale", productCount: 16, status: "Active" },
];

export const mockUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", joined: "2024-01-15" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Customer", status: "Active", joined: "2024-03-22" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", role: "Customer", status: "Active", joined: "2024-05-10" },
  { id: "4", name: "Alice Brown", email: "alice@example.com", role: "Customer", status: "Banned", joined: "2024-06-01" },
  { id: "5", name: "Bob Wilson", email: "bob@example.com", role: "Staff", status: "Active", joined: "2024-07-18" },
];

export const posts: Post[] = [
  {
    id: "1",
    title: "The Ultimate Sneaker Guide for 2024",
    excerpt: "Discover the hottest sneaker trends of the year, from athletic performance to street style icons.",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=400&fit=crop",
    date: "2024-12-15",
  },
  {
    id: "2",
    title: "How to Style Sneakers with Formal Wear",
    excerpt: "A comprehensive guide on blending athletic comfort with sophisticated formal aesthetics.",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=400&fit=crop",
    date: "2024-12-10",
  },
  {
    id: "3",
    title: "Maintaining Your Collection: Pro Tips",
    excerpt: "Simple hacks to keep your favorite sneakers looking brand new for years to come.",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=400&fit=crop",
    date: "2024-12-05",
  },
  {
    id: "4",
    title: "Spring Summer 2025 Sneaker Trends",
    excerpt: "Stay ahead of the curve with our preview of the upcoming season's must-have footwear.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=400&fit=crop",
    date: "2024-11-28",
  },
];

export const reviews: Review[] = [
  { id: "1", name: "John Doe", avatar: "https://i.pravatar.cc/100?img=1", rating: 5, content: "Excellent quality and fast shipping. Highly recommended!" },
  { id: "2", name: "Jane Smith", avatar: "https://i.pravatar.cc/100?img=5", rating: 5, content: "Perfect fit and beautiful color. very comfortable for daily use." },
  { id: "3", name: "Mike Johnson", avatar: "https://i.pravatar.cc/100?img=3", rating: 4, content: "Great service and authentic products at a reasonable price." },
  { id: "4", name: "Alice Brown", avatar: "https://i.pravatar.cc/100?img=9", rating: 5, content: "Third purchase here, always satisfied with the packaging and speed." },
  { id: "5", name: "Bob Wilson", avatar: "https://i.pravatar.cc/100?img=7", rating: 4, content: "Stylish and build quality is top-notch. Staff was very helpful." },
];



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

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Nguyễn Văn An",
    email: "an@email.com",
    phoneNumber: "0901234567",
    totalAmount: 2500000,
    status: "Đã hoàn thành",
    date: "2024-12-20",
    items: [{ productId: "best-seller-0", name: "Nike Air Max 270", quantity: 1, price: 2500000 }],
  },
  {
    id: "ORD-002",
    customerName: "Trần Thị Mai",
    email: "mai@email.com",
    phoneNumber: "0912345678",
    totalAmount: 1800000,
    status: "Đang giao",
    date: "2024-12-22",
    items: [{ productId: "new-arrival-1", name: "Adidas Ultraboost 22", quantity: 1, price: 1800000 }],
  },
  {
    id: "ORD-003",
    customerName: "Lê Hoàng Nam",
    email: "nam@email.com",
    phoneNumber: "0987654321",
    totalAmount: 4200000,
    status: "Đang xử lý",
    date: "2024-12-24",
    items: [
      { productId: "featured-2", name: "Nike Air Force 1", quantity: 1, price: 2200000 },
      { productId: "sale-3", name: "Puma RS-X", quantity: 1, price: 2000000 },
    ],
  },
  {
    id: "ORD-004",
    customerName: "Phạm Thùy Linh",
    email: "linh@email.com",
    phoneNumber: "0977889900",
    totalAmount: 1500000,
    status: "Chờ xử lý",
    date: "2024-12-25",
    items: [{ productId: "best-seller-4", name: "New Balance 574", quantity: 1, price: 1500000 }],
  },
  {
    id: "ORD-005",
    customerName: "Võ Minh Tuấn",
    email: "tuan@email.com",
    phoneNumber: "0933445566",
    totalAmount: 3000000,
    status: "Đã hủy",
    date: "2024-12-15",
    items: [{ productId: "new-arrival-5", name: "Converse Chuck 70", quantity: 2, price: 1500000 }],
  },
];

export const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920&h=600&fit=crop",
    title: "Bộ Sưu Tập Mới 2025",
    subtitle: "Phong cách hiện đại, chất lượng đỉnh cao",
  },
  {
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1920&h=600&fit=crop",
    title: "Giảm Giá Lên Đến 50%",
    subtitle: "Săn deal hot - Số lượng có hạn",
  },
  {
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&h=600&fit=crop",
    title: "Giày Chính Hãng 100%",
    subtitle: "Cam kết hàng thật giá thật",
  },
];

