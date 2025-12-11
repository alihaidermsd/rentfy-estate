export default function CommercialPropertiesPage() {
  const properties = [
    {
      id: 1,
      title: "Downtown Office Space",
      location: "New York, NY",
      price: 500000,
      type: "Office",
      area: 5000
    },
    {
      id: 2,
      title: "Retail Store Front",
      location: "Los Angeles, CA",
      price: 750000,
      type: "Retail",
      area: 3000
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Commercial Properties</h1>
          <p className="text-gray-600">Find commercial spaces for your business needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">{property.location}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">${property.price.toLocaleString()}</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    {property.type}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {property.area.toLocaleString()} Sq Ft
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
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