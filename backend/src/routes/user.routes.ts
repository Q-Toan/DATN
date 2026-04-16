import { Router } from 'express';
import { getAllUsers, toggleUserStatus, getMe } from '../controllers/user.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// Publicly authenticated route (any user can see their own profile)
router.get('/me', authenticate, getMe);

// Admin only routes
router.get('/', authenticate, authorizeAdmin, getAllUsers);
router.patch('/:id/toggle-status', authenticate, authorizeAdmin, toggleUserStatus);

export default router;
