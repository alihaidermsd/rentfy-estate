'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  User,
  Shield,
  Mail,
  Phone,
  Calendar,
  Download,
  RefreshCw,
  MoreVertical,
  Ban,
  CheckSquare,
  XSquare,
  UserPlus,
  UserCheck,
  UserX,
  Lock,
  Unlock
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  phone: string | null;
  emailVerified: boolean;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  profile: {
    bio: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    occupation: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    idVerified: boolean;
  } | null;
  agentProfile: {
    id: string;
    company: string | null;
    licenseNumber: string | null;
    verified: boolean;
    featured: boolean;
    totalListings: number;
    averageRating: number | null;
  } | null;
  developerProfile: {
    id: string;
    companyName: string;
    verified: boolean;
    featured: boolean;
    totalListings: number;
  } | null;
  _count: {
    ownedProperties: number;
    bookings: number;
    favorites: number;
    inquiries: number;
    reviews: number;
    messagesSent: number;
    messagesReceived: number;
  };
}

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from your existing API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users?limit=100');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data.success && data.data) {
        setUsers(Array.isArray(data.data) ? data.data : []);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else if (data.users) {
        setUsers(Array.isArray(data.users) ? data.users : []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Role updated to ${role}`);
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role } : user
        ));
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  // Toggle user active status
  const toggleUserActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ));
      } else {
        toast.error(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user active:', error);
      toast.error('Failed to update user status');
    }
  };

  // Toggle user verification
  const toggleUserVerification = async (userId: string, currentVerified: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVerified: !currentVerified }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`User ${!currentVerified ? 'verified' : 'unverified'}`);
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isVerified: !currentVerified } : user
        ));
      } else {
        toast.error(data.error || 'Failed to update verification');
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
      toast.error('Failed to update verification');
    }
  };

  // Verify agent
  const verifyAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/verify`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Agent verified successfully');
        fetchUsers(); // Refresh to get updated agent data
      } else {
        toast.error(data.error || 'Failed to verify agent');
      }
    } catch (error) {
      console.error('Error verifying agent:', error);
      toast.error('Failed to verify agent');
    }
  };

  // Verify developer
  const verifyDeveloper = async (developerId: string) => {
    try {
      const response = await fetch(`/api/developers/${developerId}/verify`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Developer verified successfully');
        fetchUsers(); // Refresh to get updated developer data
      } else {
        toast.error(data.error || 'Failed to verify developer');
      }
    } catch (error) {
      console.error('Error verifying developer:', error);
      toast.error('Failed to verify developer');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('User deleted successfully');
        setUsers(users.filter(user => user.id !== userId));
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      toast.error('Please select users and an action');
      return;
    }

    try {
      const promises = selectedUsers.map(userId => {
        let updateData = {};
        
        switch (bulkAction) {
          case 'activate':
            updateData = { isActive: true };
            break;
          case 'deactivate':
            updateData = { isActive: false };
            break;
          case 'verify':
            updateData = { isVerified: true };
            break;
          case 'make_admin':
            updateData = { role: 'admin' };
            break;
          case 'make_user':
            updateData = { role: 'user' };
            break;
          case 'make_agent':
            updateData = { role: 'agent' };
            break;
          case 'delete':
            return fetch(`/api/users/${userId}`, { method: 'DELETE' });
        }

        if (bulkAction !== 'delete') {
          return fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });
        }
      });

      await Promise.all(promises);
      toast.success(`Bulk action completed: ${bulkAction}`);
      fetchUsers(); // Refresh data
      setSelectedUsers([]);
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    const matchesVerification = verificationFilter === 'all' ||
      (verificationFilter === 'verified' && user.isVerified) ||
      (verificationFilter === 'unverified' && !user.isVerified);

    return matchesSearch && matchesRole && matchesStatus && matchesVerification;
  });

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'developer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Get verification color
  const getVerificationColor = (isVerified: boolean) => {
    return isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  // Get roles from your system
  const userRoles = ['user', 'admin', 'agent', 'developer'];

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
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">
              Manage {users.length} users on the platform
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchUsers}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              {userRoles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <span className="text-blue-700 font-medium">
                {selectedUsers.length} users selected
              </span>
            </div>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Bulk Actions</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="verify">Verify</option>
              <option value="make_admin">Make Admin</option>
              <option value="make_user">Make User</option>
              <option value="make_agent">Make Agent</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedUsers.length === filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.image ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.image}
                            alt={user.name || 'User'}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {user.name || 'No Name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.substring(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Joined {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                      {user.profile?.city && (
                        <div className="text-xs text-gray-500">
                          {user.profile.city}, {user.profile.country}
                        </div>
                      )}
                      <div className="text-xs">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Email Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-yellow-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Email Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className={`text-sm border rounded px-2 py-1 ${getRoleColor(user.role)}`}
                      >
                        {userRoles.map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => toggleUserActive(user.id, user.isActive)}
                          className={`inline-flex items-center px-2 py-1 rounded text-xs ${getStatusColor(user.isActive)}`}
                        >
                          {user.isActive ? (
                            <>
                              <CheckSquare className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XSquare className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleUserVerification(user.id, user.isVerified)}
                          className={`inline-flex items-center px-2 py-1 rounded text-xs ${getVerificationColor(user.isVerified)}`}
                        >
                          {user.isVerified ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Unverified
                            </>
                          )}
                        </button>
                      </div>
                      {user.agentProfile && (
                        <div className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600">Agent Profile</span>
                            {!user.agentProfile.verified && (
                              <button
                                onClick={() => verifyAgent(user.agentProfile!.id)}
                                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                              >
                                Verify Agent
                              </button>
                            )}
                          </div>
                          <div className="text-gray-500">
                            {user.agentProfile.company || 'No company'} • 
                            Listings: {user.agentProfile.totalListings}
                          </div>
                        </div>
                      )}
                      {user.developerProfile && (
                        <div className="text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-purple-600">Developer Profile</span>
                            {!user.developerProfile.verified && (
                              <button
                                onClick={() => verifyDeveloper(user.developerProfile!.id)}
                                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                              >
                                Verify Developer
                              </button>
                            )}
                          </div>
                          <div className="text-gray-500">
                            {user.developerProfile.companyName} • 
                            Listings: {user.developerProfile.totalListings}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">
                          {user._count.ownedProperties}
                        </div>
                        <div className="text-xs text-gray-500">Properties</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">
                          {user._count.bookings}
                        </div>
                        <div className="text-xs text-gray-500">Bookings</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">
                          {user._count.reviews}
                        </div>
                        <div className="text-xs text-gray-500">Reviews</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">
                          {user._count.favorites}
                        </div>
                        <div className="text-xs text-gray-500">Favorites</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/dashboard/admin/users/${user.id}/edit`)}
                        className="p-1.5 text-blue-600 hover:text-blue-900 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/admin/users/${user.id}/edit`)}
                        className="p-1.5 text-green-600 hover:text-green-900 rounded hover:bg-green-50"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.isActive ? (
                        <button
                          onClick={() => toggleUserActive(user.id, user.isActive)}
                          className="p-1.5 text-orange-600 hover:text-orange-900 rounded hover:bg-orange-50"
                          title="Deactivate User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleUserActive(user.id, user.isActive)}
                          className="p-1.5 text-green-600 hover:text-green-900 rounded hover:bg-green-50"
                          title="Activate User"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1.5 text-red-600 hover:text-red-900 rounded hover:bg-red-50"
                        title="Delete User"
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No users found</div>
            <button
              onClick={fetchUsers}
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'user').length}
          </div>
          <div className="text-sm text-gray-600">Regular Users</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'agent').length}
          </div>
          <div className="text-sm text-gray-600">Agents</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'developer').length}
          </div>
          <div className="text-sm text-gray-600">Developers</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-lg font-semibold text-gray-900">
            Last Login Activity
          </div>
          <div className="mt-2 space-y-1">
            {users
              .filter(u => u.lastLogin)
              .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
              .slice(0, 3)
              .map(user => (
                <div key={user.id} className="flex justify-between text-sm">
                  <span className="truncate">{user.name || user.email}</span>
                  <span className="text-gray-500">
                    {formatDate(user.lastLogin)}
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-lg font-semibold text-gray-900">
            Recent Registrations
          </div>
          <div className="mt-2 space-y-1">
            {users
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3)
              .map(user => (
                <div key={user.id} className="flex justify-between text-sm">
                  <span className="truncate">{user.name || user.email}</span>
                  <span className="text-gray-500">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-lg font-semibold text-gray-900">
            Verification Status
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span>Verified Users</span>
              <span className="font-semibold text-green-600">
                {users.filter(u => u.isVerified).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Email Verified</span>
              <span className="font-semibold text-blue-600">
                {users.filter(u => u.emailVerified).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Verified Agents</span>
              <span className="font-semibold text-blue-600">
                {users.filter(u => u.agentProfile?.verified).length}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-lg font-semibold text-gray-900">
            User Activity
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between">
              <span>Total Properties</span>
              <span className="font-semibold">
                {users.reduce((sum, user) => sum + user._count.ownedProperties, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Bookings</span>
              <span className="font-semibold">
                {users.reduce((sum, user) => sum + user._count.bookings, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Reviews</span>
              <span className="font-semibold">
                {users.reduce((sum, user) => sum + user._count.reviews, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}