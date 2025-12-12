import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Rentfy</h3>
            <p className="text-gray-400">
              Find your perfect property with our advanced search and expert agents.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Properties</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/properties/buy" className="hover:text-white transition">Buy</Link></li>
              <li><Link href="/properties/rent" className="hover:text-white transition">Rent</Link></li>
              <li><Link href="/properties/commercial" className="hover:text-white transition">Commercial</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/agents" className="hover:text-white transition">Agents</Link></li>
              <li><Link href="/developers" className="hover:text-white transition">Developers</Link></li>
              <li><Link href="/agents/become-agent" className="hover:text-white transition">Become an Agent</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>support@rentfy.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Rentfy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}