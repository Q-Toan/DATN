import { Router } from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary';
import { uploadImage } from '../controllers/upload.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage });

// Only admins can upload images for products
router.post('/', authenticate, authorizeAdmin, upload.single('image'), uploadImage);

export default router;
