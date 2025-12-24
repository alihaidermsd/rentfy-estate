'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  agent: {
    name: string;
    rating: number;
    image: string | null;
  };
  totalListings: {
    total: number;
    thisMonth: number;
  };
  activeClients: {
    total: number;
    newThisWeek: number;
  };
  monthlyRevenue: {
    current: number;
    last: number;
    change: string;
  };
  pendingTasks: number;
  recentActivity: Array<{
    id: string;
    action: string;
    property: string;
    client: string;
    time: string;
  }>;
  upcomingAppointments: Array<{
    id: string;
    client: string;
    type: string;
    property: string;
    date: string;
    status: string;
  }>;
}

export default function AgentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard/agent');
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
        console.error('Error fetching agent stats:', error);
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
      .slice(0, 2) || 'AG';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {stats.agent.name}! Here's your performance overview.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Agent Rating</p>
              <div className="flex items-center">
                <span className="text-lg font-bold text-gray-900">{stats.agent.rating.toFixed(1)}</span>
                <svg className="w-5 h-5 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
              {getInitials(stats.agent.name)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Listings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalListings.total}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +{stats.totalListings.thisMonth} this month
            </div>
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeClients.total}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              +{stats.activeClients.newThisWeek} this week
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

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className={`flex items-center text-sm ${stats.pendingTasks > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats.pendingTasks > 0 ? "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
              </svg>
              {stats.pendingTasks > 0 ? 'Needs attention' : 'All caught up'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/dashboard/agent/leads" className="text-sm text-blue-600 hover:text-blue-500">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.property}</p>
                    <p className="text-sm text-gray-600">Client: {activity.client}</p>
                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(activity.time), { addSuffix: true })}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/agent/properties/new" className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add New Property</span>
            </Link>
            
            <Link href="/dashboard/agent/clients" className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Add New Client</span>
            </Link>
            
            <Link href="/dashboard/agent/leads" className="w-full flex items-center space-x-3 p-3 text-left bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Schedule Viewing</span>
            </Link>
            
            <Link href="/dashboard/agent/properties" className="w-full flex items-center space-x-3 p-3 text-left bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Update Availability</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Appointments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.upcomingAppointments.length > 0 ? (
            stats.upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{appointment.client}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'RESPONDED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{appointment.type}</p>
                <p className="text-sm text-gray-900 mb-3">{appointment.property}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {format(new Date(appointment.date), 'MMM d, h:mm a')}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full text-center py-4">No upcoming appointments</p>
          )}
        </div>
      </div>
    </div>
  );
}
