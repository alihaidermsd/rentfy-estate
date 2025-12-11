'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Property {
  id: string
  title: string
  description: string
  type: string
  category: string
  price: number | null
  rentPrice: number | null
  images: string[]
  address: string
  city: string
  state: string
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  minStay: number | null
  maxStay: number | null
  instantBook: boolean
  user: {
    name: string | null
    email: string
    phone: string | null
  }
}

interface BookingData {
  startDate: string
  endDate: string
  guests: number
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests: string
  totalAmount: number
  totalDays: number
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string // Changed from params.propertyId to params.id

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [calculating, setCalculating] = useState(false)
  const [availability, setAvailability] = useState<any>(null)

  const [bookingData, setBookingData] = useState<BookingData>({
    startDate: '',
    endDate: '',
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
    totalAmount: 0,
    totalDays: 0
  })

  useEffect(() => {
    fetchProperty()
  }, [propertyId])

  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate) {
      checkAvailability()
      calculateTotal()
    }
  }, [bookingData.startDate, bookingData.endDate, bookingData.guests])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`)
      const result = await response.json()

      if (result.success) {
        setProperty(result.data)
      } else {
        setError('Property not found')
      }
    } catch (err) {
      setError('Failed to load property')
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async () => {
    setCalculating(true)
    try {
      const response = await fetch('/api/bookings/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate
        })
      })

      const result = await response.json()
      if (result.success) {
        setAvailability(result.data)
      } else {
        setError(result.error || 'Availability check failed')
      }
    } catch (err) {
      setError('Failed to check availability')
    } finally {
      setCalculating(false)
    }
  }

  const calculateTotal = () => {
    if (!property || !bookingData.startDate || !bookingData.endDate) return

    const start = new Date(bookingData.startDate)
    const end = new Date(bookingData.endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    const basePrice = property.rentPrice || property.price || 0
    const totalAmount = basePrice * totalDays

    setBookingData(prev => ({
      ...prev,
      totalDays,
      totalAmount
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!bookingData.startDate || !bookingData.endDate || !bookingData.guestName || !bookingData.guestEmail) {
      setError('Please fill in all required fields')
      return
    }

    if (availability && !availability.isAvailable) {
      setError('Property is not available for the selected dates')
      return
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          userId: 'current-user-id', // In real app, get from auth
          ...bookingData
        })
      })

      const result = await response.json()

      if (result.success) {
        router.push(`/booking/confirmation/${result.data.id}`)
      } else {
        setError(result.error || 'Booking failed')
      }
    } catch (err) {
      setError('Failed to create booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/properties" className="text-blue-600 hover:text-blue-500">
            Back to Properties
          </Link>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <Link href="/properties" className="text-blue-600 hover:text-blue-500">
            Browse Properties
          </Link>
        </div>
      </div>
    )
  }

  const basePrice = property.rentPrice || property.price || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={`/properties/${propertyId}`} className="text-blue-600 hover:text-blue-500">
            ← Back to Property
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Book {property.title}</h1>
          <p className="text-gray-600 mt-1">{property.address}, {property.city}, {property.state}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
            
            {property.images.length > 0 && (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{property.type} • {property.category}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              {property.bedrooms && <div>Bedrooms: {property.bedrooms}</div>}
              {property.bathrooms && <div>Bathrooms: {property.bathrooms}</div>}
              {property.area && <div>Area: {property.area} sq ft</div>}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Host Information</h4>
              <p className="text-sm text-gray-600">Name: {property.user.name || 'N/A'}</p>
              <p className="text-sm text-gray-600">Email: {property.user.email}</p>
              {property.user.phone && <p className="text-sm text-gray-600">Phone: {property.user.phone}</p>}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Information</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={bookingData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={bookingData.endDate}
                    onChange={handleInputChange}
                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Availability Check */}
              {calculating && (
                <div className="text-sm text-blue-600">Checking availability...</div>
              )}
              {availability && !calculating && (
                <div className={`text-sm ${availability.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {availability.message}
                </div>
              )}

              {/* Guest Information */}
              <div>
                <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests *
                </label>
                <select
                  id="guests"
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="guestName"
                  name="guestName"
                  value={bookingData.guestName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="guestEmail"
                  name="guestEmail"
                  value={bookingData.guestEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="guestPhone"
                  name="guestPhone"
                  value={bookingData.guestPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requirements or questions..."
                />
              </div>

              {/* Price Summary */}
              {bookingData.totalDays > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Price Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>${basePrice} × {bookingData.totalDays} nights</span>
                      <span>${basePrice * bookingData.totalDays}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${bookingData.totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!availability?.isAvailable || calculating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {calculating ? 'Checking...' : 'Book Now'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By booking, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}