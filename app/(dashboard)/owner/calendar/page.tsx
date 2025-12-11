"use client"

import { useState } from 'react'

export default function OwnerCalendarPage() {
  const [selectedProperty, setSelectedProperty] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())

  const properties = [
    { id: '1', name: 'Beachfront Villa Malibu' },
    { id: '2', name: 'Modern Downtown Apartment' },
    { id: '3', name: 'Mountain Cabin Retreat' },
    { id: '4', name: 'City Center Luxury Loft' }
  ]

  const bookings = [
    {
      id: 'B001',
      propertyId: '1',
      guest: 'John Smith',
      checkIn: new Date('2024-02-01'),
      checkOut: new Date('2024-02-05'),
      status: 'Confirmed'
    },
    {
      id: 'B002',
      propertyId: '2',
      guest: 'Sarah Johnson',
      checkIn: new Date('2024-02-03'),
      checkOut: new Date('2024-02-07'),
      status: 'Confirmed'
    },
    {
      id: 'B003',
      propertyId: '3',
      guest: 'Mike Davis',
      checkIn: new Date('2024-02-10'),
      checkOut: new Date('2024-02-15'),
      status: 'Pending'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-500'
      case 'Pending': return 'bg-yellow-500'
      case 'Cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Generate calendar days for February 2024
  const daysInMonth = 29
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const isDateBooked = (day: number, propertyId: string) => {
    const date = new Date(2024, 1, day)
    return bookings.some(booking => 
      booking.propertyId === propertyId && 
      date >= booking.checkIn && 
      date < booking.checkOut
    )
  }

  const getBookingForDate = (day: number, propertyId: string) => {
    const date = new Date(2024, 1, day)
    return bookings.find(booking => 
      booking.propertyId === propertyId && 
      date >= booking.checkIn && 
      date < booking.checkOut
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Calendar</h1>
          <p className="text-gray-600 mt-2">Manage availability and view bookings across all properties</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Properties</option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>{property.name}</option>
            ))}
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Update Availability
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">February 2024</h2>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

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
          {calendarDays.map(day => {
            const displayProperties = selectedProperty === 'all' ? properties : properties.filter(p => p.id === selectedProperty)
            
            return (
              <div key={day} className="min-h-24 border border-gray-200 p-2">
                <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
                <div className="space-y-1">
                  {displayProperties.map(property => {
                    const booking = getBookingForDate(day, property.id)
                    if (booking) {
                      return (
                        <div 
                          key={property.id}
                          className={`text-xs text-white p-1 rounded ${getStatusColor(booking.status)}`}
                          title={`${property.name} - ${booking.guest}`}
                        >
                          {property.name.substring(0, 10)}...
                        </div>
                      )
                    }
                    return null
                  }).filter(Boolean)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Confirmed Booking</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Pending Booking</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Cancelled Booking</span>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Bookings</h2>
        <div className="space-y-3">
          {bookings.map(booking => {
            const property = properties.find(p => p.id === booking.propertyId)
            return (
              <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{property?.name}</p>
                  <p className="text-sm text-gray-600">{booking.guest}</p>
                  <p className="text-sm text-gray-500">
                    {booking.checkIn.toLocaleDateString()} - {booking.checkOut.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                  <button className="text-blue-600 hover:text-blue-900 text-sm">View Details</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}