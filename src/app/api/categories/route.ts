import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { apiResponse, apiError, requireAdmin } from '@/lib/api-helpers';

// GET /api/categories - List all categories
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    return apiResponse({ categories });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

// POST /api/categories - Create category (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const category = await Category.create(body);
    return apiResponse({ category }, 201);
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
