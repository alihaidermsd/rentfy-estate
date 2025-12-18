'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'AGENT' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  password?: string;
  confirmPassword?: string;
}

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew] = useState(userId === 'new');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'USER',
    status: 'ACTIVE',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isNew) {
      fetchUser();
    }
  }, [isNew, userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      if (data.success) {
        const user = data.data;
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role,
          status: user.status,
          password: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to fetch user data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNew && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (isNew && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    setLoading(true);
    try {
      const url = isNew ? '/api/admin/users' : `/api/admin/users/${userId}`;
      const method = isNew ? 'POST' : 'PUT';
      
      const payload = { ...formData };
      if (!isNew) {
        delete payload.password;
        delete payload.confirmPassword;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(isNew ? 'User created successfully' : 'User updated successfully');
        router.push('/dashboard/admin/users');
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isNew ? 'Create New User' : 'Edit User'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isNew ? 'Add a new user to the system' : 'Update user information'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USER">User</option>
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Status */}
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Password for new user */}
            {isNew && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={isNew}
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={isNew}
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}
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
                  {isNew ? 'Create User' : 'Update User'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Additional Actions for existing user */}
      {!isNew && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Permanently delete this user. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                  try {
                    const response = await fetch(`/api/admin/users/${userId}`, {
                      method: 'DELETE',
                    });
                    
                    const data = await response.json();
                    if (data.success) {
                      toast.success('User deleted successfully');
                      router.push('/dashboard/admin/users');
                    } else {
                      toast.error(data.message || 'Failed to delete user');
                    }
                  } catch (error) {
                    console.error('Error deleting user:', error);
                    toast.error('Failed to delete user');
                  }
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}