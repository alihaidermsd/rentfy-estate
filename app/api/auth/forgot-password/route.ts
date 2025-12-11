import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

// In-memory store for reset tokens (use database in production)
const resetTokens = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { 
        email: email.toLowerCase(),
        isActive: true 
      }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { 
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.' 
        },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token (in production, save to database)
    resetTokens.set(resetToken, {
      userId: user.id,
      email: user.email,
      expires: tokenExpiry
    })

    // In production: Send email with reset link
    // For now, we'll log it and return in development
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    
    console.log('Password reset link:', resetLink) // Remove in production

    return NextResponse.json(
      { 
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        // Remove resetToken in production - only for development
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Reset Password Verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const tokenData = resetTokens.get(token)

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    if (new Date() > tokenData.expires) {
      resetTokens.delete(token)
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Token is valid',
        email: tokenData.email
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}