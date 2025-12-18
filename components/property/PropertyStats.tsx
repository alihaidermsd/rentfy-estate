// components/properties/PropertyStats.tsx
import { prisma } from '@/lib/prisma';

interface PropertyStatsProps {
  userId?: string;
}

export default async function PropertyStats({ userId }: PropertyStatsProps) {
  // Base where clause for properties
  const baseWhere = userId 
    ? { OR: [{ userId }, { agentId: userId }] }
    : { status: 'ACTIVE' };

  // Get all properties
  const totalProperties = await prisma.property.count({
    where: baseWhere
  });

  // Get current date for availability check (start of today)
  const currentDate = new Date();
  const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const endOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

  // Find properties that have active bookings for today
  const activeBookings = await prisma.booking.findMany({
    where: {
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      OR: [
        {
          startDate: { lte: endOfToday },
          endDate: { gte: startOfToday }
        }
      ]
    },
    select: {
      propertyId: true
    }
  });

  const bookedPropertyIds = activeBookings.map(booking => booking.propertyId);

  // Find properties that are marked as unavailable in Availability table for today
  const unavailableProperties = await prisma.availability.findMany({
    where: {
      date: {
        gte: startOfToday,
        lt: endOfToday
      },
      available: false
    },
    select: {
      propertyId: true
    }
  });

  const unavailablePropertyIds = unavailableProperties.map(avail => avail.propertyId);

  // Count available properties
  // Available = not booked AND not marked as unavailable in Availability table
  const availableProperties = await prisma.property.count({
    where: {
      ...baseWhere,
      AND: [
        {
          id: {
            notIn: [...bookedPropertyIds, ...unavailablePropertyIds]
          }
        }
      ]
    }
  });

  // Total revenue (for properties owned by user)
  const totalRevenue = userId 
    ? await prisma.booking.aggregate({
        where: {
          property: {
            OR: [{ userId }, { agentId: userId }]
          },
          status: { in: ['COMPLETED', 'CHECKED_OUT'] }
        },
        _sum: { totalAmount: true }
      })
    : { _sum: { totalAmount: null } };

  // Calculate occupancy rate
  const occupancyRate = totalProperties > 0 
    ? Math.round(((totalProperties - availableProperties) / totalProperties) * 100)
    : 0;

  const stats = [
    {
      name: 'Total Properties',
      value: totalProperties,
      change: '+4.75%',
      changeType: 'positive',
      icon: '🏠'
    },
    {
      name: 'Available Now',
      value: availableProperties,
      change: '+12.5%',
      changeType: 'positive',
      icon: '✅'
    },
    {
      name: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      change: '+2.3%',
      changeType: occupancyRate > 70 ? 'positive' : 'negative',
      icon: '📊'
    },
    {
      name: 'Total Revenue',
      value: totalRevenue._sum.totalAmount 
        ? `$${totalRevenue._sum.totalAmount.toLocaleString()}`
        : '$0',
      change: '+8.1%',
      changeType: 'positive',
      icon: '💰'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <span className="text-3xl">{stat.icon}</span>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </span>
            <span className="text-sm text-gray-500 ml-2">from last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}