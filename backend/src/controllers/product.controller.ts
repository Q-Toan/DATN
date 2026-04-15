import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  categoryId: z.string().min(1, 'Category ID is required'),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  isActive: z.boolean().optional(),
});

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const categoryId = req.query.categoryId as string | undefined;
    const isAdmin = req.query.admin === 'true'; // Temporary flag for admin view

    const skip = (page - 1) * limit;
    const take = limit;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (!isAdmin) where.isActive = true;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const mappedProducts = products.map(p => ({
      ...p,
      totalStock: p.stock, // Original stock for admin or internal use
      availableStock: p.stock - p.reserved, // Explicit available field
      stock: p.stock - p.reserved, // Overwrite stock for frontend compatibility
    }));

    res.json({
      products: mappedProducts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: { category: true, reviews: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const mappedProduct = {
      ...product,
      totalStock: product.stock,
      availableStock: product.stock - product.reserved,
      stock: product.stock - product.reserved,
    };

    res.json(mappedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    // Handle Cloudinary Uploads
    if (req.files && Array.isArray(req.files)) {
      const uploadedUrls = (req.files as any[]).map(file => file.path);
      req.body.images = uploadedUrls;
    }

    // Convert numeric fields if they come as strings (common in Multipart/Form-data)
    if (typeof req.body.price === 'string') req.body.price = parseFloat(req.body.price);
    if (typeof req.body.stock === 'string') req.body.stock = parseInt(req.body.stock, 10);

    const validatedData = productSchema.parse(req.body);
    const product = await prisma.product.create({
      data: validatedData,
      include: { category: true }
    });

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to create product', error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // Handle Cloudinary Uploads
    if (req.files && Array.isArray(req.files) && (req.files as any[]).length > 0) {
      const uploadedUrls = (req.files as any[]).map(file => file.path);
      req.body.images = uploadedUrls;
    }

    // Convert numeric fields if they come as strings
    if (typeof req.body.price === 'string') req.body.price = parseFloat(req.body.price);
    if (typeof req.body.stock === 'string') req.body.stock = parseInt(req.body.stock, 10);

    const validatedData = productSchema.partial().parse(req.body);

    const product = await prisma.product.update({
      where: { id },
      data: validatedData,
      include: { category: true }
    });

    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to update product', error });
  }
};

export const toggleProductStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle product status', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error });
  }
};
