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
  Calendar,
  DollarSign,
  User,
  Home,
  Download,
  RefreshCw,
  MoreVertical,
  Ban,
  CheckSquare,
  XSquare,
  Clock,
  AlertCircle,
  ExternalLink,
  Mail,
  Phone,
  CreditCard,
  TrendingUp,
  FileText,
  Check,
  X
} from 'lucide-react';

interface BookingData {
  id: string;
  bookingNumber: string;
  propertyId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  currency: string;
  cleaningFee: number | null;
  serviceFee: number | null;
  taxAmount: number | null;
  discountAmount: number | null;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  guestAddress: string | null;
  specialRequests: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  paymentStatus: string;
  cancellationReason: string | null;
  paymentMethod: string | null;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    images: string[];
    host: {
      name: string;
      email: string;
      phone: string | null;
    };
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  latestPayment: {
    id: string;
    status: string;
    amount: number;
    paymentMethod: string;
    gateway: string;
    createdAt: string;
  } | null;
  statusInfo: {
    label: string;
    color: string;
    description: string;
    icon: string;
  };
}

export default function BookingsManagement() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    confirmedBookings: 0,
    cancelledBookings: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchBookings();
  }, [pagination.page]);

  // Fetch bookings from your existing API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings?page=${pagination.page}&limit=${pagination.limit}&includeRelations=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (data.success && data.data) {
        setBookings(Array.isArray(data.data) ? data.data : []);
        setPagination(data.pagination);
      } else if (Array.isArray(data)) {
        setBookings(data);
      } else if (data.bookings) {
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } else {
        setBookings([]);
      }

      // Calculate statistics
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate booking statistics
  const calculateStats = (data: any) => {
    const bookingsArray = data.success && data.data ? data.data : 
                         data.bookings ? data.bookings : 
                         Array.isArray(data) ? data : [];

    const stats = {
      totalRevenue: 0,
      pendingPayments: 0,
      confirmedBookings: 0,
      cancelledBookings: 0
    };

    bookingsArray.forEach((booking: BookingData) => {
      if (booking.status === 'CONFIRMED') {
        stats.confirmedBookings++;
        stats.totalRevenue += booking.totalAmount;
      } else if (booking.status === 'CANCELLED') {
        stats.cancelledBookings++;
      }
      
      if (booking.paymentStatus === 'PENDING') {
        stats.pendingPayments++;
      }
    });

    setStats(stats);
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const endpoint = status === 'CONFIRMED' ? 
        `/api/bookings/${bookingId}/confirm` :
        status === 'CANCELLED' ?
        `/api/bookings/${bookingId}/cancel` :
        `/api/bookings/${bookingId}`;

      const method = status === 'CONFIRMED' || status === 'CANCELLED' ? 'POST' : 'PUT';
      const body = method === 'PUT' ? JSON.stringify({ status }) : undefined;

      const response = await fetch(endpoint, {
        method,
        headers: method === 'PUT' ? {
          'Content-Type': 'application/json',
        } : undefined,
        body
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Booking ${status.toLowerCase()} successfully`);
        fetchBookings(); // Refresh data to get updated booking
      } else {
        toast.error(data.error || `Failed to ${status.toLowerCase()} booking`);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error(`Failed to update booking status`);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (bookingId: string, paymentStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Payment status updated to ${paymentStatus}`);
        fetchBookings(); // Refresh data
      } else {
        toast.error(data.error || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Delete booking
  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Booking deleted successfully');
        setBookings(bookings.filter(booking => booking.id !== bookingId));
      } else {
        toast.error(data.error || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  // Refund booking
  const refundBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to refund this booking? This will process a refund through the payment gateway.')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}/refund`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Refund initiated successfully');
        fetchBookings(); // Refresh data
      } else {
        toast.error(data.error || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  // Send reminder email
  const sendReminder = async (bookingId: string, type: 'checkin' | 'checkout') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${type === 'checkin' ? 'Check-in' : 'Check-out'} reminder sent`);
      } else {
        toast.error(data.error || 'Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedBookings.length === 0) {
      toast.error('Please select bookings and an action');
      return;
    }

    try {
      const promises = selectedBookings.map(bookingId => {
        let endpoint = `/api/bookings/${bookingId}`;
        let method = 'PUT';
        let body = {};

        switch (bulkAction) {
          case 'confirm':
            endpoint = `/api/bookings/${bookingId}/confirm`;
            method = 'POST';
            break;
          case 'cancel':
            endpoint = `/api/bookings/${bookingId}/cancel`;
            method = 'POST';
            break;
          case 'mark_paid':
            body = { paymentStatus: 'SUCCEEDED' };
            break;
          case 'mark_pending':
            body = { paymentStatus: 'PENDING' };
            break;
          case 'mark_failed':
            body = { paymentStatus: 'FAILED' };
            break;
          case 'delete':
            return fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
        }

        if (bulkAction !== 'delete') {
          return fetch(endpoint, {
            method,
            headers: method === 'PUT' ? { 'Content-Type': 'application/json' } : undefined,
            body: method === 'PUT' ? JSON.stringify(body) : undefined,
          });
        }
      });

      await Promise.all(promises);
      toast.success(`Bulk action completed: ${bulkAction}`);
      fetchBookings(); // Refresh data
      setSelectedBookings([]);
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.property.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || booking.paymentStatus === paymentStatusFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRange.start || dateRange.end) {
      const bookingStart = new Date(booking.startDate);
      const filterStart = dateRange.start ? new Date(dateRange.start) : null;
      const filterEnd = dateRange.end ? new Date(dateRange.end) : null;
      
      if (filterStart && bookingStart < filterStart) matchesDateRange = false;
      if (filterEnd && bookingStart > filterEnd) matchesDateRange = false;
    }

    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange;
  });

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-blue-100 text-blue-800';
      case 'PARTIALLY_REFUNDED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get upcoming bookings
  const getUpcomingBookings = () => {
    const today = new Date();
    return bookings.filter(booking => 
      booking.status === 'CONFIRMED' && 
      new Date(booking.startDate) > today
    ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  // Get recent cancellations
  const getRecentCancellations = () => {
    return bookings.filter(booking => 
      booking.status === 'CANCELLED'
    ).sort((a, b) => new Date(b.cancelledAt || b.updatedAt).getTime() - new Date(a.cancelledAt || a.updatedAt).getTime())
     .slice(0, 5);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600 mt-1">
              Manage {bookings.length} bookings • Total Revenue: {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchBookings}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => toast.success('Export feature coming soon!')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.confirmedBookings}
              </div>
              <div className="text-sm text-gray-600">Confirmed Bookings</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.pendingPayments}
              </div>
              <div className="text-sm text-gray-600">Pending Payments</div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.cancelledBookings}
              </div>
              <div className="text-sm text-gray-600">Cancelled Bookings</div>
            </div>
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
              placeholder="Search bookings by number, guest name, email, or property..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Payment Status</option>
              <option value="PENDING">Payment Pending</option>
              <option value="SUCCEEDED">Payment Succeeded</option>
              <option value="FAILED">Payment Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          <div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex-1">
              <span className="text-blue-700 font-medium">
                {selectedBookings.length} bookings selected
              </span>
            </div>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Bulk Actions</option>
              <option value="confirm">Confirm</option>
              <option value="cancel">Cancel</option>
              <option value="mark_paid">Mark as Paid</option>
              <option value="mark_pending">Mark as Pending</option>
              <option value="mark_failed">Mark as Failed</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedBookings([])}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={selectedBookings.length === filteredBookings.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBookings(filteredBookings.map(b => b.id));
                      } else {
                        setSelectedBookings([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates & Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBookings([...selectedBookings, booking.id]);
                        } else {
                          setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <div className="font-mono font-bold text-gray-900">
                          #{booking.bookingNumber}
                        </div>
                        <div className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {formatDateTime(booking.createdAt)}
                      </div>
                      {booking.confirmedAt && (
                        <div className="text-xs text-green-600">
                          Confirmed: {formatDateTime(booking.confirmedAt)}
                        </div>
                      )}
                      {booking.cancelledAt && (
                        <div className="text-xs text-red-600">
                          Cancelled: {formatDateTime(booking.cancelledAt)}
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-semibold">Duration:</span> {booking.totalDays} days
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">{booking.guestName}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-1" />
                        {booking.guestEmail}
                      </div>
                      {booking.guestPhone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-1" />
                          {booking.guestPhone}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        Guests: {booking.guests}
                      </div>
                      {booking.specialRequests && (
                        <div className="text-xs text-blue-600 mt-1">
                          <div className="font-semibold">Special Requests:</div>
                          <div className="truncate max-w-[200px]">{booking.specialRequests}</div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-semibold">
                          {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <Home className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 truncate max-w-[200px]">
                            {booking.property.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {booking.property.city}, {booking.property.state}
                          </div>
                          <div className="text-xs text-gray-400">
                            Owner: {booking.property.host.name}
                          </div>
                        </div>
                      </div>
                      {booking.checkInAt && (
                        <div className="text-xs text-green-600">
                          Checked in: {formatDateTime(booking.checkInAt)}
                        </div>
                      )}
                      {booking.checkOutAt && (
                        <div className="text-xs text-blue-600">
                          Checked out: {formatDateTime(booking.checkOutAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(booking.totalAmount, booking.currency)}
                      </div>
                      <div className="flex items-center">
                        <div className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus}
                        </div>
                        {booking.paymentMethod && (
                          <div className="ml-2 text-xs text-gray-500">
                            via {booking.paymentMethod}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        <div>Base: {formatCurrency(booking.totalAmount - (booking.cleaningFee || 0) - (booking.serviceFee || 0) - (booking.taxAmount || 0), booking.currency)}</div>
                        {booking.cleaningFee && booking.cleaningFee > 0 && (
                          <div>Cleaning: {formatCurrency(booking.cleaningFee, booking.currency)}</div>
                        )}
                        {booking.serviceFee && booking.serviceFee > 0 && (
                          <div>Service: {formatCurrency(booking.serviceFee, booking.currency)}</div>
                        )}
                        {booking.taxAmount && booking.taxAmount > 0 && (
                          <div>Tax: {formatCurrency(booking.taxAmount, booking.currency)}</div>
                        )}
                        {booking.discountAmount && booking.discountAmount > 0 && (
                          <div className="text-green-600">
                            Discount: -{formatCurrency(booking.discountAmount, booking.currency)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/admin/bookings/${booking.id}/edit`)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {booking.status !== 'CONFIRMED' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                            className="p-1.5 text-green-600 hover:text-green-900 rounded hover:bg-green-50"
                            title="Confirm Booking"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              updateBookingStatus(booking.id, 'CANCELLED');
                            }}
                            className="p-1.5 text-red-600 hover:text-red-900 rounded hover:bg-red-50"
                            title="Cancel Booking"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {booking.paymentStatus === 'SUCCEEDED' && booking.status === 'CANCELLED' && (
                          <button
                            onClick={() => refundBooking(booking.id)}
                            className="p-1.5 text-orange-600 hover:text-orange-900 rounded hover:bg-orange-50"
                            title="Refund Booking"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={booking.paymentStatus}
                          onChange={(e) => updatePaymentStatus(booking.id, e.target.value)}
                          className={`text-xs border rounded px-2 py-1 ${getPaymentStatusColor(booking.paymentStatus)}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="SUCCEEDED">Succeeded</option>
                          <option value="FAILED">Failed</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          className="p-1.5 text-red-600 hover:text-red-900 rounded hover:bg-red-50"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {booking.status === 'CONFIRMED' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => sendReminder(booking.id, 'checkin')}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Check-in Reminder
                          </button>
                          <button
                            onClick={() => sendReminder(booking.id, 'checkout')}
                            className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Check-out Reminder
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No bookings found</div>
            <button
              onClick={fetchBookings}
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Check-ins</h3>
            <span className="text-sm text-gray-500">Next 7 days</span>
          </div>
          <div className="space-y-3">
            {getUpcomingBookings().slice(0, 5).map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{booking.guestName}</div>
                  <div className="text-sm text-gray-500">#{booking.bookingNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatDate(booking.startDate)}</div>
                  <div className="text-sm text-gray-500">{booking.property.title}</div>
                </div>
              </div>
            ))}
            {getUpcomingBookings().length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No upcoming check-ins
              </div>
            )}
          </div>
        </div>

        {/* Recent Cancellations */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Cancellations</h3>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>
          <div className="space-y-3">
            {getRecentCancellations().map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{booking.guestName}</div>
                  <div className="text-sm text-gray-500">#{booking.bookingNumber}</div>
                  {booking.cancellationReason && (
                    <div className="text-xs text-red-600 mt-1">
                      Reason: {booking.cancellationReason}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {formatCurrency(booking.totalAmount, booking.currency)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(booking.cancelledAt || booking.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
            {getRecentCancellations().length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No recent cancellations
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.length}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {bookings.filter(b => b.status === 'CANCELLED').length}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
}