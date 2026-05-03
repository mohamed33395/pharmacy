import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { apiResponse, apiError, requireAuth, requireAdmin, parsePagination, getCurrentUser } from '@/lib/api-helpers';
import { generateOrderNumber } from '@/lib/utils';
import { sendEmail, orderConfirmationEmail } from '@/lib/email';

// GET /api/orders - List user orders (or all for admin)
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const filter: any = {};
    if (user.role !== 'admin') {
      filter.user = user.id;
    } else {
      const status = searchParams.get('status');
      if (status) filter.status = status;
      const userId = searchParams.get('userId');
      if (userId) filter.user = userId;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return apiResponse({
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}

// POST /api/orders - Create new order
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { items, shippingAddress, paymentMethod, notes } = await req.json();

    if (!items || items.length === 0) {
      return apiError('Order must contain at least one item', 400);
    }

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return apiError(`Product ${item.productId} not found`, 404);
      if (product.stock < item.quantity) {
        return apiError(`Insufficient stock for ${product.name.en}`, 400);
      }

      orderItems.push({
        product: product._id,
        name: product.name.en,
        thumbnail: product.thumbnail,
        price: product.price,
        quantity: item.quantity,
      });

      subtotal += product.price * item.quantity;

      // Decrease stock
      product.stock -= item.quantity;
      product.soldCount += item.quantity;
      await product.save();
    }

    const shippingCost = subtotal > 200 ? 0 : 25; // Free shipping over 200 SAR
    const tax = subtotal * 0.15; // 15% VAT
    const total = subtotal + shippingCost + tax;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      subtotal,
      shippingCost,
      tax,
      total,
      notes,
      status: 'pending',
      statusHistory: [{ status: 'pending', date: new Date(), note: 'Order placed' }],
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    });

    // Send confirmation email (non-blocking)
    sendEmail({
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: orderConfirmationEmail(order.orderNumber, total),
    }).catch(console.error);

    return apiResponse({ order }, 201);
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
