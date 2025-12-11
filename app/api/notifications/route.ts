import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const read = searchParams.get('read')
    const important = searchParams.get('important')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit
    
    const where: any = { userId }
    
    if (type) where.type = type
    if (read !== null) where.read = read === 'true'
    if (important !== null) where.important = important === 'true'

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          relatedId: true,
          read: true,
          important: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          read: false
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        stats: {
          total,
          unread: unreadCount,
          read: total - unreadCount
        }
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      title,
      message,
      type = 'SYSTEM',
      relatedId,
      important = false
    } = body

    // Validation
    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'userId, title, and message are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        relatedId: relatedId || null,
        important
      }
    })

    return NextResponse.json(
      { 
        success: true,
        message: 'Notification created successfully',
        data: notification 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Notification creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, read } = body

    if (!userId || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and read status are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Mark all user notifications as read/unread
    const result = await prisma.notification.updateMany({
      where: { userId },
      data: {
        read,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `All notifications marked as ${read ? 'read' : 'unread'}`,
      data: {
        updatedCount: result.count,
        userId
      }
    })
  } catch (error) {
    console.error('Bulk notification update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const read = searchParams.get('read') // Optional: delete only read notifications

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const where: any = { userId }
    if (read !== null) {
      where.read = read === 'true'
    }

    const result = await prisma.notification.deleteMany({
      where
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} notification(s) deleted successfully`,
      data: {
        deletedCount: result.count,
        userId
      }
    })
  } catch (error) {
    console.error('Bulk notification deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}