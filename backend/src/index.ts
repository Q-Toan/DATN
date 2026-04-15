import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import couponRoutes from './routes/coupon.routes';
import userRoutes from './routes/user.routes';
import blogRoutes from './routes/blog.routes';
import reviewRoutes from './routes/review.routes';
import inventoryRoutes from './routes/inventory.routes';
import revenueRoutes from './routes/revenue.routes';
import categoryRoutes from './routes/category.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

// Optimization & Logging
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

app.post('/api/orders/test', (req: Request, res: Response) => {
  res.json({ message: 'Orders route is reachable' });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Ecommerce Backend API is running' });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('SERVER_ERROR:', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Export for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
