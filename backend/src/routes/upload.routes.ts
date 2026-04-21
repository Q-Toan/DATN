import { Router } from 'express';
import { storage, upload } from '../config/cloudinary';
import { uploadImage } from '../controllers/upload.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// Only admins can upload images for products
// Using .route('/') and defining .post directly on the router to be more robust
router.post('/', authenticate, authorizeAdmin, upload.single('image'), uploadImage);
router.post('', authenticate, authorizeAdmin, upload.single('image'), uploadImage);

export default router;
