import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, verified, verificationNotes } = body

    if (!agentId || typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'agentId and verified status are required' },
        { status: 400 }
      )
    }

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        user: {
          select: {
            name: true,
            email: true
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

    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        verified,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Create verification record
    const message = verified 
      ? `Agent ${agent.user.name} has been verified successfully. ${verificationNotes || ''}`
      : `Agent ${agent.user.name} verification has been revoked. ${verificationNotes || ''}`

    return NextResponse.json({
      success: true,
      message: `Agent ${verified ? 'verified' : 'unverified'} successfully`,
      data: {
        agent: updatedAgent,
        verification: {
          verified,
          verifiedAt: new Date(),
          notes: verificationNotes
        }
      }
    })
  } catch (error) {
    console.error('Agent verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const verified = searchParams.get('verified')

    const skip = (page - 1) * limit
    
    const where: any = {}
    if (verified) where.verified = verified === 'true'

    const [pendingAgents, total] = await Promise.all([
      prisma.agent.findMany({
        where: { verified: false }, // Get unverified agents for approval queue
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              profile: {
                select: {
                  city: true,
                  state: true,
                  country: true
                }
              }
            }
          },
          properties: {
            select: {
              id: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.agent.count({ where: { verified: false } })
    ])

    const agentsWithStats = pendingAgents.map(agent => ({
      ...agent,
      stats: {
        totalProperties: agent.properties.length,
        experience: agent.experience,
        hasLicense: !!agent.licenseNumber,
        hasCompany: !!agent.company
      }
    }))

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
    console.error('Pending agents fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}