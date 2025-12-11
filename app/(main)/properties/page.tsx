export default function PropertiesPage() {
  const properties = [
    {
      id: 1,
      title: "Modern Downtown Apartment",
      location: "New York, NY",
      price: 350000,
      type: "sale",
      beds: 2,
      baths: 2,
      area: 1200,
      image: "/api/placeholder/400/300"
    },
    {
      id: 2,
      title: "Luxury Villa with Pool",
      location: "Los Angeles, CA",
      price: 1200000,
      type: "sale",
      beds: 4,
      baths: 3,
      area: 2800,
      image: "/api/placeholder/400/300"
    },
    {
      id: 3,
      title: "Cozy Family Home",
      location: "Chicago, IL",
      price: 450000,
      type: "sale",
      beds: 3,
      baths: 2,
      area: 1600,
      image: "/api/placeholder/400/300"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Properties</h1>
          <p className="text-gray-600">Discover our complete collection of properties</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Property Type</option>
              <option>House</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Commercial</option>
            </select>
            <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Price Range</option>
              <option>$0 - $100,000</option>
              <option>$100,000 - $300,000</option>
              <option>$300,000 - $500,000</option>
              <option>$500,000+</option>
            </select>
            <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Bedrooms</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
            <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition font-semibold">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{property.title}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    property.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{property.location}</p>
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  ${property.price.toLocaleString()}
                </div>
                <div className="flex justify-between text-sm text-gray-500 border-t pt-4">
                  <span>{property.beds} Beds</span>
                  <span>{property.baths} Baths</span>
                  <span>{property.area.toLocaleString()} Sq Ft</span>
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}