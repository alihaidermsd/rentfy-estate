'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Star,
  Download,
  RefreshCw,
  MoreVertical
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  type: string;
  price: number | null;
  rentPrice: number | null;
  category: string;
  status: string;
  verified: boolean;
  featured: boolean;
  isActive: boolean;
  city: string;
  state: string;
  country: string;
  user: {
    name: string;
    email: string;
  };
  agent: {
    user: {
      name: string;
    };
  } | null;
  createdAt: string;
  views: number;
  _count: {
    favorites: number;
    reviews: number;
    bookings: number;
  };
}

export default function PropertiesManagement() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch properties from your existing API
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties?limit=100&includeCounts=true');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setProperties(Array.isArray(data.data) ? data.data : []);
      } else if (data.properties) {
        setProperties(Array.isArray(data.properties) ? data.properties : []);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Update property status
  const updatePropertyStatus = async (propertyId: string, status: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Status updated to ${status}`);
        setProperties(properties.map(prop => 
          prop.id === propertyId ? { ...prop, status } : prop
        ));
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Toggle verified status
  const toggleVerified = async (propertyId: string, currentVerified: boolean) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: !currentVerified }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Property ${!currentVerified ? 'verified' : 'unverified'}`);
        setProperties(properties.map(prop => 
          prop.id === propertyId ? { ...prop, verified: !currentVerified } : prop
        ));
      } else {
        toast.error(data.error || 'Failed to update verification');
      }
    } catch (error) {
      console.error('Error toggling verified:', error);
      toast.error('Failed to update verification');
    }
  };

  // Toggle featured status
  const toggleFeatured = async (propertyId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Property ${!currentFeatured ? 'featured' : 'unfeatured'}`);
        setProperties(properties.map(prop => 
          prop.id === propertyId ? { ...prop, featured: !currentFeatured } : prop
        ));
      } else {
        toast.error(data.error || 'Failed to update featured status');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update featured status');
    }
  };

  // Delete property (soft delete)
  const deleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Property deleted');
        setProperties(properties.filter(prop => prop.id !== propertyId));
      } else {
        toast.error(data.error || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedProperties.length === 0) {
      toast.error('Please select properties and an action');
      return;
    }

    try {
      const promises = selectedProperties.map(propertyId => {
        let updateData = {};
        
        switch (bulkAction) {
          case 'verify':
            updateData = { verified: true };
            break;
          case 'unverify':
            updateData = { verified: false };
            break;
          case 'feature':
            updateData = { featured: true };
            break;
          case 'unfeature':
            updateData = { featured: false };
            break;
          case 'publish':
            updateData = { status: 'PUBLISHED' };
            break;
          case 'draft':
            updateData = { status: 'DRAFT' };
            break;
          case 'delete':
            return fetch(`/api/properties/${propertyId}`, { method: 'DELETE' });
        }

        if (bulkAction !== 'delete') {
          return fetch(`/api/properties/${propertyId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });
        }
      });

      await Promise.all(promises);
      toast.success(`Bulk action completed: ${bulkAction}`);
      fetchProperties(); // Refresh data
      setSelectedProperties([]);
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || property.category === categoryFilter;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'UNAVAILABLE': return 'bg-red-100 text-red-800';
      case 'SOLD': return 'bg-purple-100 text-purple-800';
      case 'RENTED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get property types from your schema
  const propertyTypes = [
    'APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 
    'OFFICE', 'RETAIL', 'INDUSTRIAL', 'LAND', 'OTHER'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties Management</h1>
            <p className="text-gray-600 mt-1">
              Manage {properties.length} properties on the platform
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchProperties}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <Link
              href="/dashboard/admin/properties/new/edit"
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <span className="mr-2">+</span>
              Add Property
            </Link>
          </div>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="UNAVAILABLE">Unavailable</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProperties.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <span className="text-blue-700 font-medium">
                {selectedProperties.length} properties selected
              </span>
            </div>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Bulk Actions</option>
              <option value="verify">Verify</option>
              <option value="unverify">Unverify</option>
              <option value="feature">Feature</option>
              <option value="unfeature">Unfeature</option>
              <option value="publish">Publish</option>
              <option value="draft">Move to Draft</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedProperties([])}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedProperties.length === filteredProperties.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProperties(filteredProperties.map(p => p.id));
                      } else {
                        setSelectedProperties([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner/Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedProperties.includes(property.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProperties([...selectedProperties, property.id]);
                        } else {
                          setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">
                          {property.type} • {property.category}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {property.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{property.user?.name}</div>
                      <div className="text-sm text-gray-500">{property.user?.email}</div>
                      {property.agent && (
                        <div className="text-xs text-blue-600">
                          Agent: {property.agent.user?.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{property.city}, {property.state}</div>
                      <div className="text-sm text-gray-500">{property.country}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">
                      {property.price ? formatCurrency(property.price) : 
                       property.rentPrice ? formatCurrency(property.rentPrice) + '/mo' : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={property.status}
                      onChange={(e) => updatePropertyStatus(property.id, e.target.value)}
                      className={`text-sm border rounded px-2 py-1 ${getStatusColor(property.status)}`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="UNAVAILABLE">Unavailable</option>
                      <option value="SOLD">Sold</option>
                      <option value="RENTED">Rented</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleVerified(property.id, property.verified)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        property.verified
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {property.verified ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Unverified
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleFeatured(property.id, property.featured)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        property.featured
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-4 h-4 mr-1 ${property.featured ? 'fill-current' : ''}`} />
                      {property.featured ? 'Featured' : 'Standard'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/properties/${property.id}`)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/admin/properties/${property.id}/edit`)}
                        className="p-1 text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProperty(property.id)}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No properties found</div>
            <Link
              href="/dashboard/admin/properties/new"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              Add your first property
            </Link>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {properties.filter(p => p.status === 'PUBLISHED').length}
          </div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {properties.filter(p => p.verified).length}
          </div>
          <div className="text-sm text-gray-600">Verified</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {properties.filter(p => p.featured).length}
          </div>
          <div className="text-sm text-gray-600">Featured</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">
            {properties.filter(p => p.category === 'SALE').length}
          </div>
          <div className="text-sm text-gray-600">For Sale</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {properties.filter(p => p.category === 'RENT').length}
          </div>
          <div className="text-sm text-gray-600">For Rent</div>
        </div>
      </div>
    </div>
  );
}