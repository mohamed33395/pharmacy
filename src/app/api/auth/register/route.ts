import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { apiResponse, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return apiError('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters', 400);
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return apiError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
    });

    return apiResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: 'Registration successful',
      },
      201
    );
  } catch (error: any) {
    return apiError(error.message || 'Registration failed', 500);
  }
}
