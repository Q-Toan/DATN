import { Router } from 'express';
import { getRevenueStats } from '../controllers/revenue.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/stats', getRevenueStats);

export default router;
