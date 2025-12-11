import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'

const PROFILE_IMAGES_DIR = join(process.cwd(), 'public/uploads/profiles')

// Ensure upload directory exists
async function ensureProfileImagesDir() {
  if (!existsSync(PROFILE_IMAGES_DIR)) {
    await mkdir(PROFILE_IMAGES_DIR, { recursive: true })
  }
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB for profile images

export async function POST(request: NextRequest) {
  try {
    await ensureProfileImagesDir()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const type = formData.get('type') as string // 'avatar' or 'profile'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (!type || !['avatar', 'profile'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "avatar" or "profile"' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 2MB' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        image: true,
        profile: {
          select: {
            id: true,
            avatar: true
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

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}-${type}-${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
    
    const uploadPath = join(PROFILE_IMAGES_DIR, fileName)
    const publicUrl = `/uploads/profiles/${fileName}`

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(uploadPath, buffer)

    // Update user record based on type
    if (type === 'avatar') {
      // Update user profile avatar
      if (user.profile) {
        // Delete old avatar file if exists
        if (user.profile.avatar) {
          const oldFileName = user.profile.avatar.split('/').pop()
          if (oldFileName) {
            const oldFilePath = join(PROFILE_IMAGES_DIR, oldFileName)
            if (existsSync(oldFilePath)) {
              await unlink(oldFilePath)
            }
          }
        }

        await prisma.userProfile.update({
          where: { userId },
          data: {
            avatar: publicUrl,
            updatedAt: new Date()
          }
        })
      } else {
        // Create user profile if it doesn't exist
        await prisma.userProfile.create({
          data: {
            userId,
            avatar: publicUrl
          }
        })
      }
    } else {
      // Update user main image
      // Delete old image file if exists
      if (user.image) {
        const oldFileName = user.image.split('/').pop()
        if (oldFileName) {
          const oldFilePath = join(PROFILE_IMAGES_DIR, oldFileName)
          if (existsSync(oldFilePath)) {
            await unlink(oldFilePath)
          }
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          image: publicUrl,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        originalName: file.name,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        publicUrl,
        type,
        userId
      }
    })

  } catch (error) {
    console.error('Profile image upload error:', error)
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
    const type = searchParams.get('type') // 'avatar' or 'profile'

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      )
    }

    if (!['avatar', 'profile'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "avatar" or "profile"' },
        { status: 400 }
      )
    }

    // Get user current image
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        image: true,
        profile: {
          select: {
            id: true,
            avatar: true
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

    let imageUrl: string | null = null

    if (type === 'avatar') {
      imageUrl = user.profile?.avatar || null
      if (imageUrl) {
        // Delete physical file
        const fileName = imageUrl.split('/').pop()
        if (fileName) {
          const filePath = join(PROFILE_IMAGES_DIR, fileName)
          if (existsSync(filePath)) {
            await unlink(filePath)
          }
        }

        // Update database
        await prisma.userProfile.update({
          where: { userId },
          data: {
            avatar: null,
            updatedAt: new Date()
          }
        })
      }
    } else {
      imageUrl = user.image
      if (imageUrl) {
        // Delete physical file
        const fileName = imageUrl.split('/').pop()
        if (fileName) {
          const filePath = join(PROFILE_IMAGES_DIR, fileName)
          if (existsSync(filePath)) {
            await unlink(filePath)
          }
        }

        // Update database
        await prisma.user.update({
          where: { id: userId },
          data: {
            image: null,
            updatedAt: new Date()
          }
        })
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: `${type === 'avatar' ? 'Avatar' : 'Profile image'} not found` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${type === 'avatar' ? 'Avatar' : 'Profile image'} deleted successfully`,
      data: {
        userId,
        type,
        deletedImage: imageUrl
      }
    })

  } catch (error) {
    console.error('Profile image delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}