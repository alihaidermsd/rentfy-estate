import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { userCreateSchema } from '@/lib/validations'; // Use the correct schema
import { execSync } from 'child_process';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body with the user creation schema
    const validation = userCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input. Please check the provided data.', 
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }

    // `role` will be defaulted to 'USER' by the schema if not provided
    let { name, email, password, role } = validation.data;
    email = String(email).toLowerCase();

    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({ where: { email } });
    } catch (e: any) {
      // If the database/table is missing in development, try to push schema and retry once
      if (process.env.NODE_ENV !== 'production' && e?.code === 'P2021') {
        console.warn('Prisma table missing. Running `prisma db push` and retrying (dev only).');
        try {
          execSync('npx prisma db push', { stdio: 'inherit' });
          existingUser = await prisma.user.findUnique({ where: { email } });
        } catch (err) {
          console.error('Failed to run prisma db push from server:', err);
        }
      } else {
        throw e;
      }
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: true, // For demo purposes, auto-verify
        profile: {
          create: {}, // Create an empty profile to satisfy the relation
        },
      },
    });

    // Return created user info (without password) so frontend can react accordingly
    const { password: _pw, ...userWithoutPassword } = user as any;

    return NextResponse.json(
      { message: 'User created successfully. Please log in.', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) { // Explicitly type error as any for message property
    console.error('REGISTRATION_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' }, // Return the actual error message
      { status: 500 }
    );
  }
}