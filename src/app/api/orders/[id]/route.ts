import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { apiResponse, apiError, requireAuth, requireAdmin } from '@/lib/api-helpers';

// GET /api/orders/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    await connectDB();

    const order = await Order.findById(params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug thumbnail')
      .lean();

    if (!order) return apiError('Order not found', 404);

    // Only allow owner or admin to view
    if (user.role !== 'admin' && order.user._id?.toString() !== user.id) {
      return apiError('Unauthorized', 403);
    }

    return apiResponse({ order });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}

// PUT /api/orders/:id - Update order status (admin)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const { status, trackingNumber, note } = await req.json();

    const order = await Order.findById(params.id);
    if (!order) return apiError('Order not found', 404);

    if (status) {
      order.status = status;
      order.statusHistory.push({
        status,
        date: new Date(),
        note: note || `Status updated to ${status}`,
      });

      if (status === 'delivered') {
        order.deliveredAt = new Date();
        order.paymentStatus = 'paid';
      }

      if (status === 'cancelled') {
        order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : 'failed';
      }
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();
    return apiResponse({ order });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
