import { Router } from 'express';
import {
  createBlog,
  getAllBlogs,
  getPublishedBlogs,
  toggleBlogStatus,
  updateBlog,
  deleteBlog
} from '../controllers/blog.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

// Public
router.get('/published', getPublishedBlogs);
router.get('/:id', getPublishedBlogs); // Placeholder for single blog

// Admin
router.get('/', authenticate, authorizeAdmin, getAllBlogs);
router.post('/', authenticate, authorizeAdmin, upload.single('thumbnail'), createBlog);
router.patch('/:id', authenticate, authorizeAdmin, upload.single('thumbnail'), updateBlog);
router.patch('/:id/toggle', authenticate, authorizeAdmin, toggleBlogStatus);
router.delete('/:id', authenticate, authorizeAdmin, deleteBlog);

export default router;
