// app/(dashboard)/layout.tsx - FIXED
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Dashboard-specific navigation - no root links
  const links = [
    { href: "/dashboard/user", label: "User Dashboard" },
    { href: "/dashboard/owner", label: "Owner Dashboard" },
    { href: "/dashboard/agent", label: "Agent Dashboard" },
    { href: "/dashboard/admin", label: "Admin Dashboard" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg font-medium ${
                pathname.startsWith(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="flex items-center justify-between px-4 py-4 bg-white shadow-sm">
          <button onClick={() => setIsOpen(true)} className="lg:hidden">
            <Menu />
          </button>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}