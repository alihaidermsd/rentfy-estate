// app/(dashboard)/layout.tsx - FIXED
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get user role from session
  useEffect(() => {
    if (session?.user) {
      // Check the role from the session
      const role = (session.user as any)?.role || 
                   (session.user as any)?.user?.role || 
                   'USER'; // Default to USER if no role found
      setUserRole(role);
    }
  }, [session]);

  // Dashboard-specific navigation - show only relevant links based on user role
  const getDashboardLinks = () => {
    const baseLinks = [];

    // Always show user dashboard if user exists
    baseLinks.push({ href: "/dashboard/user", label: "User Dashboard" });

    // Add role-specific dashboards
    if (userRole === 'OWNER' || userRole === 'ADMIN') {
      baseLinks.push({ href: "/dashboard/owner", label: "Owner Dashboard" });
    }
    
    if (userRole === 'AGENT' || userRole === 'ADMIN') {
      baseLinks.push({ href: "/dashboard/agent", label: "Agent Dashboard" });
    }
    
    if (userRole === 'ADMIN') {
      baseLinks.push({ href: "/dashboard/admin", label: "Admin Dashboard" });
    }

    return baseLinks;
  };

  const links = getDashboardLinks();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access the dashboard.</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-sm text-gray-500 capitalize">
              {userRole?.toLowerCase()} panel
            </p>
          </div>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center space-x-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-sm">{session.user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {userRole?.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Logout Link */}
          <div className="pt-4 mt-4 border-t">
            <Link
              href="/api/auth/signout"
              className="block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
            >
              Logout
            </Link>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-white shadow-sm">
          <button 
            onClick={() => setIsOpen(true)} 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {links.find(link => pathname.startsWith(link.href))?.label || "Dashboard"}
            </h1>
            <p className="text-sm text-gray-500">
              Welcome back, {session.user?.name?.split(" ")[0] || "User"}!
            </p>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}