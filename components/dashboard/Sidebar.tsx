// components/dashboard/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Building,
  Calendar,
  DollarSign,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react'

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Properties', href: '/admin/properties', icon: Building },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Payments', href: '/admin/payments', icon: DollarSign },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

const userNavigation = [
  { name: 'Dashboard', href: '/dashboard/user', icon: Home },
  { name: 'Profile', href: '/dashboard/user/profile', icon: Users },
  { name: 'Bookings', href: '/dashboard/user/bookings', icon: Calendar },
  { name: 'Favorites', href: '/dashboard/user/favorites', icon: Building },
]

export default function DashboardSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  
  const navigation = userRole === 'admin' ? adminNavigation : userNavigation

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold">
            {userRole === 'admin' ? 'Admin Panel' : 'My Account'}
          </span>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}