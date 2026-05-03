import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { apiResponse, apiError, requireAuth, parsePagination } from '@/lib/api-helpers';

// GET /api/reviews?productId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) return apiError('Product ID required', 400);

    const { page, limit, skip } = parsePagination(searchParams);

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId, isApproved: true })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: productId, isApproved: true }),
    ]);

    return apiResponse({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

// POST /api/reviews - Create review
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { productId, rating, title, comment } = await req.json();

    // Check for existing review
    const existing = await Review.findOne({ user: user.id, product: productId });
    if (existing) return apiError('You already reviewed this product', 400);

    const review = await Review.create({
      user: user.id,
      product: productId,
      rating,
      title,
      comment,
    });

    // Update product average rating
    const stats = await Review.aggregate([
      { $match: { product: review.product, isApproved: true } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      });
    }

    return apiResponse({ review }, 201);
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
