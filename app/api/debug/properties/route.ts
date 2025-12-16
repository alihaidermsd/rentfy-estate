import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Dev-only endpoint to inspect properties quickly
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const properties = await prisma.property.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, user: { select: { name: true } } } },
        developer: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const total = await prisma.property.count();

    return NextResponse.json({ success: true, total, count: properties.length, data: properties });
  } catch (error) {
    console.error('Debug properties error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch debug properties' }, { status: 500 });
  }
}
