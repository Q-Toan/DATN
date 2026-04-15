import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';
import { z } from 'zod';

const checkoutSchema = z.object({
  couponCode: z.string().optional(),
  fullName: z.string().min(1, 'FullName is required'),
  phoneNumber: z.string().min(1, 'PhoneNumber is required'),
  address: z.string().min(1, 'Address is required'),
  paymentMethod: z.enum(['COD', 'ONLINE']).default('COD'),
});

export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const { couponCode, fullName, phoneNumber, address, paymentMethod } = checkoutSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });
    console.log('User ID:', userId);
    console.log('Cart found:', JSON.stringify(cart, null, 2));

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 1. Aggregate and Validate items and stock
    let total = 0;
    const orderItems: any[] = [];
    
    // Group requested quantities by productId to check against total stock
    const productQuantities = new Map<string, number>();
    cart.items.forEach((item: any) => {
      const current = productQuantities.get(item.productId) || 0;
      productQuantities.set(item.productId, current + item.quantity);
    });

    console.log('Validating aggregated stock...');
    for (const [productId, requestedQty] of productQuantities.entries()) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      
      if (!product) {
        console.error(`CHECKOUT_FAILURE // PRODUCT_NOT_FOUND: ${productId}`);
        return res.status(400).json({ 
          message: `Sản phẩm ID ${productId} không còn tồn tại trong hệ thống. Vui lòng làm trống giỏ hàng và chọn lại sản phẩm. // ORPHANED_DATA_ERR` 
        });
      }

      const availableStock = product.stock - product.reserved;
      if (availableStock < requestedQty) {
        return res.status(400).json({ 
          message: `Sản phẩm ${product.name} không đủ tồn kho khả dụng. Còn lại: ${availableStock}, Bạn yêu cầu tổng cộng: ${requestedQty}` 
        });
      }
    }

    // Build order items and calculate total
    for (const item of cart.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue; // Should not happen after validation above

      const itemPrice = product.price * item.quantity;
      total += itemPrice;
      
      orderItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      });
    }

    // 2. Apply coupon if exists
    let discountValue = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && coupon.expiryDate > new Date()) {
        discountValue = (total * coupon.discountPercent) / 100;
        total -= discountValue;
      } else {
        return res.status(400).json({ message: 'Invalid or expired coupon code' });
      }
    }

    // 3. Create Order, Update Stock, Log Revenue & Inventory (Prisma Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          items: orderItems,
          total,
          discountCode: couponCode,
          discountValue,
          status: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED', // Real logic: PENDING if COD
          fullName,
          phoneNumber,
          address,
          paymentMethod,
        },
      });

      // Create Revenue record
      await tx.revenue.create({
        data: {
          orderId: order.id,
          amount: total,
        }
      });

      for (const item of cart.items) {
        // Increment reserved quantity instead of decrementing stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            reserved: {
              increment: item.quantity,
            },
          },
        });
        // No InventoryLog here yet, as it only subtracts upon completion
      }

      // Clear the cart
      await tx.cart.delete({ where: { userId } });

      return order;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Checkout error detail:', error);
    res.status(400).json({ message: 'Checkout failed', error: error instanceof Error ? error.message : error });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
};

export const adminGetAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all orders', error });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = z.object({
      status: z.enum(['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'])
    }).parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({ where: { id } });
      if (!currentOrder) throw new Error('Order not found');

      // 1. Logic: If status is being changed TO 'COMPLETED'
      if (status === 'COMPLETED' && currentOrder.status !== 'COMPLETED') {
        for (const item of currentOrder.items) {
          // Official stock deduction
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              reserved: { decrement: item.quantity } // Release reservation
            }
          });

          // Log restock as EXPORT
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              type: 'EXPORT',
              quantity: item.quantity,
              reason: `Order Completed: ${id}`
            }
          });
        }
      }

      // 2. Logic: If status is being changed TO 'CANCELLED'
      if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
        if (currentOrder.status === 'COMPLETED') {
          // If it was already completed, we MUST restock the official stock
          for (const item of currentOrder.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.quantity }
              }
            });
            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                type: 'IMPORT',
                quantity: item.quantity,
                reason: `Cancelled after Completion: ${id}`
              }
            });
          }
        } else {
          // If it was just PENDING/SHIPPING, we only release the RESERVATION
          for (const item of currentOrder.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                reserved: { decrement: item.quantity }
              }
            });
          }
        }
      }

      return await tx.order.update({
        where: { id },
        data: { status },
      });
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ message: 'Failed to update order status', error });
  }
};
