import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';
import { z } from 'zod';

const importStockSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
});

export const importStock = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, reason } = importStockSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });

      // 2. Log inventory
      await tx.inventoryLog.create({
        data: {
          productId,
          type: 'IMPORT',
          quantity,
          reason: reason || 'Manual Import',
        },
      });

      return updatedProduct;
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to import stock', error });
  }
};

export const getInventoryHistory = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      include: {
        product: {
          select: { name: true, category: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory history', error });
  }
};
