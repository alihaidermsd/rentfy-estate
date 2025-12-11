import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const featured = searchParams.get('featured')
    const city = searchParams.get('city')

    const skip = (page - 1) * limit
    
    const where: any = { developerId: params.id }
    
    if (status) where.status = status
    if (category) where.category = category
    if (type) where.type = type
    if (featured) where.featured = featured === 'true'
    if (city) where.city = { contains: city, mode: 'insensitive' }

    const [projects, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          bookings: {
            select: {
              id: true,
              status: true
            }
          },
          favorites: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.property.count({ where })
    ])

    const projectsWithStats = projects.map(project => {
      const averageRating = project.reviews.length > 0 
        ? project.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / project.reviews.length 
        : 0

      const confirmedBookings = project.bookings.filter(booking => 
        booking.status === 'CONFIRMED'
      ).length

      // Determine project status based on property status and other factors
      let projectStatus = project.status
      if (project.status === 'SOLD' || project.status === 'RENTED') {
        projectStatus = 'COMPLETED'
      }

      return {
        ...project,
        amenities: JSON.parse(project.amenities || '[]'),
        images: JSON.parse(project.images || '[]'),
        averageRating,
        totalReviews: project.reviews.length,
        totalBookings: project.bookings.length,
        confirmedBookings,
        totalFavorites: project.favorites.length,
        projectStatus,
        isNewProject: project.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Within 30 days
      }
    })

    // Get developer info for stats
    const developer = await prisma.developer.findUnique({
      where: { id: params.id },
      select: {
        companyName: true,
        completedProjects: true,
        established: true
      }
    })

    const stats = {
      totalProjects: total,
      publishedProjects: projects.filter(p => p.status === 'PUBLISHED').length,
      soldProjects: projects.filter(p => p.status === 'SOLD').length,
      rentedProjects: projects.filter(p => p.status === 'RENTED').length,
      completedProjects: developer?.completedProjects || 0,
      yearsInBusiness: developer?.established ? new Date().getFullYear() - developer.established : null
    }

    return NextResponse.json({
      success: true,
      data: {
        projects: projectsWithStats,
        developer: {
          companyName: developer?.companyName,
          stats
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
    console.error('Developer projects fetch error:', error)
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
    const {
      title, description, type, category, purpose, price, address, city, state, country,
      bedrooms, bathrooms, area, amenities, images, userId
    } = body

    // Validation
    if (!title || !description || !type || !category || !purpose || !address || !city || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if developer exists
    const developer = await prisma.developer.findUnique({
      where: { id: params.id }
    })

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    const project = await prisma.property.create({
      data: {
        title,
        description,
        type,
        category,
        purpose,
        slug,
        price: price ? parseFloat(price) : null,
        address,
        city,
        state: state || '',
        country: country || '',
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        area: area ? parseFloat(area) : 0,
        amenities: JSON.stringify(amenities || []),
        images: JSON.stringify(images || []),
        userId,
        developerId: params.id,
        status: 'DRAFT'
      }
    })

    const projectResponse = {
      ...project,
      amenities: JSON.parse(project.amenities || '[]'),
      images: JSON.parse(project.images || '[]')
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Project created successfully',
        data: projectResponse 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Project creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}