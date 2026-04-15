import { Router } from 'express';
import { getAllUsers, toggleUserStatus } from '../controllers/user.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/', getAllUsers);
router.patch('/:id/toggle-status', toggleUserStatus);

export default router;
