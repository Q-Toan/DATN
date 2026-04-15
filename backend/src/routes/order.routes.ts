import { Router } from 'express';
import {
  checkout,
  getMyOrders,
  adminGetAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/checkout', authenticate, checkout);
router.get('/my-orders', authenticate, getMyOrders);

// Admin only
router.get('/admin/all', authenticate, authorizeAdmin, adminGetAllOrders);
router.patch('/admin/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

export default router;
