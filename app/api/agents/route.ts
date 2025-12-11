import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const verified = searchParams.get('verified')
    const featured = searchParams.get('featured')
    const city = searchParams.get('city')
    const experience = searchParams.get('experience')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit
    
    const where: any = {}
    
    // Filter by verification status
    if (verified) where.verified = verified === 'true'
    
    // Filter by featured status
    if (featured) where.featured = featured === 'true'
    
    // Filter by experience
    if (experience) where.experience = { gte: parseInt(experience) }
    
    // Filter by city (through user profile)
    if (city) {
      where.user = {
        profile: {
          city: { contains: city, mode: 'insensitive' }
        }
      }
    }
    
    // Search by name, company, or specialties
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { company: { contains: search, mode: 'insensitive' } },
        { specialties: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
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
                  country: true,
                  avatar: true
                }
              }
            }
          },
          properties: {
            select: {
              id: true,
              status: true
            }
          },
          _count: {
            select: {
              properties: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.agent.count({ where })
    ])

    const agentsWithStats = agents.map(agent => {
      const publishedProperties = agent.properties.filter(prop => prop.status === 'PUBLISHED').length
      const totalProperties = agent.properties.length

      return {
        id: agent.id,
        userId: agent.userId,
        company: agent.company,
        license: agent.licenseNumber,
        experience: agent.experience,
        bio: agent.bio,
        specialties: agent.specialties,
        languages: agent.languages,
        officeAddress: agent.officeAddress,
        website: agent.website,
        socialMedia: agent.socialMedia,
        totalListings: agent.totalListings,
        verified: agent.verified,
        featured: agent.featured,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        user: agent.user,
        stats: {
          totalProperties,
          publishedProperties,
          draftProperties: totalProperties - publishedProperties
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: agentsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Agents fetch error:', error)
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
      company,
      license,
      experience,
      bio,
      specialties,
      languages,
      officeAddress,
      website,
      socialMedia
    } = body

    // Validation
    if (!userId || !specialties || !languages) {
      return NextResponse.json(
        { error: 'userId, specialties, and languages are required' },
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

    // Check if agent profile already exists
    const existingAgent = await prisma.agent.findUnique({
      where: { userId }
    })

    if (existingAgent) {
      return NextResponse.json(
        { error: 'Agent profile already exists for this user' },
        { status: 409 }
      )
    }

    const agent = await prisma.agent.create({
      data: {
        userId,
        company: company || null,
        licenseNumber: license || null,
        experience: experience ? parseInt(experience) : null,
        bio: bio || null,
        specialties,
        languages,
        officeAddress: officeAddress || null,
        website: website || null,
        socialMedia: socialMedia || null,
        totalListings: 0,
        verified: false,
        featured: false
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

    // Update user role to 'AGENT'
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'AGENT' }
    })

    return NextResponse.json(
      { 
        success: true,
        message: 'Agent profile created successfully',
        data: agent 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Agent creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}