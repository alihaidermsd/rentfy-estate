'use client'

import { useState } from 'react'
import { MessageSquare, Clock, CheckCircle, XCircle, MapPin, Star } from 'lucide-react'

interface PropertyInfo {
  title: string
  location: string
  image: string
  price: string
  rating: number
}

interface Inquiry {
  id: string
  property: PropertyInfo
  message: string
  sentDate: string
  status: 'pending' | 'responded' | 'closed'
  response?: string // Make response optional
  responseDate?: string // Make responseDate optional
}

export default function InquiriesPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'responded' | 'closed'>('active')

  const inquiries: {
    active: Inquiry[]
    responded: Inquiry[]
    closed: Inquiry[]
  } = {
    active: [
      {
        id: '1',
        property: {
          title: 'Modern City Loft',
          location: 'New York, NY',
          image: '/loft-1.jpg',
          price: '$300/night',
          rating: 4.7
        },
        message: 'Hi, I would like to know if this property is available for the dates of March 15-20, 2024? Also, is there parking available?',
        sentDate: '2024-01-18',
        status: 'pending'
      },
      {
        id: '2',
        property: {
          title: 'Beachfront Villa Malibu',
          location: 'Malibu, CA',
          image: '/villa-1.jpg',
          price: '$400/night',
          rating: 4.8
        },
        message: 'Interested in booking for a family vacation. Could you provide more details about the amenities and nearby attractions?',
        sentDate: '2024-01-17',
        status: 'pending'
      }
    ],
    responded: [
      {
        id: '3',
        property: {
          title: 'Mountain Cabin Retreat',
          location: 'Lake Tahoe, CA',
          image: '/cabin-1.jpg',
          price: '$180/night',
          rating: 4.9
        },
        message: 'Is the hot tub available year-round? Looking to book for a winter getaway.',
        sentDate: '2024-01-15',
        response: 'Yes, the hot tub is available year-round and maintained at perfect temperature even in winter!',
        responseDate: '2024-01-16',
        status: 'responded'
      }
    ],
    closed: []
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'responded':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Awaiting Response'
      case 'responded':
        return 'Responded'
      case 'closed':
        return 'Closed'
      default:
        return 'Pending'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'responded':
        return 'text-green-600 bg-green-50'
      case 'closed':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Inquiries</h1>
          <p className="text-gray-600 mt-2">Manage your property inquiries and messages</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Active Inquiries</p>
          <p className="text-2xl font-bold text-gray-900">{inquiries.active.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { key: 'active', label: 'Active', count: inquiries.active.length },
              { key: 'responded', label: 'Responded', count: inquiries.responded.length },
              { key: 'closed', label: 'Closed', count: inquiries.closed.length }
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

        {/* Inquiries List */}
        <div className="p-6">
          {inquiries[activeTab].length > 0 ? (
            <div className="space-y-6">
              {inquiries[activeTab].map((inquiry) => (
                <div key={inquiry.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      {/* Property Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex-shrink-0"></div>
                      
                      {/* Property Details */}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{inquiry.property.title}</h3>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {inquiry.property.location}
                        </div>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{inquiry.property.rating}</span>
                          <span className="text-sm text-gray-500 ml-2">{inquiry.property.price}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className={`flex items-center px-3 py-1 rounded-full ${getStatusColor(inquiry.status)}`}>
                      {getStatusIcon(inquiry.status)}
                      <span className="ml-1 text-sm font-medium">{getStatusText(inquiry.status)}</span>
                    </div>
                  </div>

                  {/* Inquiry Message */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Your Inquiry</span>
                      <span className="text-sm text-gray-500">
                        Sent on {new Date(inquiry.sentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{inquiry.message}</p>
                  </div>

                  {/* Response (if available) */}
                  {inquiry.response && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Host Response</span>
                        <span className="text-sm text-blue-700">
                          Responded on {new Date(inquiry.responseDate!).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-blue-800">{inquiry.response}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4" />
                      <span>Last updated {new Date(inquiry.sentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Send Follow-up
                      </button>
                      {inquiry.status === 'pending' && (
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                          Cancel Inquiry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} inquiries</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'active' 
                  ? "You don't have any active inquiries at the moment."
                  : `You don't have any ${activeTab} inquiries.`
                }
              </p>
              {activeTab === 'active' && (
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