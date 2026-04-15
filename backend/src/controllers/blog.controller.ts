import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';
import { z } from 'zod';

const blogSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  thumbnail: z.string().optional(),
  author: z.string().optional(),
});

export const createBlog = async (req: AuthRequest, res: Response) => {
  try {
    if (req.file) {
      req.body.thumbnail = (req.file as any).path;
    }

    const validatedData = blogSchema.parse(req.body);
    const blog = await prisma.blog.create({
      data: validatedData,
    });
    res.status(201).json(blog);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to create blog', error });
  }
};

export const getAllBlogs = async (req: AuthRequest, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blogs', error });
  }
};

export const getPublishedBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blogs', error });
  }
};

export const updateBlog = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (req.file) {
      req.body.thumbnail = (req.file as any).path;
    }

    const validatedData = blogSchema.partial().parse(req.body);

    const blog = await prisma.blog.update({
      where: { id },
      data: validatedData,
    });

    res.json(blog);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to update blog', error });
  }
};

export const deleteBlog = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.blog.delete({ where: { id } });
    res.json({ message: 'Blog deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blog', error });
  }
};

export const toggleBlogStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: { isActive: !blog.isActive },
    });

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update blog status', error });
  }
};
