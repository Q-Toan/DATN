import { Router } from 'express';
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// Manage coupons (Admin only)
router.get('/', authenticate, authorizeAdmin, getCoupons);
router.post('/', authenticate, authorizeAdmin, createCoupon);
router.delete('/:id', authenticate, authorizeAdmin, deleteCoupon);

// Use coupon (Authenticated users)
router.post('/validate', authenticate, validateCoupon);

export default router;
