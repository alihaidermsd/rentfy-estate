import { prisma } from './prisma'

export type NotificationType = 'BOOKING' | 'PAYMENT' | 'PROPERTY' | 'SYSTEM'

export interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type?: NotificationType
  relatedId?: string
  important?: boolean
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'SYSTEM',
        relatedId: params.relatedId || null,
        important: params.important || false
      }
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

// Common notification templates
export const notificationTemplates = {
  bookingCreated: (userName: string, propertyTitle: string) => ({
    title: 'Booking Request Received',
    message: `Your booking request for "${propertyTitle}" has been received and is pending confirmation.`,
    type: 'BOOKING' as NotificationType
  }),

  bookingConfirmed: (userName: string, propertyTitle: string) => ({
    title: 'Booking Confirmed!',
    message: `Your booking for "${propertyTitle}" has been confirmed. Get ready for your stay!`,
    type: 'BOOKING' as NotificationType
  }),

  bookingCancelled: (userName: string, propertyTitle: string) => ({
    title: 'Booking Cancelled',
    message: `Your booking for "${propertyTitle}" has been cancelled.`,
    type: 'BOOKING' as NotificationType
  }),

  paymentReceived: (amount: number, propertyTitle: string) => ({
    title: 'Payment Received',
    message: `Payment of $${amount} for "${propertyTitle}" has been successfully processed.`,
    type: 'PAYMENT' as NotificationType
  }),

  paymentFailed: (amount: number, propertyTitle: string) => ({
    title: 'Payment Failed',
    message: `Payment of $${amount} for "${propertyTitle}" failed. Please update your payment method.`,
    type: 'PAYMENT' as NotificationType,
    important: true
  }),

  propertyPublished: (propertyTitle: string) => ({
    title: 'Property Published',
    message: `Your property "${propertyTitle}" is now live and visible to potential guests.`,
    type: 'PROPERTY' as NotificationType
  }),

  newMessage: (fromUser: string) => ({
    title: 'New Message',
    message: `You have a new message from ${fromUser}.`,
    type: 'SYSTEM' as NotificationType
  }),

  systemUpdate: (message: string) => ({
    title: 'System Update',
    message,
    type: 'SYSTEM' as NotificationType
  })
}

// Function to get user notifications with pagination
export async function getUserNotifications(userId: string, options: {
  page?: number
  limit?: number
  type?: NotificationType
  read?: boolean
} = {}) {
  const page = options.page || 1
  const limit = options.limit || 20
  const skip = (page - 1) * limit

  const where: any = { userId }
  if (options.type) where.type = options.type
  if (options.read !== undefined) where.read = options.read

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
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

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    stats: {
      total,
      unread: unreadCount,
      read: total - unreadCount
    }
  }
}

// Function to mark notifications as read
export async function markNotificationsAsRead(userId: string, notificationIds?: string[]) {
  const where: any = { userId, read: false }
  if (notificationIds && notificationIds.length > 0) {
    where.id = { in: notificationIds }
  }

  const result = await prisma.notification.updateMany({
    where,
    data: {
      read: true,
      updatedAt: new Date()
    }
  })

  return result
}