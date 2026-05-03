import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { apiResponse, apiError, requireAdmin } from '@/lib/api-helpers';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload - Upload image (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return apiError('No file provided', 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'pharmaflow',
            resource_type: 'image',
            transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return apiResponse({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}
