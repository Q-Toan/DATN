import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';

export const getRevenueStats = async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.revenue.findMany({
      include: {
        order: {
          select: {
            items: true,
            discountValue: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = records.reduce((sum, record) => sum + record.amount, 0);

    // Grouping by day (simplified for MongoDB/JS)
    const dailyRevenue: Record<string, number> = {};
    records.forEach(record => {
      const date = record.createdAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + record.amount;
    });

    res.json({
      totalRevenue,
      transactionCount: records.length,
      history: records,
      dailyStats: dailyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch revenue stats', error });
  }
};
