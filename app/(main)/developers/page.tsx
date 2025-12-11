export default function DevelopersPage() {
  const developers = [
    {
      id: 1,
      name: "Elite Developers",
      description: "Specializing in luxury residential properties",
      projects: 25,
      established: 2000,
      focus: "Luxury Residential"
    },
    {
      id: 2,
      name: "Urban Builders",
      description: "Modern commercial and residential developments",
      projects: 42,
      established: 1995,
      focus: "Mixed-Use"
    },
    {
      id: 3,
      name: "Green Spaces",
      description: "Sustainable and eco-friendly developments",
      projects: 18,
      established: 2010,
      focus: "Sustainable"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Property Developers</h1>
          <p className="text-gray-600">Explore properties from leading developers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((developer) => (
            <div key={developer.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="w-20 h-20 bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">{developer.name}</h3>
              <p className="text-gray-600 mb-4">{developer.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Projects:</span>
                  <span className="font-semibold">{developer.projects}+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Established:</span>
                  <span className="font-semibold">{developer.established}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Focus:</span>
                  <span className="font-semibold">{developer.focus}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                View Projects
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}