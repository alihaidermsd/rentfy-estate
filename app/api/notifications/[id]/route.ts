import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        title: true,
        message: true,
        type: true,
        relatedId: true,
        read: true,
        important: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Notification fetch error:', error)
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
    const { read, important } = body

    const notification = await prisma.notification.findUnique({
      where: { id: params.id }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (typeof read === 'boolean') {
      updateData.read = read
    }

    if (typeof important === 'boolean') {
      updateData.important = important
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        read: true,
        important: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully',
      data: updatedNotification
    })
  } catch (error) {
    console.error('Notification update error:', error)
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
    const notification = await prisma.notification.findUnique({
      where: { id: params.id }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    await prisma.notification.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })
  } catch (error) {
    console.error('Notification deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}