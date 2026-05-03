import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { apiResponse, apiError, requireAdmin } from '@/lib/api-helpers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const category = await Category.findById(params.id).lean();
    if (!category) return apiError('Category not found', 404);
    return apiResponse({ category });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await req.json();
    const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
    if (!category) return apiError('Category not found', 404);
    return apiResponse({ category });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();
    const category = await Category.findByIdAndDelete(params.id);
    if (!category) return apiError('Category not found', 404);
    return apiResponse({ message: 'Category deleted' });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
