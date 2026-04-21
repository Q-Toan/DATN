const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Clear existing data to avoid schema conflicts
  await prisma.revenue.deleteMany({}); // Revenue depends on Order
  await prisma.inventoryLog.deleteMany({}); // InventoryLog depends on Product
  await prisma.review.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.revenue.deleteMany({});

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const usersData = [
    { email: 'user1@test.com', name: 'John Sneaker', role: 'USER' },
    { email: 'user2@test.com', name: 'Jane Doe', role: 'USER' },
    { email: 'alex@test.com', name: 'Alex Kicks', role: 'USER' },
  ];

  const seededUsers = [];
  for (const u of usersData) {
    const createdUser = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: hashedPassword },
    });
    seededUsers.push(createdUser);
  }

  // Create Categories First
  const categoriesData = [
    { name: 'Lifestyle', slug: 'lifestyle' },
    { name: 'Running', slug: 'running' },
    { name: 'Basketball', slug: 'basketball' },
  ];

  const seededCategories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { ...cat, isActive: true },
    });
    seededCategories[cat.name] = createdCat.id;
  }

  // Create Multiple Products for categories
  const products = [
    {
      name: "Nike Air Max 270 'Brutalist Concrete'",
      description: "Phiên bản thiết kế giới hạn mang phong cách kiến trúc Brutalism với đế Air Max huyền thoại.",
      price: 4500000,
      stock: 15,
      categoryId: seededCategories['Lifestyle'],
      colors: ["Grey", "Black", "Anthracite"],
      sizes: ["40", "41", "42", "42.5", "43", "44"],
      images: ["/uploads/nike_air_max.png"],
    },
    {
      name: "Adidas Ultraboost 22 'Solar Energy'",
      description: "Dòng giày chạy bộ cao cấp với đệm Boost hoàn trả năng lượng cực tốt.",
      price: 3800000,
      stock: 20,
      categoryId: seededCategories['Running'],
      colors: ["Orange", "Blue", "White"],
      sizes: ["39", "40", "41", "42", "43"],
      images: ["/uploads/adidas_running.png"],
    },
    {
      name: "Air Jordan 1 Retro 'Chicago High'",
      description: "Biểu tượng của làng sneaker thế giới với phối màu di sản.",
      price: 12500000,
      stock: 5,
      categoryId: seededCategories['Basketball'],
      colors: ["Red", "White", "Black"],
      sizes: ["40", "41", "42", "43", "44", "45"],
      images: ["/uploads/jordan_basketball.png"],
    },
    {
      name: "New Balance 550 'White Grey'",
      description: "Mẫu giày vintage lấy cảm hứng từ thập niên 90, cực kỳ dễ phối đồ.",
      price: 3200000,
      stock: 25,
      categoryId: seededCategories['Lifestyle'],
      colors: ["White", "Grey"],
      sizes: ["38", "39", "40", "41", "42"],
      images: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format"],
    },
    {
      name: "Nike ZoomX Vaporfly NEXT% 2",
      description: "Cỗ máy tốc độ dành cho những vận động viên marathon chuyên nghiệp.",
      price: 6500000,
      stock: 12,
      categoryId: seededCategories['Running'],
      colors: ["Electric Green", "White"],
      sizes: ["40", "41", "42", "43"],
      images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format"],
    }
  ];

  const seededProducts = [];
  for (const p of products) {
    const createdProduct = await prisma.product.create({ data: p });
    seededProducts.push(createdProduct);
  }

  // Create Reviews for the first product
  const reviews = [
    { comment: "Giày quá đẹp, đi cực êm chân. Phối màu xám bê tông nhìn rất chất!", rating: 5, userId: seededUsers[0].id },
    { comment: "Giao hàng nhanh, đóng gói cẩn thận. Rất hài lòng với mẫu Air Max này.", rating: 5, userId: seededUsers[1].id },
    { comment: "Size chuẩn, form ôm chân. Phù hợp cho cả đi chơi và tập luyện.", rating: 4, userId: seededUsers[2].id },
  ];

  for (const r of reviews) {
    await prisma.review.create({
      data: {
        ...r,
        productId: seededProducts[0].id,
      }
    });
  }

  // Create Blogs
  const blogs = [
    { 
      title: "Xu hướng Sneaker 2026: Sự trỗi dậy của phong cách Brutalism", 
      content: "Năm 2026 đánh dấu sự trở lại mạnh mẽ của các thiết kế góc cạnh, thô mộc...",
      author: "SneakerHead VN",
      thumbnail: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format",
    },
    { 
      title: "Cách bảo quản giày Sneaker luôn bền đẹp", 
      content: "Vệ sinh giày đúng cách không chỉ giúp giày đẹp mà còn kéo dài tuổi thọ túi khí...",
      author: "GiayXin Team",
      thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format",
    },
  ];

  for (const b of blogs) {
    await prisma.blog.create({ data: b });
  }

  // Create Coupons
  const coupons = [
    { code: 'GIAYXIN2026', discountPercent: 20, expiryDate: new Date('2026-12-31'), isActive: true },
    { code: 'SALE10', discountPercent: 10, expiryDate: new Date('2026-12-31'), isActive: true },
    { code: 'HOTDEAL', discountPercent: 50, expiryDate: new Date('2026-12-31'), isActive: true },
    { code: 'EXPIRED', discountPercent: 90, expiryDate: new Date('2024-01-01'), isActive: true },
  ];

  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
