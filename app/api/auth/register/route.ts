import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { execSync } from 'child_process';
import cuid from 'cuid';

// Development-friendly registration: accept any input and create (or return) a user.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name, email, password, role } = body || {};
    name = name || 'New User';
    email = email ? String(email).toLowerCase() : `${cuid()}@dev.local`;
    password = password || 'password';
    role = role || 'USER';

    // Ensure DB exists in dev
    try {
      // try a lightweight read
      await prisma.user.findFirst({ take: 1 });
    } catch (e: any) {
      if (process.env.NODE_ENV !== 'production' && e?.code === 'P2021') {
        try {
          execSync('npx prisma db push', { stdio: 'inherit' });
        } catch (err) {
          console.warn('Failed to run prisma db push automatically:', err);
        }
      }
    }

    // If user exists, return it (do not fail)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const { password: _pw, ...u } = existing as any;
      return NextResponse.json({ success: true, user: u }, { status: 200 });
    }

    const hashed = await hash(password, 12);

    // Create a minimal profile to satisfy relations
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        emailVerified: true,
        profile: { create: {} },
      },
    });

    const { password: _pw, ...userWithoutPassword } = user as any;
    return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 201 });
  } catch (err: any) {
    console.error('Registration error (dev relax):', err);
    return NextResponse.json({ error: err.message || 'Failed to register' }, { status: 500 });
  }
}