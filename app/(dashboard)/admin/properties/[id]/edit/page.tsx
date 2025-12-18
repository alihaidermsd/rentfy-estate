'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

interface PropertyFormData {
  title: string;
  description: string;
  type: 'HOUSE' | 'APARTMENT' | 'VILLA' | 'CONDO';
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'SOLD';
  verification: 'PENDING' | 'VERIFIED' | 'REJECTED';
  ownerId: string;
  featured: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'AGENT' | 'ADMIN';
}

export default function EditProperty() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isNew, setIsNew] = useState(propertyId === 'new');
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    type: 'HOUSE',
    price: 0,
    location: '',
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    amenities: [],
    status: 'AVAILABLE',
    verification: 'PENDING',
    ownerId: '',
    featured: false,
  });

  useEffect(() => {
    fetchUsers();
    if (!isNew) {
      fetchProperty();
    }
  }, [isNew, propertyId]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}`);
      const data = await response.json();
      if (data.success) {
        const property = data.data;
        setFormData({
          title: property.title,
          description: property.description,
          type: property.type,
          price: property.price,
          location: property.location,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          amenities: property.amenities || [],
          status: property.status,
          verification: property.verification,
          ownerId: property.ownerId,
          featured: property.featured,
        });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to fetch property data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ownerId) {
      toast.error('Please select an owner');
      return;
    }

    setLoading(true);
    try {
      const url = isNew ? '/api/admin/properties' : `/api/admin/properties/${propertyId}`;
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
        toast.success(isNew ? 'Property created successfully' : 'Property updated successfully');
        router.push('/dashboard/admin/properties');
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
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

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  const commonAmenities = [
    'WiFi', 'Pool', 'Gym', 'Parking', 'Air Conditioning',
    'Heating', 'Kitchen', 'Washer', 'Dryer', 'TV',
    'Elevator', 'Wheelchair Access', 'Pet Friendly', 'Balcony'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Create New Property' : 'Edit Property'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isNew ? 'Add a new property to the platform' : 'Update property information'}
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
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="HOUSE">House</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                    <option value="CONDO">Condo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner *
                  </label>
                  <select
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleChange}
                    required
                    disabled={loadingUsers}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Owner</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Property Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (sq ft) *
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <div className="flex items-center h-full">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Featured Property
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {commonAmenities.map(amenity => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status and Verification */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Verification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RENTED">Rented</option>
                    <option value="MAINTENANCE">Under Maintenance</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status *
                  </label>
                  <select
                    name="verification"
                    value={formData.verification}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
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
                  {isNew ? 'Create Property' : 'Update Property'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Additional Actions for existing property */}
      {!isNew && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Permanently delete this property and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                  try {
                    const response = await fetch(`/api/admin/properties/${propertyId}`, {
                      method: 'DELETE',
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      toast.success('Property deleted successfully');
                      router.push('/dashboard/admin/properties');
                    } else {
                      toast.error(data.message || 'Failed to delete property');
                    }
                  } catch (error) {
                    console.error('Error deleting property:', error);
                    toast.error('Failed to delete property');
                  }
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Property
            </button>
          </div>
        </div>
      )}
    </div>
  );
}