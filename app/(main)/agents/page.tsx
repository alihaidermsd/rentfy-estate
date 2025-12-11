export default function AgentsPage() {
  const agents = [
    {
      id: 1,
      name: "John Smith",
      title: "Senior Real Estate Agent",
      experience: "15+ Years",
      properties: 245,
      rating: 4.9
    },
    {
      id: 2,
      name: "Sarah Johnson",
      title: "Luxury Property Specialist",
      experience: "12+ Years",
      properties: 189,
      rating: 4.8
    },
    {
      id: 3,
      name: "Michael Brown",
      title: "Commercial Real Estate",
      experience: "18+ Years",
      properties: 312,
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Agents</h1>
          <p className="text-gray-600">Connect with our experienced real estate professionals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
              <p className="text-gray-600 mb-2">{agent.title}</p>
              <div className="flex justify-center items-center mb-4">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-gray-700">{agent.rating}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div className="font-semibold">{agent.experience}</div>
                  <div className="text-gray-600">Experience</div>
                </div>
                <div>
                  <div className="font-semibold">{agent.properties}</div>
                  <div className="text-gray-600">Properties</div>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                Contact Agent
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}