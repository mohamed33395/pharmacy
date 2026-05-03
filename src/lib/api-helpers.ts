import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// Standard API response helper
export function apiResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Get current authenticated user from session
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as { id: string; name: string; email: string; role: string };
}

// Require authentication middleware
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError('Authentication required', 401);
  }
  return user;
}

// Require admin role middleware
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new AuthError('Admin access required', 403);
  }
  return user;
}

// Custom error class
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
  }
}

// Parse query parameters for pagination
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// Build sort object from query
export function parseSort(searchParams: URLSearchParams) {
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
  return { [sortBy]: sortOrder };
}
