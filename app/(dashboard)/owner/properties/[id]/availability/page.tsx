"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function PropertyAvailabilityPage() {
  const params = useParams()
  const propertyId = params.id as string

  const [selectedDates, setSelectedDates] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  })
  const [customPrice, setCustomPrice] = useState('')
  const [blockReason, setBlockReason] = useState('')

  // Mock property data
  const property = {
    id: propertyId,
    title: 'Beachfront Villa Malibu',
    basePrice: 400,
    type: 'Villa'
  }

  // Mock availability data
  const availabilityData = {
    bookedDates: [
      { start: '2024-02-01', end: '2024-02-05', guest: 'John Smith', status: 'Confirmed' },
      { start: '2024-02-20', end: '2024-02-25', guest: 'Emily Wilson', status: 'Confirmed' },
      { start: '2024-03-10', end: '2024-03-15', guest: 'Mike Davis', status: 'Pending' }
    ],
    blockedDates: [
      { start: '2024-02-15', end: '2024-02-18', reason: 'Maintenance' }
    ],
    customPricing: [
      { date: '2024-02-14', price: 500, reason: 'Valentine\'s Day' },
      { date: '2024-03-17', price: 450, reason: 'St. Patrick\'s Day' }
    ]
  }

  const isDateBooked = (date: string) => {
    return availabilityData.bookedDates.some(booking => 
      date >= booking.start && date <= booking.end
    )
  }

  const isDateBlocked = (date: string) => {
    return availabilityData.blockedDates.some(block => 
      date >= block.start && date <= block.end
    )
  }

  const getCustomPrice = (date: string) => {
    const custom = availabilityData.customPricing.find(p => p.date === date)
    return custom ? custom.price : null
  }

  const handleDateSelection = (startDate: string, endDate: string) => {
    setSelectedDates({ start: startDate, end: endDate })
  }

  const handleUpdateAvailability = (action: 'available' | 'block' | 'price') => {
    if (!selectedDates.start || !selectedDates.end) {
      alert('Please select a date range')
      return
    }

    const data = {
      propertyId,
      startDate: selectedDates.start,
      endDate: selectedDates.end,
      action,
      customPrice: action === 'price' ? customPrice : undefined,
      reason: action === 'block' ? blockReason : undefined
    }

    console.log('Update availability:', data)
    // Handle API call to update availability
  }

  // Generate calendar days for February 2024
  const daysInMonth = 29
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return {
      date: `2024-02-${day.toString().padStart(2, '0')}`,
      day,
      isBooked: isDateBooked(`2024-02-${day.toString().padStart(2, '0')}`),
      isBlocked: isDateBlocked(`2024-02-${day.toString().padStart(2, '0')}`),
      customPrice: getCustomPrice(`2024-02-${day.toString().padStart(2, '0')}`)
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
          <p className="text-gray-600 mt-2">
            Control booking availability for <span className="font-semibold">{property.title}</span>
          </p>
        </div>
        <div className="flex space-x-3">
          <a 
            href={`/owner/properties/${propertyId}`}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Property
          </a>
          <a 
            href={`/owner/properties/${propertyId}/bookings`}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Bookings
          </a>
        </div>
      </div>

      {/* Property Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{property.title}</h2>
            <p className="text-gray-600">{property.type} • Base Price: ${property.basePrice}/night</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Month</p>
            <p className="text-2xl font-bold text-gray-900">February 2024</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">February 2024</h2>
          
          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, day, isBooked, isBlocked, customPrice }) => (
              <div
                key={date}
                className={`min-h-20 border rounded-lg p-2 cursor-pointer transition-colors ${
                  isBooked 
                    ? 'bg-red-100 border-red-300' 
                    : isBlocked 
                    ? 'bg-yellow-100 border-yellow-300'
                    : selectedDates.start <= date && date <= selectedDates.end
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
                    handleDateSelection(date, date)
                  } else if (selectedDates.start && !selectedDates.end) {
                    handleDateSelection(selectedDates.start, date)
                  }
                }}
              >
                <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                {isBooked && (
                  <div className="text-xs text-red-600 bg-red-200 px-1 rounded">Booked</div>
                )}
                {isBlocked && (
                  <div className="text-xs text-yellow-600 bg-yellow-200 px-1 rounded">Blocked</div>
                )}
                {customPrice && (
                  <div className="text-xs text-green-600 bg-green-200 px-1 rounded">${customPrice}</div>
                )}
                {!isBooked && !isBlocked && !customPrice && (
                  <div className="text-xs text-gray-500">${property.basePrice}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Availability Controls */}
        <div className="space-y-6">
          {/* Selected Dates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Dates</h3>
            {selectedDates.start && selectedDates.end ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">{selectedDates.start}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{selectedDates.end}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a date range on the calendar</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleUpdateAvailability('available')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark as Available
              </button>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Block reason (optional)"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleUpdateAvailability('block')}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Block Dates
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Custom price"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleUpdateAvailability('price')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Set Custom Price
                </button>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-sm text-gray-600">Booked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span className="text-sm text-gray-600">Blocked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span className="text-sm text-gray-600">Selected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-sm text-gray-600">Custom Price</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Bookings</h2>
        <div className="space-y-3">
          {availabilityData.bookedDates.map((booking, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{booking.guest}</p>
                <p className="text-sm text-gray-600">
                  {booking.start} to {booking.end}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
                <button className="text-blue-600 hover:text-blue-900 text-sm">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
            Export Calendar
          </button>
          <button className="border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
            Sync with Google Calendar
          </button>
          <button className="border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
            Set Seasonal Pricing
          </button>
        </div>
      </div>
    </div>
  )
}