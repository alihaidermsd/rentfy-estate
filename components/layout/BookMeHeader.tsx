"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Menu, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function BookMeHeader() {
  const { session, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  const getDashboardLink = () => {
    if (!session?.user) return '/';
    const role = session.user.role;
    switch (role) {
      case 'SUPERADMIN':
      case 'ADMIN':
        return '/dashboard/admin';
      case 'OWNER':
        return '/dashboard/owner';
      case 'AGENT':
        return '/dashboard/agent';
      default:
        return '/dashboard/user';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="font-semibold text-lg">BookMe</span>
          </Link>

          <nav className="hidden md:flex flex-1 justify-center">
            <div className="inline-flex bg-white rounded-full shadow-sm border px-2 py-1">
              <Link href="/bookme" className="px-4 py-2 text-sm text-gray-700 hover:text-pink-600">Homes</Link>
              <Link href="/experiences" className="px-4 py-2 text-sm text-gray-700 hover:text-pink-600">Experiences</Link>
              <Link href="/services" className="px-4 py-2 text-sm text-gray-700 hover:text-pink-600">Services</Link>
            </div>
          </nav>

          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/bookme" className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-xl bg-yellow-50 flex items-center justify-center border">
                <span className="text-2xl">🏠</span>
              </div>
              <span className="text-xs text-gray-600 mt-2">Homes</span>
            </Link>

            <Link href="/experiences" className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-xl bg-pink-50 flex items-center justify-center border">
                <span className="text-2xl">🎈</span>
              </div>
              <span className="text-xs text-gray-600 mt-2">Experiences</span>
            </Link>

            <Link href="/services" className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center border">
                <span className="text-2xl">🛎️</span>
              </div>
              <span className="text-xs text-gray-600 mt-2">Services</span>
            </Link>
          </div>

          <div className="ml-auto hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-10 bg-gray-200 animate-pulse rounded" />
            ) : session ? (
              <>
                <Link href={getDashboardLink()} className="flex items-center space-x-2 text-gray-700 hover:text-pink-600">
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-pink-600">Login</Link>
                <Link href="/register" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">Sign Up</Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 ml-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col space-y-3">
              <Link href="/bookme" className="block px-4 py-2">Homes</Link>
              <Link href="/experiences" className="block px-4 py-2">Experiences</Link>
              <Link href="/services" className="block px-4 py-2">Services</Link>
              <div className="border-t pt-3">
                {loading ? (
                  <div className="h-10 bg-gray-200 animate-pulse rounded" />
                ) : session ? (
                  <>
                    <Link href={getDashboardLink()} className="block px-4 py-2">Dashboard</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2">Login</Link>
                    <Link href="/register" className="block px-4 py-2">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
