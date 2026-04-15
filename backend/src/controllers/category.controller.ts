import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  isActive: z.boolean().optional(),
});

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục', error });
  }
};

export const adminGetCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách danh mục (Admin)', error });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const category = await prisma.category.create({
      data: validatedData,
    });
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    res.status(500).json({ message: 'Lỗi khi tạo danh mục', error });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const validatedData = categorySchema.partial().parse(req.body);

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    res.status(500).json({ message: 'Lỗi khi cập nhật danh mục', error });
  }
};

export const toggleCategoryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    res.json({
      message: `Danh mục đã được ${updatedCategory.isActive ? 'hiển thị' : 'tạm ẩn'}`,
      isActive: updatedCategory.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái danh mục', error });
  }
};
