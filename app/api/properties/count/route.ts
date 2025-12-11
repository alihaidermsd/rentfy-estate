import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        // Get total properties count
        const totalProperties = await prisma.property.count({
            where: { status: 'PUBLISHED' }
        });

        // Get unique cities count
        const citiesCount = await prisma.property.groupBy({
            by: ['city'],
            where: { status: 'PUBLISHED' },
            _count: {
                city: true
            }
        });

        // Get agents count
        const agentsCount = await prisma.user.count({
            where: { role: 'AGENT' }
        });

        // Mock customers count
        const customersCount = 50000;

        return NextResponse.json({
            total: totalProperties,
            cities: citiesCount.length,
            agents: agentsCount,
            customers: customersCount
        });
    } catch (error) {
        console.error('Properties count error:', error)
        return NextResponse.json({ 
            total: 10000, 
            cities: 200, 
            agents: 5000, 
            customers: 50000 
        });
    }
}