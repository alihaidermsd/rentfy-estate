interface DeveloperPageProps {
  params: {
    id: string
  }
}

export default function DeveloperProfilePage({ params }: DeveloperPageProps) {
  const developer = {
    id: params.id,
    name: "Elite Developers",
    description: "Leading luxury property developer with over 20 years of experience in creating exceptional residential and commercial spaces.",
    established: 2000,
    projects: 25,
    focus: "Luxury Residential & Commercial",
    contact: {
      email: "contact@elitedevelopers.com",
      phone: "(555) 123-4567",
      website: "www.elitedevelopers.com"
    }
  };

  const currentProjects = [
    { id: 1, name: "Marina Bay Residences", location: "Miami, FL", status: "Under Construction" },
    { id: 2, name: "Skyline Towers", location: "New York, NY", status: "Planning" },
    { id: 3, name: "Ocean View Villas", location: "Los Angeles, CA", status: "Completed" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{developer.name}</h1>
              <p className="text-gray-600 text-lg mb-6">{developer.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{developer.projects}+</div>
                  <div className="text-gray-600">Projects Completed</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{developer.established}</div>
                  <div className="text-gray-600">Established</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{developer.focus}</div>
                  <div className="text-gray-600">Specialization</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Current Projects</h2>
            <div className="space-y-4">
              {currentProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{project.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'Under Construction' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{project.location}</p>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold">
                    View Project Details →
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-xl font-semibold mb-4">Contact Developer</h3>
              <div className="space-y-3 text-sm">
                <p className="flex items-center">
                  <span className="w-4 mr-2">📧</span>
                  {developer.contact.email}
                </p>
                <p className="flex items-center">
                  <span className="w-4 mr-2">📞</span>
                  {developer.contact.phone}
                </p>
                <p className="flex items-center">
                  <span className="w-4 mr-2">🌐</span>
                  {developer.contact.website}
                </p>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Contact Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}