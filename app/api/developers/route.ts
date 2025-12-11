import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const established = searchParams.get('established')
    const minProjects = searchParams.get('minProjects')
    const search = searchParams.get('search')
    const city = searchParams.get('city')

    const skip = (page - 1) * limit
    
    const where: any = {}
    
    // Filter by establishment year
    if (established) where.established = { gte: parseInt(established) }
    
    // Filter by minimum completed projects
    if (minProjects) where.completedProjects = { gte: parseInt(minProjects) }
    
    // Filter by city (through user profile)
    if (city) {
      where.user = {
        profile: {
          city: { contains: city, mode: 'insensitive' }
        }
      }
    }
    
    // Search by company name or description
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const [developers, total] = await Promise.all([
      prisma.developer.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              phone: true,
              profile: {
                select: {
                  city: true,
                  state: true,
                  country: true
                }
              }
            }
          },
          projects: {
            select: {
              id: true,
              status: true
            }
          },
          _count: {
            select: {
              projects: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.developer.count({ where })
    ])

    const developersWithStats = developers.map(developer => {
      const publishedProjects = developer.projects.filter(project => project.status === 'PUBLISHED').length
      const totalProjects = developer.projects.length

      return {
        id: developer.id,
        userId: developer.userId,
        companyName: developer.companyName,
        description: developer.description,
        logo: developer.logo,
        established: developer.established,
        completedProjects: developer.completedProjects,
        website: developer.website,
        phone: developer.phone,
        email: developer.email,
        address: developer.address,
        createdAt: developer.createdAt,
        updatedAt: developer.updatedAt,
        user: developer.user,
        stats: {
          totalProjects,
          publishedProjects,
          draftProjects: totalProjects - publishedProjects,
          completionRate: developer.completedProjects > 0 ? 
            Math.round((developer.completedProjects / (developer.completedProjects + totalProjects)) * 100) : 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: developersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Developers fetch error:', error)
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
      companyName,
      description,
      logo,
      established,
      completedProjects,
      website,
      phone,
      email,
      address
    } = body

    // Validation
    if (!userId || !companyName) {
      return NextResponse.json(
        { error: 'userId and companyName are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if developer profile already exists
    const existingDeveloper = await prisma.developer.findUnique({
      where: { userId }
    })

    if (existingDeveloper) {
      return NextResponse.json(
        { error: 'Developer profile already exists for this user' },
        { status: 409 }
      )
    }

    const developer = await prisma.developer.create({
      data: {
        userId,
        companyName,
        description: description || null,
        logo: logo || null,
        established: established ? parseInt(established) : null,
        completedProjects: completedProjects ? parseInt(completedProjects) : 0,
        website: website || null,
        phone: phone || null,
        email: email || null,
        address: address || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(
      { 
        success: true,
        message: 'Developer profile created successfully',
        data: developer 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Developer creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}