'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';

interface DashboardStats {
  totalProperties: number;
  activeBookings: number;
  monthlyRevenue: {
    current: number;
    last: number;
    change: string;
  };
  occupancyRate: string;
  recentBookings: Array<{
    id: string;
    guest: string;
    property: string;
    checkIn: string;
    checkOut: string;
    amount: number;
    status: string;
  }>;
  propertyPerformance: Array<{
    name: string;
    revenue: number;
    bookings: number;
    occupancy: string;
  }>;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard/owner');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch stats');
        }
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching owner stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard stats</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'OO';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {session?.user?.name || 'Owner'}! Manage your properties and bookings.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Account Status</p>
              <p className="text-lg font-bold text-gray-900">Active</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
              {getInitials(session?.user?.name || 'Owner')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Properties */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue.current)}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className={`flex items-center text-sm ${parseFloat(stats.monthlyRevenue.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={parseFloat(stats.monthlyRevenue.change) >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
              </svg>
              {Math.abs(parseFloat(stats.monthlyRevenue.change))}% from last month
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/dashboard/owner/bookings" className="text-sm text-blue-600 hover:text-blue-500">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentBookings.length > 0 ? (
              stats.recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.guest}</p>
                    <p className="text-sm text-gray-600">{booking.property}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(booking.checkIn), 'MMM d, yyyy')} - {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(booking.amount)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent bookings</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/owner/properties/new" className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add New Property</span>
            </Link>
            
            <Link href="/dashboard/owner/calendar" className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Manage Calendar</span>
            </Link>
            
            <Link href="/dashboard/owner/properties" className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Update Availability</span>
            </Link>
            
            <Link href="/dashboard/owner/earnings" className="w-full flex items-center space-x-3 p-3 text-left bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>View Earnings Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Property Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Property Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.propertyPerformance.length > 0 ? (
            stats.propertyPerformance.map((property, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{property.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-medium text-gray-900">{formatCurrency(property.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bookings</span>
                    <span className="font-medium text-gray-900">{property.bookings}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Occupancy</span>
                    <span className="font-medium text-green-600">{property.occupancy}%</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full text-center py-4">No property performance data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
