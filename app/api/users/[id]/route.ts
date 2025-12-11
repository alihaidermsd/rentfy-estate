import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        phone: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            phone: true,
            bio: true,
            avatar: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            createdAt: true,
            updatedAt: true
          }
        },
        agentProfile: {
          select: {
            id: true,
            company: true,
            licenseNumber: true,
            experience: true,
            bio: true,
            specialties: true,
            languages: true,
            officeAddress: true,
            website: true,
            socialMedia: true,
            totalListings: true,
            verified: true,
            featured: true,
            createdAt: true,
            updatedAt: true
          }
        },
        developerProfile: {
          select: {
            id: true,
            companyName: true,
            description: true,
            logo: true,
            established: true,
            completedProjects: true,
            website: true,
            phone: true,
            email: true,
            address: true,
            createdAt: true,
            updatedAt: true
          }
        },
        _count: {
          select: {
            ownedProperties: true,
            bookings: true,
            reviews: true,
            favorites: true,
            inquiries: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userWithStats = {
      ...user,
      stats: user._count
    }

    return NextResponse.json({
      success: true,
      data: userWithStats
    })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: body.name,
        phone: body.phone,
        image: body.image,
        role: body.role,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        phone: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: user
    })
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete - set isActive to false
    await prisma.user.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}