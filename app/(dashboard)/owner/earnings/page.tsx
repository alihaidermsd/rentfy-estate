export default function OwnerEarningsPage() {
  const earningsData = {
    overview: {
      totalEarnings: '$24,560',
      thisMonth: '$8,240',
      lastMonth: '$6,750',
      pendingPayout: '$2,150'
    },
    monthlyEarnings: [
      { month: 'Jan 2024', earnings: '$7,200', bookings: 12, averageRate: '$600' },
      { month: 'Dec 2023', earnings: '$6,750', bookings: 11, averageRate: '$614' },
      { month: 'Nov 2023', earnings: '$5,800', bookings: 10, averageRate: '$580' },
      { month: 'Oct 2023', earnings: '$4,810', bookings: 8, averageRate: '$601' }
    ],
    propertyEarnings: [
      { property: 'Beachfront Villa Malibu', earnings: '$12,400', bookings: 20, occupancy: '85%' },
      { property: 'Modern Downtown Apartment', earnings: '$6,800', bookings: 16, occupancy: '72%' },
      { property: 'Mountain Cabin Retreat', earnings: '$5,360', bookings: 12, occupancy: '65%' }
    ],
    recentPayouts: [
      { id: 'P001', date: '2024-01-31', amount: '$6,750', method: 'Bank Transfer', status: 'Completed' },
      { id: 'P002', date: '2023-12-31', amount: '$5,800', method: 'Bank Transfer', status: 'Completed' },
      { id: 'P003', date: '2023-11-30', amount: '$4,810', method: 'Bank Transfer', status: 'Completed' }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Payments</h1>
          <p className="text-gray-600 mt-2">Track your earnings and payment history</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Export Report
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Request Payout
          </button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{earningsData.overview.totalEarnings}</div>
          <div className="text-sm text-gray-600">Total Earnings</div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            All time
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{earningsData.overview.thisMonth}</div>
          <div className="text-sm text-gray-600">This Month</div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +22% from last month
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{earningsData.overview.lastMonth}</div>
          <div className="text-sm text-gray-600">Last Month</div>
          <div className="flex items-center text-sm text-gray-600 mt-2">
            December 2023
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-orange-600">{earningsData.overview.pendingPayout}</div>
          <div className="text-sm text-gray-600">Pending Payout</div>
          <div className="flex items-center text-sm text-orange-600 mt-2">
            Available next payout
          </div>
        </div>
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Earnings</h2>
          <div className="space-y-4">
            {earningsData.monthlyEarnings.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 text-sm font-medium text-gray-900">{month.month}</div>
                  <div className="text-sm text-gray-600">{month.bookings} bookings</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{month.earnings}</div>
                  <div className="text-xs text-gray-500">Avg: {month.averageRate}/booking</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property-wise Earnings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Earnings by Property</h2>
          <div className="space-y-4">
            {earningsData.propertyEarnings.map((property, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{property.property}</div>
                  <div className="text-xs text-gray-500">{property.bookings} bookings • {property.occupancy} occupancy</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{property.earnings}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Payout History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earningsData.recentPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payout.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payout.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payout.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payout.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Payout Method</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                    <p className="text-xs text-gray-500">**** 1234</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Payout Schedule</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frequency</span>
                <span className="text-gray-900">Monthly</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Payout</span>
                <span className="text-gray-900">Feb 29, 2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Minimum Payout</span>
                <span className="text-gray-900">$100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}