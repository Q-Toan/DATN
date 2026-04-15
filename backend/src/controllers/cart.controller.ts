import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';
import { z } from 'zod';

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  color: z.string().optional(),
  size: z.string().optional(),
});

interface ICartItem {
  productId: string;
  quantity: number;
  color?: string | null;
  size?: string | null;
}

const populateCartItems = async (cart: any) => {
  if (!cart) return null;
  const productIds = cart.items.map((item: any) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  // Filter out items that no longer have a valid product (Self-healing)
  const validItems = cart.items
    .filter((item: any) => products.some((p) => p.id === item.productId))
    .map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        ...item,
        product,
      };
    });

  // If items were removed, we should sync this back to the DB to prevent future issues
  if (validItems.length !== cart.items.length) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: validItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size
        }))
      }
    });
  }

  return {
    ...cart,
    items: validItems,
  };
};

export const getCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  const populatedCart = await populateCartItems(cart);
  res.json(populatedCart || { userId, items: [] });
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  console.log('API_CART // ADD_ATTEMPT:', { body: req.body, userId: req.user?.id });
  try {
    const { productId, quantity, color, size } = cartItemSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) {
      console.warn('API_CART // UNAUTHORIZED');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Normalize variant values to null for consistent comparison
    const targetColor = color ?? null;
    const targetSize = size ?? null;

    // Stock verification
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      console.error('API_CART // PRODUCT_NOT_FOUND:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Validate color/size if provided
    if (color && !product.colors.includes(color)) {
      console.error('API_CART // INVALID_COLOR:', { color, available: product.colors });
      return res.status(400).json({ message: `Color ${color} not available for this product` });
    }
    if (size && !product.sizes.includes(size)) {
      console.error('API_CART // INVALID_SIZE:', { size, available: product.sizes });
      return res.status(400).json({ message: `Size ${size} not available for this product` });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    
    if (!cart) {
      console.log('API_CART // CREATING_NEW_CART');
      if (quantity > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} items in stock` });
      }
      cart = await prisma.cart.create({
        data: { userId, items: [{ productId, quantity, color: targetColor, size: targetSize }] },
      });
    } else {
      console.log('API_CART // UPDATING_EXISTING_CART');
      // Group by productId + color + size
      const existingItemIndex = (cart.items as any[]).findIndex(
        (item) => item.productId === productId && item.color === targetColor && item.size === targetSize
      );
      const newItems = [...(cart.items as any[])];

      if (existingItemIndex > -1) {
        const totalQuantity = newItems[existingItemIndex].quantity + quantity;
        if (totalQuantity > product.stock) {
          return res.status(400).json({ message: 'Exceeds stock limit' });
        }
        newItems[existingItemIndex].quantity = totalQuantity;
      } else {
        if (quantity > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} items in stock` });
        }
        newItems.push({ productId, quantity, color: targetColor, size: targetSize });
      }

      cart = await prisma.cart.update({
        where: { userId },
        data: { items: newItems },
      });
    }

    console.log('API_CART // SUCCESS');
    const populatedCart = await populateCartItems(cart);
    res.json(populatedCart);
  } catch (error) {
    console.error('API_CART // FAILED:', error);
    res.status(400).json({ message: 'Failed to add to cart', error });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, color, size } = z.object({
      productId: z.string(),
      quantity: z.number().int().min(0), // 0 means remove
      color: z.string().optional(),
      size: z.string().optional(),
    }).parse(req.body);
    
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const targetColor = color ?? null;
    const targetSize = size ?? null;

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product && quantity > 0) return res.status(404).json({ message: 'Product not found' });

    if (quantity > (product?.stock || 0)) {
      return res.status(400).json({ message: 'Exceeds stock limit' });
    }

    let newItems = [...(cart.items as any[])];
    const itemIndex = newItems.findIndex(
      item => item.productId === productId && item.color === targetColor && item.size === targetSize
    );

    if (quantity === 0) {
      if (itemIndex > -1) {
        newItems.splice(itemIndex, 1);
      }
    } else {
      if (itemIndex > -1) {
        newItems[itemIndex].quantity = quantity;
      } else {
        newItems.push({ productId, quantity, color: targetColor, size: targetSize });
      }
    }

    cart = await prisma.cart.update({
      where: { userId },
      data: { items: newItems },
    });

    const populatedCart = await populateCartItems(cart);
    res.json(populatedCart);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update cart', error });
  }
};
