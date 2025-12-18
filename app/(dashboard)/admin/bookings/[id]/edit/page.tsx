'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

interface BookingFormData {
  propertyId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  notes?: string;
}

interface Property {
  id: string;
  title: string;
  price: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function EditBooking() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isNew, setIsNew] = useState(bookingId === 'new');
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<BookingFormData>({
    propertyId: '',
    userId: '',
    checkIn: '',
    checkOut: '',
    totalAmount: 0,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    notes: '',
  });

  useEffect(() => {
    fetchPropertiesAndUsers();
    if (!isNew) {
      fetchBooking();
    }
  }, [isNew, bookingId]);

  const fetchPropertiesAndUsers = async () => {
    try {
      setLoadingData(true);
      
      // Fetch properties
      const propertiesResponse = await fetch('/api/admin/properties');
      const propertiesData = await propertiesResponse.json();
      
      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();

      if (propertiesData.success) {
        setProperties(propertiesData.data);
      }
      
      if (usersData.success) {
        setUsers(usersData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      const data = await response.json();
      if (data.success) {
        const booking = data.data;
        setFormData({
          propertyId: booking.propertyId,
          userId: booking.userId,
          checkIn: new Date(booking.checkIn).toISOString().split('T')[0],
          checkOut: new Date(booking.checkOut).toISOString().split('T')[0],
          totalAmount: booking.totalAmount,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          notes: booking.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to fetch booking data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.propertyId || !formData.userId) {
      toast.error('Please select both property and user');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    try {
      const url = isNew ? '/api/admin/bookings' : `/api/admin/bookings/${bookingId}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(isNew ? 'Booking created successfully' : 'Booking updated successfully');
        router.push('/dashboard/admin/bookings');
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      toast.error('Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    const selectedProperty = properties.find(p => p.id === formData.propertyId);
    if (selectedProperty) {
      const nights = calculateNights();
      return selectedProperty.price * nights;
    }
    return 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Create New Booking' : 'Edit Booking'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isNew ? 'Create a new booking for a user' : 'Update booking information'}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Property and User Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property *
                </label>
                <select
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Property</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {formatCurrency(property.price)}/night
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User *
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  required
                  min={formData.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Price Calculation */}
            {formData.propertyId && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Calculation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nightly Rate</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(properties.find(p => p.id === formData.propertyId)?.price || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Number of Nights</p>
                    <p className="text-lg font-semibold text-gray-900">{calculateNights()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calculateTotal())}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount (USD) *
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status and Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status *
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="REFUNDED">Refunded</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any special instructions or notes..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isNew ? 'Create Booking' : 'Update Booking'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Additional Actions for existing booking */}
      {!isNew && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Permanently delete this booking. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
                  try {
                    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
                      method: 'DELETE',
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      toast.success('Booking deleted successfully');
                      router.push('/dashboard/admin/bookings');
                    } else {
                      toast.error(data.message || 'Failed to delete booking');
                    }
                  } catch (error) {
                    console.error('Error deleting booking:', error);
                    toast.error('Failed to delete booking');
                  }
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}