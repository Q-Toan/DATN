import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  getAllReviews,
  toggleReviewStatus,
} from '../controllers/review.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/product/:productId', getProductReviews);

// User
router.post('/', authenticate, createReview);

// Admin
router.get('/all', authenticate, authorizeAdmin, getAllReviews);
router.patch('/:id/toggle-visibility', authenticate, authorizeAdmin, toggleReviewStatus);

export default router;
