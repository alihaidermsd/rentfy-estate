import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getDashboardRouteForRole } from '@/lib/roleRoutes';

export async function GET(request: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    const role = (session as any)?.user?.role;

    const redirectPath = getDashboardRouteForRole(role);
    // If role not recognized, fall back to home or login
    if (!redirectPath) return NextResponse.redirect(new URL('/login', request.url));

    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error('Auth redirect error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
