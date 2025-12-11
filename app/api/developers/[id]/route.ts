import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const developer = await prisma.developer.findUnique({
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
        projects: {
          where: {
            status: 'PUBLISHED'
          },
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            price: true,
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
          take: 8
        },
        _count: {
          select: {
            projects: {
              where: {
                status: 'PUBLISHED'
              }
            }
          }
        }
      }
    })

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      )
    }

    const projectsWithParsedImages = developer.projects.map(project => ({
      ...project,
      images: JSON.parse(project.images || '[]')
    }))

    const developerResponse = {
      ...developer,
      projects: projectsWithParsedImages,
      stats: {
        totalProjects: developer._count.projects,
        yearsInBusiness: developer.established ? new Date().getFullYear() - developer.established : null,
        completionRate: developer.completedProjects > 0 ? 
          Math.round((developer.completedProjects / (developer.completedProjects + developer._count.projects)) * 100) : 0
      }
    }

    return NextResponse.json({
      success: true,
      data: developerResponse
    })
  } catch (error) {
    console.error('Developer fetch error:', error)
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
    
    const developer = await prisma.developer.update({
      where: { id: params.id },
      data: {
        companyName: body.companyName,
        description: body.description,
        logo: body.logo,
        established: body.established ? parseInt(body.established) : undefined,
        completedProjects: body.completedProjects ? parseInt(body.completedProjects) : undefined,
        website: body.website,
        phone: body.phone,
        email: body.email,
        address: body.address,
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
      message: 'Developer profile updated successfully',
      data: developer
    })
  } catch (error) {
    console.error('Developer update error:', error)
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
    const developer = await prisma.developer.findUnique({
      where: { id: params.id }
    })

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      )
    }

    await prisma.developer.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Developer profile deleted successfully'
    })
  } catch (error) {
    console.error('Developer deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}