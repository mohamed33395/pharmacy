import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { apiResponse, apiError, requireAdmin, parsePagination, parseSort } from '@/lib/api-helpers';

// GET /api/products - List products with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = parsePagination(searchParams);
    const sort = parseSort(searchParams);

    // Build filter
    const filter: any = { isActive: true };

    const category = searchParams.get('category');
    if (category) filter.category = category;

    const brand = searchParams.get('brand');
    if (brand) filter.brand = brand;

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const featured = searchParams.get('featured');
    if (featured === 'true') filter.isFeatured = true;

    const search = searchParams.get('search');
    if (search) {
      filter.$or = [
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return apiResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

// POST /api/products - Create product (admin only)
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const body = await req.json();
    const product = await Product.create(body);

    return apiResponse({ product }, 201);
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
