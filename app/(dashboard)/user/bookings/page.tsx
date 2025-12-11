'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Star, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function UserBookings() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')

  const bookings = {
    upcoming: [
      {
        id: '1',
        property: {
          title: 'Beachfront Villa Malibu',
          location: 'Malibu, CA',
          image: '/villa-1.jpg',
          rating: 4.8,
          reviews: 124
        },
        checkIn: '2024-02-15',
        checkOut: '2024-02-20',
        guests: 4,
        total: 2000,
        status: 'confirmed'
      },
      {
        id: '2',
        property: {
          title: 'Mountain Cabin Retreat',
          location: 'Lake Tahoe, CA',
          image: '/cabin-1.jpg',
          rating: 4.9,
          reviews: 67
        },
        checkIn: '2024-03-10',
        checkOut: '2024-03-15',
        guests: 2,
        total: 900,
        status: 'confirmed'
      }
    ],
    completed: [
      {
        id: '3',
        property: {
          title: 'Luxury Downtown Apartment',
          location: 'San Francisco, CA',
          image: '/apartment-1.jpg',
          rating: 4.6,
          reviews: 89
        },
        checkIn: '2024-01-05',
        checkOut: '2024-01-10',
        guests: 2,
        total: 1250,
        status: 'completed'
      }
    ],
    cancelled: []
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Pending'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-blue-600 bg-blue-50'
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Manage your upcoming trips and view past bookings</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">
            {bookings.upcoming.length + bookings.completed.length + bookings.cancelled.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { key: 'upcoming', label: 'Upcoming', count: bookings.upcoming.length },
              { key: 'completed', label: 'Completed', count: bookings.completed.length },
              { key: 'cancelled', label: 'Cancelled', count: bookings.cancelled.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bookings List */}
        <div className="p-6">
          {bookings[activeTab].length > 0 ? (
            <div className="space-y-4">
              {bookings[activeTab].map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      {/* Property Image */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex-shrink-0"></div>
                      
                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{booking.property.title}</h3>
                            <div className="flex items-center text-gray-600 text-sm mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {booking.property.location}
                            </div>
                          </div>
                          <div className={`flex items-center px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 text-sm font-medium">{getStatusText(booking.status)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Check-in</span>
                            <p className="font-medium text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Check-out</span>
                            <p className="font-medium text-gray-900">{new Date(booking.checkOut).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Guests</span>
                            <p className="font-medium text-gray-900">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Total</span>
                            <p className="font-medium text-gray-900">${booking.total}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                            <span>{booking.property.rating}</span>
                            <span className="mx-1">•</span>
                            <span>{booking.property.reviews} reviews</span>
                          </div>
                          <Link 
                            href={`/dashboard/user/bookings/${booking.id}`}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} bookings</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming trips planned."
                  : `You don't have any ${activeTab} bookings.`
                }
              </p>
              {activeTab === 'upcoming' && (
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Browse Properties
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}