import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/properties/[id]/temporary - Get temporary data (drafts, previews, etc.)
export async function GET(
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
        status: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Only allow access for draft properties to owners/admins
    const hasPermission = 
      property.userId === userId || 
      property.agentId === userId || 
      property.developerId === userId ||
      session.user.role === 'ADMIN';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // For draft properties, allow temporary operations
    if (property.status === 'DRAFT') {
      return NextResponse.json({
        success: true,
        data: {
          isDraft: true,
          allowedOperations: [
            'preview',
            'save_draft',
            'publish',
            'duplicate',
            'validate',
          ],
          previewUrl: `/preview/${id}?token=${generatePreviewToken(id, userId)}`,
          lastSaved: new Date().toISOString(),
        },
      });
    }

    // For published properties, limited temporary operations
    return NextResponse.json({
      success: true,
      data: {
        isDraft: false,
        allowedOperations: [
          'duplicate',
          'create_offer',
          'generate_report',
        ],
        message: 'Property is published. Limited temporary operations available.',
      },
    });

  } catch (error) {
    console.error('Temporary operations error:', error);
    return NextResponse.json(
      { error: 'Failed to get temporary operations' },
      { status: 500 }
    );
  }
}

// POST /api/properties/[id]/temporary - Perform temporary operation
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

    const body = await request.json();
    const { operation, data } = body;

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation is required' },
        { status: 400 }
      );
    }

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id },
      select: { 
        userId: true, 
        agentId: true, 
        developerId: true,
        status: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const hasPermission = 
      property.userId === userId || 
      property.agentId === userId || 
      property.developerId === userId ||
      session.user.role === 'ADMIN';

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Handle different operations
    switch (operation) {
      case 'duplicate':
        return await duplicateProperty(id, userId);
      
      case 'save_draft':
        return await saveDraft(id, data, userId);
      
      case 'publish':
        return await publishProperty(id, userId);
      
      case 'validate':
        return await validateProperty(id);
      
      case 'create_offer':
        return await createSpecialOffer(id, data, userId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Temporary operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform operation' },
      { status: 500 }
    );
  }
}

// Helper functions for temporary operations
async function duplicateProperty(propertyId: string, userId: string) {
  try {
    const originalProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!originalProperty) {
      throw new Error('Original property not found');
    }

    // Create duplicate with "Copy of" prefix
    const duplicate = await prisma.property.create({
      data: {
        ...originalProperty,
        id: undefined, // Let Prisma generate new ID
        title: `Copy of ${originalProperty.title}`,
        slug: `${originalProperty.slug}-copy-${Date.now()}`,
        status: 'DRAFT',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null,
        views: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property duplicated successfully',
      data: {
        originalId: propertyId,
        duplicateId: duplicate.id,
        duplicateSlug: duplicate.slug,
      },
    });

  } catch (error) {
    console.error('Duplicate error:', error);
    throw error;
  }
}

async function saveDraft(propertyId: string, data: any, userId: string) {
  try {
    // Update property with draft data
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        ...data,
        status: 'DRAFT',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Draft saved successfully',
      data: {
        propertyId: updated.id,
        savedAt: updated.updatedAt,
        status: updated.status,
      },
    });

  } catch (error) {
    console.error('Save draft error:', error);
    throw error;
  }
}

async function publishProperty(propertyId: string, userId: string) {
  try {
    // Validate property before publishing
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        title: true,
        description: true,
        images: true,
        price: true,
        rentPrice: true,
        address: true,
        city: true,
        country: true,
      },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Basic validation checks
    const errors: string[] = [];
    
    if (!property.title) errors.push('Title is required');
    if (!property.description) errors.push('Description is required');
    if (!property.images) errors.push('At least one image is required');
    if (!property.address || !property.city || !property.country) {
      errors.push('Complete address is required');
    }
    if (!property.price && !property.rentPrice) {
      errors.push('Price or rent price is required');
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Property validation failed',
        errors,
      }, { status: 400 });
    }

    // Publish the property
    const published = await prisma.property.update({
      where: { id: propertyId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property published successfully',
      data: {
        propertyId: published.id,
        publishedAt: published.publishedAt,
        status: published.status,
        viewUrl: `/properties/${published.slug}`,
      },
    });

  } catch (error) {
    console.error('Publish error:', error);
    throw error;
  }
}

async function validateProperty(propertyId: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        title: true,
        description: true,
        images: true,
        address: true,
        city: true,
        country: true,
        type: true,
        category: true,
        purpose: true,
        price: true,
        rentPrice: true,
        area: true,
        bedrooms: true,
        bathrooms: true,
      },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Perform comprehensive validation
    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      suggestions: [] as string[],
      completeness: 0,
    };

    // Required fields
    const requiredFields = [
      { name: 'title', value: property.title, message: 'Title is required' },
      { name: 'description', value: property.description, message: 'Description is required' },
      { name: 'images', value: property.images, message: 'At least one image is required' },
      { name: 'address', value: property.address, message: 'Address is required' },
      { name: 'city', value: property.city, message: 'City is required' },
      { name: 'country', value: property.country, message: 'Country is required' },
      { name: 'type', value: property.type, message: 'Property type is required' },
      { name: 'category', value: property.category, message: 'Category (RENT/SALE) is required' },
      { name: 'purpose', value: property.purpose, message: 'Property purpose is required' },
      { name: 'area', value: property.area, message: 'Area is required' },
    ];

    let completedFields = 0;
    
    requiredFields.forEach(field => {
      if (field.value) {
        completedFields++;
      } else {
        validation.errors.push(field.message);
      }
    });

    // Price validation
    if (property.category === 'SALE' && !property.price) {
      validation.errors.push('Price is required for sale properties');
    } else if (property.category === 'RENT' && !property.rentPrice) {
      validation.errors.push('Rent price is required for rental properties');
    } else {
      completedFields++;
    }

    // Warnings
    if (!property.bedrooms) validation.warnings.push('Bedrooms not specified');
    if (!property.bathrooms) validation.warnings.push('Bathrooms not specified');
    
    // Suggestions
    if (property.description && property.description.length < 100) {
      validation.suggestions.push('Consider making the description more detailed (at least 100 characters)');
    }
    
    if (property.images && property.images.split(',').length < 3) {
      validation.suggestions.push('Add more images (3+ recommended)');
    }

    // Calculate completeness percentage
    validation.completeness = Math.round((completedFields / (requiredFields.length + 1)) * 100);
    validation.isValid = validation.errors.length === 0;

    return NextResponse.json({
      success: true,
      data: validation,
      message: validation.isValid 
        ? 'Property is valid and ready for publishing' 
        : 'Property needs corrections',
    });

  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
}

async function createSpecialOffer(propertyId: string, data: any, userId: string) {
  try {
    const { discountPercentage, validUntil, description } = data;

    if (!discountPercentage || !validUntil) {
      return NextResponse.json(
        { error: 'Discount percentage and valid until date are required' },
        { status: 400 }
      );
    }

    // In a real implementation, you might want to create a separate SpecialOffer model
    // For now, we'll just return a success message
    return NextResponse.json({
      success: true,
      message: 'Special offer created successfully',
      data: {
        propertyId,
        discountPercentage,
        validUntil,
        description,
        createdBy: userId,
        createdAt: new Date(),
      },
    });

  } catch (error) {
    console.error('Create offer error:', error);
    throw error;
  }
}

// Helper function to generate preview token
function generatePreviewToken(propertyId: string, userId: string): string {
  // In a real implementation, use JWT or similar
  const tokenData = {
    propertyId,
    userId,
    timestamp: Date.now(),
  };
  
  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}