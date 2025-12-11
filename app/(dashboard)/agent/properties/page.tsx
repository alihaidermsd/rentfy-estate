export default function AgentPropertiesPage() {
  const properties = [
    {
      id: '1',
      title: 'Luxury Villa in Beverly Hills',
      type: 'Villa',
      purpose: 'Sale',
      price: '$2,500,000',
      status: 'Active',
      views: 245,
      inquiries: 12,
      listedDate: '2024-01-15',
      image: '/property-1.jpg'
    },
    {
      id: '2',
      title: 'Modern Downtown Apartment',
      type: 'Apartment',
      purpose: 'Rent',
      price: '$3,200/month',
      status: 'Active',
      views: 189,
      inquiries: 8,
      listedDate: '2024-01-10',
      image: '/property-2.jpg'
    },
    {
      id: '3',
      title: 'Beachfront Condo Malibu',
      type: 'Condo',
      purpose: 'Sale',
      price: '$1,800,000',
      status: 'Pending',
      views: 156,
      inquiries: 5,
      listedDate: '2024-01-20',
      image: '/property-3.jpg'
    },
    {
      id: '4',
      title: 'Suburban Family Home',
      type: 'House',
      purpose: 'Rent',
      price: '$4,500/month',
      status: 'Sold',
      views: 321,
      inquiries: 15,
      listedDate: '2023-12-05',
      image: '/property-4.jpg'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Sold': return 'bg-blue-100 text-blue-800'
      case 'Rented': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Villa': return 'bg-pink-100 text-pink-800'
      case 'Apartment': return 'bg-blue-100 text-blue-800'
      case 'Condo': return 'bg-indigo-100 text-indigo-800'
      case 'House': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-2">Manage your property listings and track performance</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Property</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-sm text-gray-600">Total Listings</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">18</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-sm text-gray-600">Sold/Rented</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Sold</option>
            <option>Rented</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Types</option>
            <option>Villa</option>
            <option>Apartment</option>
            <option>Condo</option>
            <option>House</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Purposes</option>
            <option>Sale</option>
            <option>Rent</option>
          </select>
          <input
            type="text"
            placeholder="Search properties..."
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Property Image */}
            <div className="h-48 bg-gray-200 relative">
              <div className="absolute top-3 left-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(property.type)}`}>
                  {property.type}
                </span>
              </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
              <p className="text-lg font-bold text-blue-600 mb-3">{property.price}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.views} views
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {property.inquiries} inquiries
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Listed: {property.listedDate}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          Load More Properties
        </button>
      </div>
    </div>
  )
}