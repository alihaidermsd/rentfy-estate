import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        images: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const images = JSON.parse(property.images || '[]')

    return NextResponse.json({
      success: true,
      data: {
        propertyId: property.id,
        images
      }
    })
  } catch (error) {
    console.error('Property images fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { images } = body

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images array is required' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      select: { images: true }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const currentImages = JSON.parse(property.images || '[]')
    const updatedImages = [...currentImages, ...images]

    await prisma.property.update({
      where: { id: params.id },
      data: {
        images: JSON.stringify(updatedImages)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Images added successfully',
      data: {
        images: updatedImages
      }
    })
  } catch (error) {
    console.error('Property images update error:', error)
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
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      select: { images: true }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const currentImages = JSON.parse(property.images || '[]')
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl)

    await prisma.property.update({
      where: { id: params.id },
      data: {
        images: JSON.stringify(updatedImages)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        images: updatedImages
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