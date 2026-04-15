import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      productCount,
      categoryCount,
      userCount,
      orderCount,
      revenueData,
      recentOrders
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { NOT: { status: 'CANCELLED' } },
        _sum: { total: true }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    ]);

    res.json({
      stats: {
        totalProducts: productCount,
        totalCategories: categoryCount,
        totalUsers: userCount,
        totalOrders: orderCount,
        totalRevenue: revenueData._sum.total || 0,
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        customerName: o.user?.name || 'Guest',
        email: o.user?.email || '',
        status: o.status,
        totalAmount: o.total,
        date: o.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error });
  }
};
