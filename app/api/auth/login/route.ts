import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { execSync } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { email, password } = body
    email = String(email).toLowerCase()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user (with recovery if DB schema missing in dev)
    let user = null
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          image: true,
          role: true,
          phone: true,
          isActive: true,
        },
      })
    } catch (e: any) {
      if (process.env.NODE_ENV !== 'production' && e?.code === 'P2021') {
        console.warn('Prisma table missing. Running `prisma db push` and retrying (dev only).')
        try {
          execSync('npx prisma db push', { stdio: 'inherit' })
          user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              image: true,
              role: true,
              phone: true,
              isActive: true,
            },
          })
        } catch (err) {
          console.error('Failed to run prisma db push from server:', err)
        }
      } else {
        throw e
      }
    }

    // Check if user exists and is active
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        success: true,
        message: 'Login successful',
        user: userWithoutPassword
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}