import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { apiResponse, apiError, requireAdmin } from '@/lib/api-helpers';

// GET /api/admin/analytics
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      topProducts,
      monthlyOrders,
      ordersByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Product.find({ isActive: true })
        .sort({ soldCount: -1 })
        .limit(5)
        .select('name thumbnail price soldCount')
        .lean(),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$total' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return apiResponse({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueResult[0]?.total || 0,
      },
      recentOrders,
      topProducts,
      monthlyOrders,
      ordersByStatus,
    });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
