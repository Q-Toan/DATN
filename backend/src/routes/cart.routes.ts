import { Router } from 'express';
import { getCart, addToCart, updateCartItem } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItem);

export default router;
