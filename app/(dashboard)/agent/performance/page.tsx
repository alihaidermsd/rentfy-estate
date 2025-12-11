export default function AgentPerformancePage() {
  const performanceData = {
    overview: {
      totalSales: 24,
      totalRevenue: '$2,450,000',
      averageCommission: '$45,800',
      conversionRate: '32%'
    },
    monthlyStats: [
      { month: 'Jan', sales: 4, revenue: '$420,000', leads: 28, conversions: 12 },
      { month: 'Feb', sales: 3, revenue: '$315,000', leads: 22, conversions: 9 },
      { month: 'Mar', sales: 5, revenue: '$525,000', leads: 35, conversions: 15 },
      { month: 'Apr', sales: 2, revenue: '$210,000', leads: 18, conversions: 6 },
      { month: 'May', sales: 6, revenue: '$630,000', leads: 42, conversions: 18 },
      { month: 'Jun', sales: 4, revenue: '$350,000', leads: 30, conversions: 12 }
    ],
    topProperties: [
      { name: 'Luxury Villa Beverly Hills', sales: 3, revenue: '$450,000' },
      { name: 'Modern Downtown Apartment', sales: 2, revenue: '$280,000' },
      { name: 'Beachfront Condo Malibu', sales: 2, revenue: '$260,000' },
      { name: 'Suburban Family Home', sales: 1, revenue: '$180,000' }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
            <p className="text-gray-600 mt-2">Track your sales performance and growth metrics</p>
          </div>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 6 Months</option>
              <option>Last 3 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{performanceData.overview.totalSales}</div>
          <div className="text-sm text-gray-600">Total Sales</div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +12% from last period
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{performanceData.overview.totalRevenue}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +18% from last period
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{performanceData.overview.averageCommission}</div>
          <div className="text-sm text-gray-600">Avg Commission</div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +8% from last period
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{performanceData.overview.conversionRate}</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +5% from last period
          </div>
        </div>
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance</h2>
          <div className="space-y-4">
            {performanceData.monthlyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-gray-900">{stat.month}</div>
                  <div className="text-sm text-gray-600">{stat.sales} sales</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{stat.revenue}</div>
                  <div className="text-xs text-gray-500">{stat.leads} leads, {stat.conversions} conversions</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Properties */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Properties</h2>
          <div className="space-y-4">
            {performanceData.topProperties.map((property, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{property.name}</div>
                  <div className="text-xs text-gray-500">{property.sales} sales</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{property.revenue}</div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {[
              { source: 'Website', count: 45, percentage: '42%' },
              { source: 'Referrals', count: 28, percentage: '26%' },
              { source: 'Open Houses', count: 18, percentage: '17%' },
              { source: 'Social Media', count: 15, percentage: '14%' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.source}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: item.percentage }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Satisfaction</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">4.8</div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-600">Based on 24 reviews</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals Progress</h3>
          <div className="space-y-4">
            {[
              { goal: 'Quarterly Sales Target', progress: '75%', target: '$750K / $1M' },
              { goal: 'New Clients', progress: '60%', target: '18 / 30' },
              { goal: 'Property Listings', progress: '90%', target: '18 / 20' },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.goal}</span>
                  <span className="text-gray-900">{item.progress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: item.progress }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{item.target}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}