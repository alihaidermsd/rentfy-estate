'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, User, LogOut, Home, Search, Building2, Users } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { session, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category) params.set('category', category);
    
    router.push(`/search?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
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

  const navigationItems = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Properties', href: '/properties', icon: <Building2 className="w-4 h-4" /> },
    { name: 'Buy', href: '/properties/buy', icon: <Home className="w-4 h-4" /> },
    { name: 'Rent', href: '/properties/rent', icon: <Home className="w-4 h-4" /> },
    { name: 'Agents', href: '/agents', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Rentfy</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <input
                  type="text"
                  placeholder="Search by location, property, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 bg-transparent border-0 focus:outline-none text-gray-700 placeholder-gray-500"
                />
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border-0 bg-transparent focus:outline-none text-gray-700 px-2"
                >
                  <option value="">All</option>
                  <option value="SALE">Buy</option>
                  <option value="RENT">Rent</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Auth Links */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-10 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              <>
                <Link 
                  href={getDashboardLink()} 
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 border-t pt-4 pb-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none"
                />
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Mobile Auth Links */}
              <div className="border-t pt-4 mt-4">
                {loading ? (
                  <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                ) : session ? (
                  <>
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-center mt-2"
                    >
                      Sign Up
                    </Link>
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