'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  startDate: string
  endDate: string
  totalDays: number
  totalAmount: number
  guests: number
  guestName: string
  guestEmail: string
  status: string
  paymentStatus: string
  property: {
    id: string
    title: string
    images: string[]
    address: string
    city: string
    state: string
    user: {
      name: string | null
      email: string
      phone: string | null
    }
  }
}

export default function BookingConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      const result = await response.json()

      if (result.success) {
        setBooking(result.data)
      } else {
        setError('Booking not found')
      }
    } catch (err) {
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = () => {
    router.push(`/booking/payment/${bookingId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Booking not found'}</p>
          <Link href="/properties" className="text-blue-600 hover:text-blue-500">
            Browse Properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your booking for <strong>{booking.property.title}</strong> has been received.
          </p>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Booking ID</p>
                <p className="text-gray-600">{booking.id}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Status</p>
                <p className="text-gray-600 capitalize">{booking.status.toLowerCase()}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Dates</p>
                <p className="text-gray-600">
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Duration</p>
                <p className="text-gray-600">{booking.totalDays} nights</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Guests</p>
                <p className="text-gray-600">{booking.guests}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Total Amount</p>
                <p className="text-gray-600">${booking.totalAmount}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="font-medium text-gray-700 mb-2">Property Address</p>
              <p className="text-gray-600">{booking.property.address}, {booking.property.city}, {booking.property.state}</p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="font-medium text-gray-700 mb-2">Host Contact</p>
              <p className="text-gray-600">Name: {booking.property.user.name || 'N/A'}</p>
              <p className="text-gray-600">Email: {booking.property.user.email}</p>
              {booking.property.user.phone && (
                <p className="text-gray-600">Phone: {booking.property.user.phone}</p>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
            <ul className="text-blue-800 space-y-2">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>The host will review your booking request</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Complete your payment to secure the booking</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {booking.paymentStatus !== 'PAID' && (
              <button
                onClick={handlePayment}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Proceed to Payment
              </button>
            )}
            
            <Link
              href={`/properties/${booking.property.id}`}
              className="bg-white text-gray-700 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Property
            </Link>
            
            <Link
              href="/bookings"
              className="bg-white text-gray-700 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              My Bookings
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Need help? Contact our support team at support@rentfy.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}