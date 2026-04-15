import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

const couponSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  discountPercent: z.number().min(0).max(100),
  expiryDate: z.string().transform((str) => new Date(str)),
  isActive: z.boolean().default(true),
});

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { expiryDate: 'asc' },
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coupons', error });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const validatedData = couponSchema.parse(req.body);
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    });

    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: validatedData,
    });

    res.status(201).json(coupon);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to create coupon', error });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.coupon.delete({ where: { id } });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete coupon', error });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found', isValid: false });
    }

    const isExpired = new Date() > coupon.expiryDate;
    if (!coupon.isActive || isExpired) {
      return res.status(400).json({ 
        message: isExpired ? 'Coupon is expired' : 'Coupon is inactive', 
        isValid: false 
      });
    }

    res.json({
      isValid: true,
      discountPercent: coupon.discountPercent,
      code: coupon.code
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to validate coupon', error });
  }
};
