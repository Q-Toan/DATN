import { Router } from 'express';
import { importStock, getInventoryHistory } from '../controllers/inventory.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.post('/import', importStock);
router.get('/history', getInventoryHistory);

export default router;
