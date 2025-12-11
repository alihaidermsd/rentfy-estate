import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { prisma } from '@/lib/prisma'

const PROPERTY_IMAGES_DIR = join(process.cwd(), 'public/uploads/properties')

// Ensure upload directory exists
async function ensurePropertyImagesDir() {
  if (!existsSync(PROPERTY_IMAGES_DIR)) {
    await mkdir(PROPERTY_IMAGES_DIR, { recursive: true })
  }
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES_PER_PROPERTY = 20

export async function POST(request: NextRequest) {
  try {
    await ensurePropertyImagesDir()

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const propertyId = formData.get('propertyId') as string
    const userId = formData.get('userId') as string

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        userId: true,
        images: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if user owns the property or is admin
    if (property.userId !== userId) {
      // In a real app, you might want to check for admin role here
      return NextResponse.json(
        { error: 'Unauthorized to upload images for this property' },
        { status: 403 }
      )
    }

    // Check current image count
    const currentImages = JSON.parse(property.images || '[]')
    if (currentImages.length + files.length > MAX_IMAGES_PER_PROPERTY) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES_PER_PROPERTY} images allowed per property` },
        { status: 400 }
      )
    }

    const uploadResults = []
    const newImageUrls = []

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Allowed types: JPEG, PNG, WebP, GIF` },
          { status: 400 }
        )
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 5MB` },
          { status: 400 }
        )
      }

      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${propertyId}-${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
      
      const uploadPath = join(PROPERTY_IMAGES_DIR, fileName)
      const publicUrl = `/uploads/properties/${fileName}`

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(uploadPath, buffer)

      uploadResults.push({
        originalName: file.name,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        publicUrl,
        uploadPath: publicUrl
      })

      newImageUrls.push(publicUrl)
    }

    // Update property with new images
    const updatedImages = [...currentImages, ...newImageUrls]
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        images: JSON.stringify(updatedImages),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `${files.length} image(s) uploaded successfully`,
      data: {
        uploads: uploadResults,
        property: {
          id: propertyId,
          totalImages: updatedImages.length,
          images: updatedImages
        }
      }
    })

  } catch (error) {
    console.error('Property images upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const imageUrl = searchParams.get('imageUrl')
    const userId = searchParams.get('userId')

    if (!propertyId || !imageUrl || !userId) {
      return NextResponse.json(
        { error: 'propertyId, imageUrl, and userId are required' },
        { status: 400 }
      )
    }

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        userId: true,
        images: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    if (property.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete images for this property' },
        { status: 403 }
      )
    }

    // Parse current images
    const currentImages = JSON.parse(property.images || '[]')
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl)

    if (currentImages.length === updatedImages.length) {
      return NextResponse.json(
        { error: 'Image not found in property images' },
        { status: 404 }
      )
    }

    // Delete physical file
    const fileName = imageUrl.split('/').pop()
    if (fileName) {
      const filePath = join(PROPERTY_IMAGES_DIR, fileName)
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    }

    // Update property images
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        images: JSON.stringify(updatedImages),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        propertyId,
        deletedImage: imageUrl,
        remainingImages: updatedImages.length
      }
    })

  } catch (error) {
    console.error('Property image delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}