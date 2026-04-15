import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from '../controllers/product.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only routes
router.post('/', authenticate, authorizeAdmin, upload.array('images', 5), createProduct);
router.patch('/:id', authenticate, authorizeAdmin, upload.array('images', 5), updateProduct);
router.patch('/:id/toggle', authenticate, authorizeAdmin, toggleProductStatus);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;
