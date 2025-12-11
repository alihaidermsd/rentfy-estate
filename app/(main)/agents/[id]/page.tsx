interface AgentPageProps {
  params: {
    id: string
  }
}

export default function AgentProfilePage({ params }: AgentPageProps) {
  const agent = {
    id: params.id,
    name: "John Smith",
    title: "Senior Real Estate Agent",
    experience: "15+ Years",
    properties: 245,
    rating: 4.9,
    phone: "(555) 123-4567",
    email: "john.smith@example.com",
    description: "John Smith is a seasoned real estate professional with over 15 years of experience in the industry. He specializes in luxury properties and has helped hundreds of families find their dream homes.",
    specialties: ["Luxury Homes", "Commercial Properties", "Investment Properties"]
  };

  const agentProperties = [
    { id: 1, title: "Luxury Villa", price: 2500000, location: "Beverly Hills, CA" },
    { id: 2, title: "Downtown Penthouse", price: 1800000, location: "New York, NY" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                <p className="text-gray-600 mb-4">{agent.title}</p>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-gray-700">{agent.rating} Rating</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">📞 {agent.phone}</p>
                  <p className="text-gray-700">✉️ {agent.email}</p>
                  <p className="text-gray-700">🏢 {agent.experience} Experience</p>
                  <p className="text-gray-700">🏠 {agent.properties} Properties Sold</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <h2 className="text-2xl font-semibold mb-4">About {agent.name.split(' ')[0]}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{agent.description}</p>
              
              <h3 className="text-xl font-semibold mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {agent.specialties.map((specialty, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Contact Agent
                </button>
                <button className="border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Listed Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agentProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">{property.location}</p>
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  ${property.price.toLocaleString()}
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