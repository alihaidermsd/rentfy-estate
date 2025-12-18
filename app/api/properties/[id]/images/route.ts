import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// Validation schemas
const imageUpdateSchema = z.object({
  images: z.array(z.string().url()).min(1),
  primaryImageIndex: z.number().min(0).optional().default(0),
});

// GET /api/properties/[id]/images - Get property images
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        images: true,
        title: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Parse images from comma-separated string
    const images = property.images ? property.images.split(',').filter(Boolean) : [];
    
    // Check if images are URLs (could be base64 or file paths)
    const parsedImages = images.map((img, index) => ({
      url: img,
      isUrl: img.startsWith('http'),
      isBase64: img.startsWith('data:image'),
      isFilePath: !img.startsWith('http') && !img.startsWith('data:image'),
      index,
      isPrimary: index === 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        propertyId: property.id,
        propertyTitle: property.title,
        totalImages: parsedImages.length,
        images: parsedImages,
        primaryImage: parsedImages[0] || null,
      },
    });

  } catch (error) {
    console.error('Images fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property images' },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id]/images - Update property images
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id },
      select: { userId: true, agentId: true, developerId: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const hasPermission = 
      property.userId === userId || 
      property.agentId === userId || 
      property.developerId === userId ||
      session.user.role === 'ADMIN';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to update images' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = imageUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid image data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { images, primaryImageIndex } = validation.data;
    
    // Validate primary image index
    if (primaryImageIndex >= images.length) {
      return NextResponse.json(
        { error: 'Primary image index out of bounds' },
        { status: 400 }
      );
    }

    // Reorder images to put primary image first
    let orderedImages = [...images];
    if (primaryImageIndex > 0) {
      const primaryImage = orderedImages[primaryImageIndex];
      orderedImages.splice(primaryImageIndex, 1);
      orderedImages.unshift(primaryImage);
    }

    // Update property images
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        images: orderedImages.join(','),
      },
    });

    // Parse updated images for response
    const parsedImages = orderedImages.map((img, index) => ({
      url: img,
      index,
      isPrimary: index === 0,
    }));

    return NextResponse.json({
      success: true,
      message: 'Property images updated successfully',
      data: {
        propertyId: updatedProperty.id,
        totalImages: parsedImages.length,
        images: parsedImages,
        primaryImage: parsedImages[0] || null,
      },
    });

  } catch (error) {
    console.error('Images update error:', error);
    return NextResponse.json(
      { error: 'Failed to update property images' },
      { status: 500 }
    );
  }
}

// POST /api/properties/[id]/images - Add images to property
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id },
      select: { 
        userId: true, 
        agentId: true, 
        developerId: true,
        images: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const hasPermission = 
      property.userId === userId || 
      property.agentId === userId || 
      property.developerId === userId ||
      session.user.role === 'ADMIN';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to add images' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate new images
    const newImagesSchema = z.array(z.string().url()).min(1);
    const validation = newImagesSchema.safeParse(body.images);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid image data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const newImages = validation.data;
    
    // Get existing images
    const existingImages = property.images ? property.images.split(',').filter(Boolean) : [];
    
    // Combine images (new images first)
    const combinedImages = [...newImages, ...existingImages];
    
    // Limit total images (adjust as needed)
    const maxImages = 20;
    const finalImages = combinedImages.slice(0, maxImages);

    // Update property with new images
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        images: finalImages.join(','),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${newImages.length} images added successfully`,
      data: {
        propertyId: updatedProperty.id,
        totalImages: finalImages.length,
        newImagesAdded: newImages.length,
        images: finalImages,
      },
    });

  } catch (error) {
    console.error('Images add error:', error);
    return NextResponse.json(
      { error: 'Failed to add images' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]/images - Remove image from property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id },
      select: { 
        userId: true, 
        agentId: true, 
        developerId: true,
        images: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const hasPermission = 
      property.userId === userId || 
      property.agentId === userId || 
      property.developerId === userId ||
      session.user.role === 'ADMIN';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to remove images' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');
    const imageIndex = searchParams.get('imageIndex');

    if (!imageUrl && !imageIndex) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageIndex is required' },
        { status: 400 }
      );
    }

    // Get existing images
    const existingImages = property.images ? property.images.split(',').filter(Boolean) : [];
    
    let updatedImages: string[];
    
    if (imageIndex) {
      const index = parseInt(imageIndex);
      if (isNaN(index) || index < 0 || index >= existingImages.length) {
        return NextResponse.json(
          { error: 'Invalid image index' },
          { status: 400 }
        );
      }
      updatedImages = existingImages.filter((_, i) => i !== index);
    } else if (imageUrl) {
      updatedImages = existingImages.filter(img => img !== imageUrl);
      if (updatedImages.length === existingImages.length) {
        return NextResponse.json(
          { error: 'Image not found' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Update property with removed image
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        images: updatedImages.length > 0 ? updatedImages.join(',') : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Image removed successfully',
      data: {
        propertyId: updatedProperty.id,
        totalImages: updatedImages.length,
        images: updatedImages,
      },
    });

  } catch (error) {
    console.error('Image remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove image' },
      { status: 500 }
    );
  }
}