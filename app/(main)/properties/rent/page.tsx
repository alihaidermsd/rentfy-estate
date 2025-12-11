export default function RentPropertiesPage() {
  const properties = [
    {
      id: 1,
      title: "Downtown Studio Apartment",
      location: "New York, NY",
      price: 2500,
      beds: 1,
      baths: 1,
      area: 800
    },
    {
      id: 2,
      title: "Family Home in Suburbs",
      location: "Chicago, IL",
      price: 1800,
      beds: 3,
      baths: 2,
      area: 1600
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Properties For Rent</h1>
          <p className="text-gray-600">Discover rental properties that match your lifestyle and budget</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">{property.location}</p>
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  ${property.price}/month
                </div>
                <div className="flex justify-between text-sm text-gray-500">
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