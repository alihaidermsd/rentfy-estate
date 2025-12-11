import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Configure upload directories
const UPLOAD_DIR = join(process.cwd(), 'public/uploads')
const PROPERTY_IMAGES_DIR = join(UPLOAD_DIR, 'properties')
const PROFILE_IMAGES_DIR = join(UPLOAD_DIR, 'profiles')

// Ensure upload directories exist
async function ensureUploadDirs() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
  if (!existsSync(PROPERTY_IMAGES_DIR)) {
    await mkdir(PROPERTY_IMAGES_DIR, { recursive: true })
  }
  if (!existsSync(PROFILE_IMAGES_DIR)) {
    await mkdir(PROFILE_IMAGES_DIR, { recursive: true })
  }
}

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDirs()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'property' or 'profile'
    const userId = formData.get('userId') as string
    const propertyId = formData.get('propertyId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !['property', 'profile'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "property" or "profile"' },
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
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
    
    let uploadPath: string
    let publicUrl: string

    if (type === 'property') {
      if (!propertyId) {
        return NextResponse.json(
          { error: 'propertyId is required for property image upload' },
          { status: 400 }
        )
      }
      uploadPath = join(PROPERTY_IMAGES_DIR, fileName)
      publicUrl = `/uploads/properties/${fileName}`
    } else {
      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required for profile image upload' },
          { status: 400 }
        )
      }
      uploadPath = join(PROFILE_IMAGES_DIR, fileName)
      publicUrl = `/uploads/profiles/${fileName}`
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(uploadPath, buffer)

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        publicUrl,
        uploadPath: publicUrl
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'property' or 'profile'

    const uploadInfo = {
      allowedTypes: ALLOWED_IMAGE_TYPES,
      maxFileSize: MAX_FILE_SIZE,
      uploadDirs: {
        properties: '/uploads/properties/',
        profiles: '/uploads/profiles/'
      }
    }

    if (type === 'property') {
      return NextResponse.json({
        success: true,
        data: {
          ...uploadInfo,
          instructions: [
            'Upload property images (JPEG, PNG, WebP, GIF)',
            'Maximum file size: 5MB',
            'Images will be stored in /uploads/properties/',
            'Include propertyId in form data'
          ]
        }
      })
    } else if (type === 'profile') {
      return NextResponse.json({
        success: true,
        data: {
          ...uploadInfo,
          instructions: [
            'Upload profile images (JPEG, PNG, WebP, GIF)',
            'Maximum file size: 5MB',
            'Images will be stored in /uploads/profiles/',
            'Include userId in form data'
          ]
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: uploadInfo
    })
  } catch (error) {
    console.error('Upload info fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}