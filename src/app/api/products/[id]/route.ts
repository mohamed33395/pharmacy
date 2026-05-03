import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { apiResponse, apiError, requireAdmin } from '@/lib/api-helpers';

// GET /api/products/:id - Get single product
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const product = await Product.findById(params.id)
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return apiError('Product not found', 404);
    }

    return apiResponse({ product });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

// PUT /api/products/:id - Update product (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const product = await Product.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return apiError('Product not found', 404);
    }

    return apiResponse({ product });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}

// DELETE /api/products/:id - Delete product (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await connectDB();

    const product = await Product.findByIdAndDelete(params.id);
    if (!product) {
      return apiError('Product not found', 404);
    }

    return apiResponse({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
