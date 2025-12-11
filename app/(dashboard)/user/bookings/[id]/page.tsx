'use client'

import { useParams } from 'next/navigation'
import { 
  Calendar, 
  MapPin, 
  Star, 
  User, 
  CreditCard, 
  MessageSquare,
  Phone,
  Mail
} from 'lucide-react'

export default function BookingDetails() {
  const params = useParams()
  const bookingId = params.id

  // Mock data - in real app, fetch based on bookingId
  const booking = {
    id: bookingId,
    property: {
      title: 'Beachfront Villa Malibu',
      location: 'Malibu, CA',
      image: '/villa-1.jpg',
      rating: 4.8,
      reviews: 124,
      type: 'Villa',
      amenities: ['Pool', 'Ocean View', 'WiFi', 'Parking', 'Kitchen', 'AC'],
      host: {
        name: 'Sarah Johnson',
        phone: '+1 (555) 123-4567',
        email: 'sarah@example.com',
        joined: '2020',
        rating: 4.9
      }
    },
    checkIn: '2024-02-15',
    checkOut: '2024-02-20',
    guests: 4,
    total: 2000,
    status: 'confirmed',
    bookingDate: '2024-01-10',
    paymentMethod: 'Credit Card ending in 4242',
    breakdown: {
      baseRate: 1600,
      cleaningFee: 100,
      serviceFee: 200,
      taxes: 100
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateNights = () => {
    const checkIn = new Date(booking.checkIn)
    const checkOut = new Date(booking.checkOut)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 mt-2">Booking #{booking.id}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full ${
              booking.status === 'confirmed' 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <span className="text-sm font-medium capitalize">{booking.status}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Booked on {formatDate(booking.bookingDate)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Property Details</h2>
            <div className="flex items-start space-x-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex-shrink-0"></div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{booking.property.title}</h3>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {booking.property.location}
                </div>
                <div className="flex items-center mt-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{booking.property.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({booking.property.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {booking.property.amenities.map((amenity, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Dates</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Check-in: {formatDate(booking.checkIn)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Check-out: {formatDate(booking.checkOut)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {calculateNights()} nights
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Guests</h4>
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">${booking.breakdown.baseRate / calculateNights()} × {calculateNights()} nights</span>
                <span className="text-gray-900">${booking.breakdown.baseRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cleaning fee</span>
                <span className="text-gray-900">${booking.breakdown.cleaningFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee</span>
                <span className="text-gray-900">${booking.breakdown.serviceFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes</span>
                <span className="text-gray-900">${booking.breakdown.taxes}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${booking.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Host Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Host Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{booking.property.host.name}</p>
                    <p className="text-sm text-gray-600">Joined {booking.property.host.joined}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                  <span>{booking.property.host.rating}</span>
                </div>
              </div>
              
              <div className="space-y-2 pt-3 border-t">
                <button className="w-full flex items-center justify-center space-x-2 border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Host</span>
                </button>
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-1 border border-gray-300 rounded-lg py-2 px-2 hover:bg-gray-50 transition-colors text-sm">
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-1 border border-gray-300 rounded-lg py-2 px-2 hover:bg-gray-50 transition-colors text-sm">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <CreditCard className="w-4 h-4 mr-2" />
                <span className="text-sm">{booking.paymentMethod}</span>
              </div>
              <div className="text-sm text-gray-500">
                Paid on {formatDate(booking.bookingDate)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Modify Booking
              </button>
              <button className="w-full border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors font-medium">
                Cancel Booking
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Get Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}