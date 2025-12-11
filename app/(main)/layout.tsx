import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Real Estate Platform',
  description: 'Find your dream property with our real estate platform',
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">RealEstate</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition">Home</a>
              <a href="/properties" className="text-gray-700 hover:text-blue-600 transition">Properties</a>
              <a href="/agents" className="text-gray-700 hover:text-blue-600 transition">Agents</a>
              <a href="/developers" className="text-gray-700 hover:text-blue-600 transition">Developers</a>
              <a href="/search" className="text-gray-700 hover:text-blue-600 transition">Search</a>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-blue-600 transition">Login</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">RealEstate</h3>
              <p className="text-gray-400">Find your perfect property with our platform.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Properties</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/properties/buy" className="hover:text-white transition">Buy</a></li>
                <li><a href="/properties/rent" className="hover:text-white transition">Rent</a></li>
                <li><a href="/properties/commercial" className="hover:text-white transition">Commercial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/agents" className="hover:text-white transition">Agents</a></li>
                <li><a href="/developers" className="hover:text-white transition">Developers</a></li>
                <li><a href="/agents/become-agent" className="hover:text-white transition">Become an Agent</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@realestate.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Real Estate Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}