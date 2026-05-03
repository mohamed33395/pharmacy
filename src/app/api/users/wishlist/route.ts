import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { apiResponse, apiError, requireAuth } from '@/lib/api-helpers';

// GET /api/users/wishlist
export async function GET() {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const user = await User.findById(currentUser.id)
      .populate('wishlist', 'name slug thumbnail price compareAtPrice brand averageRating reviewCount stock')
      .lean();

    return apiResponse({ wishlist: user?.wishlist || [] });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}

// POST /api/users/wishlist - Toggle wishlist item
export async function POST(req: NextRequest) {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const { productId } = await req.json();
    if (!productId) return apiError('Product ID required', 400);

    const user = await User.findById(currentUser.id);
    if (!user) return apiError('User not found', 404);

    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    let action: string;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      action = 'removed';
    } else {
      user.wishlist.push(productId);
      action = 'added';
    }

    await user.save();
    return apiResponse({ action, wishlist: user.wishlist });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
