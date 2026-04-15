import { Router } from 'express';
import { getDashboardStats } from '../controllers/admin.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticate, authorizeAdmin, getDashboardStats);

export default router;
