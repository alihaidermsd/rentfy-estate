import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            createdAt: true,
            profile: {
              select: {
                id: true,
                phone: true,
                bio: true,
                avatar: true,
                address: true,
                city: true,
                state: true,
                zipCode: true,
                country: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        properties: {
          where: {
            status: 'PUBLISHED'
          },
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            price: true,
            rentPrice: true,
            images: true,
            address: true,
            city: true,
            state: true,
            bedrooms: true,
            bathrooms: true,
            area: true,
            status: true,
            featured: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 6
        },
        _count: {
          select: {
            properties: {
              where: {
                status: 'PUBLISHED'
              }
            }
          }
        }
      }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    const propertiesWithParsedImages = agent.properties.map(property => ({
      ...property,
      images: JSON.parse(property.images || '[]')
    }))

    const agentResponse = {
      ...agent,
      properties: propertiesWithParsedImages,
      stats: {
        totalListings: agent._count.properties,
        experience: agent.experience,
        verified: agent.verified,
        featured: agent.featured
      }
    }

    return NextResponse.json({
      success: true,
      data: agentResponse
    })
  } catch (error) {
    console.error('Agent fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const agent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        company: body.company,
        licenseNumber: body.license,
        experience: body.experience ? parseInt(body.experience) : undefined,
        bio: body.bio,
        specialties: body.specialties,
        languages: body.languages,
        officeAddress: body.officeAddress,
        website: body.website,
        socialMedia: body.socialMedia,
        featured: body.featured,
        updatedAt: new Date()
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

    return NextResponse.json({
      success: true,
      message: 'Agent profile updated successfully',
      data: agent
    })
  } catch (error) {
    console.error('Agent update error:', error)
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
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Delete agent profile
    await prisma.agent.delete({
      where: { id: params.id }
    })

    // Update user role to 'USER'
    await prisma.user.update({
      where: { id: agent.userId },
      data: { role: 'USER' }
    })

    return NextResponse.json({
      success: true,
      message: 'Agent profile deleted successfully'
    })
  } catch (error) {
    console.error('Agent deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}