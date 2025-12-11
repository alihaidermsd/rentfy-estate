interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = {
    id: params.id,
    name: "Marina Bay Residences",
    developer: "Elite Developers",
    location: "Miami, FL",
    description: "Luxury waterfront living with panoramic city views. This exclusive development offers breathtaking views, premium amenities, and sophisticated design in one of the most sought-after locations.",
    status: "Under Construction",
    completion: "Q4 2024",
    units: 150,
    startingPrice: 850000,
    amenities: ["Infinity Pool", "Fitness Center", "Private Marina", "Concierge Service", "Rooftop Garden", "Underground Parking"]
  };

  const unitTypes = [
    { type: "2-Bedroom Apartment", size: "1,200 sq ft", price: 850000, available: 12 },
    { type: "3-Bedroom Apartment", size: "1,800 sq ft", price: 1200000, available: 8 },
    { type: "Penthouse", size: "3,000 sq ft", price: 2500000, available: 2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
              <p className="text-gray-600 text-lg">by {project.developer}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">From ${project.startingPrice.toLocaleString()}</div>
              <div className="text-gray-600">Starting Price</div>
            </div>
          </div>
          
          <p className="text-gray-700 text-lg mb-6">{project.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{project.status}</div>
              <div className="text-gray-600">Status</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-green-600">{project.completion}</div>
              <div className="text-gray-600">Completion</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{project.units}</div>
              <div className="text-gray-600">Total Units</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{project.location}</div>
              <div className="text-gray-600">Location</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Unit Types */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Available Unit Types</h2>
              <div className="space-y-4">
                {unitTypes.map((unit, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:border-blue-500 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{unit.type}</h4>
                        <p className="text-gray-600">{unit.size}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">${unit.price.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{unit.available} units available</div>
                      </div>
                    </div>
                    <button className="w-full mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                      Inquire About This Unit
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-xl font-semibold mb-4">Project Inquiry</h3>
              <p className="text-gray-600 mb-4">Interested in this project? Contact us for more information.</p>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Interested Unit Type</option>
                  {unitTypes.map((unit, index) => (
                    <option key={index}>{unit.type}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Additional Questions"
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Submit Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}