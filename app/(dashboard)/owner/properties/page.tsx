export default function OwnerPropertiesPage() {
  const properties = [
    {
      id: '1',
      title: 'Beachfront Villa Malibu',
      type: 'Villa',
      purpose: 'Rent',
      price: '$400/night',
      status: 'Active',
      bookings: 8,
      revenue: '$3,200',
      occupancy: '85%',
      lastBooking: '2024-02-01'
    },
    {
      id: '2',
      title: 'Modern Downtown Apartment',
      type: 'Apartment',
      purpose: 'Rent',
      price: '$150/night',
      status: 'Active',
      bookings: 6,
      revenue: '$2,100',
      occupancy: '72%',
      lastBooking: '2024-02-03'
    },
    {
      id: '3',
      title: 'Mountain Cabin Retreat',
      type: 'Cabin',
      purpose: 'Rent',
      price: '$250/night',
      status: 'Active',
      bookings: 5,
      revenue: '$2,800',
      occupancy: '65%',
      lastBooking: '2024-01-28'
    },
    {
      id: '4',
      title: 'City Center Luxury Loft',
      type: 'Loft',
      purpose: 'Sale',
      price: '$750,000',
      status: 'For Sale',
      bookings: 0,
      revenue: '$0',
      occupancy: 'N/A',
      lastBooking: 'N/A'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'For Sale': return 'bg-blue-100 text-blue-800'
      case 'Inactive': return 'bg-gray-100 text-gray-800'
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Villa': return 'bg-pink-100 text-pink-800'
      case 'Apartment': return 'bg-blue-100 text-blue-800'
      case 'Cabin': return 'bg-orange-100 text-orange-800'
      case 'Loft': return 'bg-purple-100 text-purple-800'
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
        <a 
          href="/owner/properties/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Property</span>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">8</div>
          <div className="text-sm text-gray-600">Total Properties</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">6</div>
          <div className="text-sm text-gray-600">Active Rentals</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">1</div>
          <div className="text-sm text-gray-600">For Sale</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">1</div>
          <div className="text-sm text-gray-600">Under Maintenance</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>For Sale</option>
            <option>Inactive</option>
            <option>Maintenance</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Types</option>
            <option>Villa</option>
            <option>Apartment</option>
            <option>Cabin</option>
            <option>Loft</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Purposes</option>
            <option>Rent</option>
            <option>Sale</option>
          </select>
          <input
            type="text"
            placeholder="Search properties..."
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{property.title}</div>
                    <div className="text-sm text-gray-500">Last booking: {property.lastBooking}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(property.type)}`}>
                      {property.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {property.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {property.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.occupancy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <a href={`/owner/properties/${property.id}`} className="text-blue-600 hover:text-blue-900">Edit</a>
                      <a href={`/owner/properties/${property.id}/bookings`} className="text-green-600 hover:text-green-900">Bookings</a>
                      <a href={`/owner/properties/${property.id}/availability`} className="text-purple-600 hover:text-purple-900">Calendar</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}