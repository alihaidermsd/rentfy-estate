'use client'

import { useState } from 'react'
import { Heart, MapPin, Star, Trash2, Calendar } from 'lucide-react'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([
    {
      id: '1',
      title: 'Beachfront Villa Malibu',
      type: 'Villa',
      location: 'Malibu, CA',
      price: '$400/night',
      rating: 4.8,
      reviews: 124,
      amenities: ['Pool', 'Ocean View', 'WiFi', 'Parking'],
      image: '/villa-1.jpg',
      addedDate: '2024-01-15',
      available: true
    },
    {
      id: '2',
      title: 'Luxury Downtown Apartment',
      type: 'Apartment',
      location: 'San Francisco, CA',
      price: '$250/night',
      rating: 4.6,
      reviews: 89,
      amenities: ['City View', 'Gym', 'WiFi', 'Parking'],
      image: '/apartment-1.jpg',
      addedDate: '2024-01-10',
      available: true
    },
    {
      id: '3',
      title: 'Mountain Cabin Retreat',
      type: 'Cabin',
      location: 'Lake Tahoe, CA',
      price: '$180/night',
      rating: 4.9,
      reviews: 67,
      amenities: ['Mountain View', 'Fireplace', 'WiFi', 'Hot Tub'],
      image: '/cabin-1.jpg',
      addedDate: '2024-01-05',
      available: false
    }
  ])

  const removeFromFavorites = (propertyId: string) => {
    setFavorites(favorites.filter(fav => fav.id !== propertyId))
  }

  const [filters, setFilters] = useState({
    type: 'all',
    sort: 'date',
    search: ''
  })

  const filteredFavorites = favorites.filter(property => {
    const matchesType = filters.type === 'all' || property.type.toLowerCase() === filters.type
    const matchesSearch = property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         property.location.toLowerCase().includes(filters.search.toLowerCase())
    return matchesType && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Favorite Properties</h1>
          <p className="text-gray-600 mt-2">Your saved properties for future trips</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Favorites</p>
          <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="cabin">Cabin</option>
          </select>
          <select 
            value={filters.sort}
            onChange={(e) => setFilters({...filters, sort: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date Added</option>
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
          </select>
          <input
            type="text"
            placeholder="Search favorites..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFavorites.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Property Image */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
              {!property.available && (
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                  Not Available
                </div>
              )}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => removeFromFavorites(property.id)}
                  className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{property.title}</h3>
                <span className="text-sm text-gray-500">{property.addedDate}</span>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {property.location}
              </div>
              
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                  <span className="text-sm font-medium text-gray-700">{property.rating}</span>
                  <span className="text-sm text-gray-500 ml-1">({property.reviews})</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-900">{property.price}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {property.type}
                </span>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1 mb-4">
                {property.amenities.slice(0, 3).map((amenity, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  disabled={!property.available}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    property.available 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {property.available ? 'Book Now' : 'Not Available'}
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFavorites.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites found</h3>
          <p className="text-gray-500 mb-4">
            {filters.search || filters.type !== 'all' 
              ? 'Try adjusting your filters to see more results.' 
              : 'Start exploring properties and add them to your favorites!'
            }
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Browse Properties
          </button>
        </div>
      )}
    </div>
  )
}