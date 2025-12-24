'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface DashboardStats {
  bookings: number;
  favorites: number;
  inquiries: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard/user');
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
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard stats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session.user?.name}!</p>
          <p className="text-sm text-gray-500">Role: {session.user?.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">My Bookings</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.bookings}</p>
            <Link 
              href="/dashboard/user/bookings" 
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Favorites</h3>
            <p className="text-2xl font-bold text-green-600">{stats.favorites}</p>
            <Link 
              href="/dashboard/user/favorites" 
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
            >
              View favorites →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Inquiries</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.inquiries}</p>
            <Link 
              href="/dashboard/user/inquiries" 
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
            >
              View inquiries →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              href="/properties"
              className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-blue-600 text-lg font-semibold">Browse Properties</div>
              <p className="text-gray-600 text-sm mt-1">Find your perfect home</p>
            </Link>

            <Link 
              href="/dashboard/user/profile"
              className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-blue-600 text-lg font-semibold">Edit Profile</div>
              <p className="text-gray-600 text-sm mt-1">Update your information</p>
            </Link>

            <Link 
              href="/agents"
              className="p-4 border-2 border-gray-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-blue-600 text-lg font-semibold">Find Agents</div>
              <p className="text-gray-600 text-sm mt-1">Connect with real estate agents</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
