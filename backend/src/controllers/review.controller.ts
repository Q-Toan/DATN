import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const validatedData = reviewSchema.parse(req.body);

    // Optional: Check if user has actually bought the product
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        items: {
          some: {
            productId: validatedData.productId
          }
        }
      }
    });

    const review = await prisma.review.create({
      data: {
        ...validatedData,
        userId,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to create review', error });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const reviews = await prisma.review.findMany({
      where: { productId, isVisible: true },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error });
  }
};

export const getAllReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error });
  }
};

export const toggleReviewStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { isVisible: !review.isVisible },
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update review status', error });
  }
};
