import { Router } from 'express';
import {
  getCategories,
  adminGetCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus
} from '../controllers/category.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getCategories);

// Admin only
router.get('/admin/all', authenticate, authorizeAdmin, adminGetCategories);
router.post('/', authenticate, authorizeAdmin, createCategory);
router.patch('/:id', authenticate, authorizeAdmin, updateCategory);
router.patch('/:id/toggle', authenticate, authorizeAdmin, toggleCategoryStatus);

export default router;
