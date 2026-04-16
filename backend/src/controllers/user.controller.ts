import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Không thể vô hiệu hóa tài khoản Admin' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    res.json({
      message: `Tài khoản đã được ${updatedUser.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`,
      isActive: updatedUser.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái người dùng', error });
  }
};
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin cá nhân', error });
  }
};
