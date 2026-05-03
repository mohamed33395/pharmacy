import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { apiResponse, apiError, requireAuth } from '@/lib/api-helpers';

// GET /api/users/profile - Get current user profile
export async function GET() {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const user = await User.findById(currentUser.id)
      .populate('wishlist', 'name slug thumbnail price')
      .lean();

    if (!user) return apiError('User not found', 404);
    return apiResponse({ user });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}

// PUT /api/users/profile - Update current user profile
export async function PUT(req: NextRequest) {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const { name, phone, addresses, currentPassword, newPassword } = await req.json();

    const user = await User.findById(currentUser.id).select('+password');
    if (!user) return apiError('User not found', 404);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (addresses) user.addresses = addresses;

    // Password change
    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return apiError('Current password is incorrect', 400);
      user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    const updatedUser = await User.findById(currentUser.id).lean();
    return apiResponse({ user: updatedUser });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
