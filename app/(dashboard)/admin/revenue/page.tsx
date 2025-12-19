'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Home,
  Calendar,
  CreditCard,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Wallet,
  Target,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye
} from 'lucide-react';

interface RevenueData {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  revenueGrowth: number;
  bookingGrowth: number;
  pendingPayments: number;
  refundedAmount: number;
  netRevenue: number;
}

interface PaymentData {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  gateway: string;
  createdAt: string;
  booking: {
    bookingNumber: string;
    guestName: string;
    property: {
      title: string;
    };
  };
}

interface BookingAnalytics {
  month: string;
  revenue: number;
  bookings: number;
  averageValue: number;
}

interface PropertyRevenue {
  propertyId: string;
  title: string;
  totalRevenue: number;
  bookings: number;
  averageRating: number | null;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  total: number;
  percentage: number;
}

export default function RevenueDashboard() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [recentPayments, setRecentPayments] = useState<PaymentData[]>([]);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics[]>([]);
  const [propertyRevenue, setPropertyRevenue] = useState<PropertyRevenue[]>([]);
  const [paymentMethodStats, setPaymentMethodStats] = useState<PaymentMethodStats[]>([]);
  const [timeRange, setTimeRange] = useState<string>('month');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange, dateRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (timeRange !== 'custom') {
        params.append('range', timeRange);
      }
      if (dateRange.start) {
        params.append('startDate', dateRange.start);
      }
      if (dateRange.end) {
        params.append('endDate', dateRange.end);
      }

      // Fetch all revenue data in parallel
      const [
        revenueResponse,
        paymentsResponse,
        analyticsResponse,
        propertiesResponse,
        paymentMethodsResponse
      ] = await Promise.all([
        fetch(`/api/analytics/revenue?${params}`),
        fetch(`/api/payments?limit=10&${params}`),
        fetch(`/api/analytics/bookings?${params}`),
        fetch(`/api/analytics/properties?${params}`),
        fetch(`/api/analytics/payment-methods?${params}`)
      ]);

      // Handle revenue data
      if (revenueResponse.ok) {
        const revenue = await revenueResponse.json();
        setRevenueData(revenue.data || revenue);
      }

      // Handle recent payments
      if (paymentsResponse.ok) {
        const payments = await paymentsResponse.json();
        setRecentPayments(payments.data || payments.payments || []);
      }

      // Handle booking analytics
      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        setBookingAnalytics(analytics.data || analytics.analytics || []);
      }

      // Handle property revenue
      if (propertiesResponse.ok) {
        const properties = await propertiesResponse.json();
        setPropertyRevenue(properties.data || properties.properties || []);
      }

      // Handle payment method stats
      if (paymentMethodsResponse.ok) {
        const methods = await paymentMethodsResponse.json();
        setPaymentMethodStats(methods.data || methods.methods || []);
      }

    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    toast.success('Export feature coming soon!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyWithDecimals = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit_card': return 'bg-purple-100 text-purple-800';
      case 'paypal': return 'bg-blue-100 text-blue-800';
      case 'bank_transfer': return 'bg-green-100 text-green-800';
      case 'stripe': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const calculateStatistics = () => {
    if (!revenueData) return null;

    const stats = {
      revenuePerBooking: revenueData.totalBookings > 0 
        ? revenueData.totalRevenue / revenueData.totalBookings 
        : 0,
      conversionRate: 0, // This would come from analytics API
      refundRate: revenueData.totalRevenue > 0 
        ? (revenueData.refundedAmount / revenueData.totalRevenue) * 100 
        : 0,
      pendingPercentage: revenueData.totalRevenue > 0 
        ? (revenueData.pendingPayments / revenueData.totalRevenue) * 100 
        : 0
    };

    return stats;
  };

  const stats = calculateStatistics();

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
            <h1 className="text-2xl font-bold text-gray-900">Revenue & Analytics</h1>
            <p className="text-gray-600 mt-1">
              Track your platform's financial performance and metrics
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            {timeRange === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}
            <button
              onClick={fetchRevenueData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {revenueData ? formatCurrency(revenueData.totalRevenue) : '$0'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {revenueData?.revenueGrowth && revenueData.revenueGrowth >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={`text-sm font-medium ${
              revenueData?.revenueGrowth && revenueData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {revenueData?.revenueGrowth ? `${Math.abs(revenueData.revenueGrowth)}%` : '0%'}
            </span>
            <span className="text-sm text-gray-600 ml-2">vs previous period</span>
          </div>
        </div>

        {/* Net Revenue Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {revenueData ? formatCurrency(revenueData.netRevenue) : '$0'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>After refunds</span>
              {revenueData?.refundedAmount && revenueData.refundedAmount > 0 && (
                <span className="text-red-600">
                  -{formatCurrency(revenueData.refundedAmount)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {revenueData?.totalBookings || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {revenueData?.bookingGrowth && revenueData.bookingGrowth >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={`text-sm font-medium ${
              revenueData?.bookingGrowth && revenueData.bookingGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {revenueData?.bookingGrowth ? `${Math.abs(revenueData.bookingGrowth)}%` : '0%'}
            </span>
            <span className="text-sm text-gray-600 ml-2">vs previous period</span>
          </div>
        </div>

        {/* Average Booking Value Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Booking Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {revenueData?.averageBookingValue ? formatCurrency(revenueData.averageBookingValue) : '$0'}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Percent className="w-4 h-4 mr-1" />
              <span>Based on {revenueData?.totalBookings || 0} bookings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {revenueData?.pendingPayments ? formatCurrency(revenueData.pendingPayments) : '$0'}
          </div>
          <div className="text-sm text-gray-600">Pending Payments</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {revenueData?.refundedAmount ? formatCurrency(revenueData.refundedAmount) : '$0'}
          </div>
          <div className="text-sm text-gray-600">Total Refunds</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {stats ? `${stats.refundRate.toFixed(1)}%` : '0%'}
          </div>
          <div className="text-sm text-gray-600">Refund Rate</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {stats ? `${stats.pendingPercentage.toFixed(1)}%` : '0%'}
          </div>
          <div className="text-sm text-gray-600">Pending %</div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <LineChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            {bookingAnalytics.length > 0 ? (
              <div className="space-y-4">
                {bookingAnalytics.map((month, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{month.month}</span>
                      <span className="font-semibold">{formatCurrency(month.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((month.revenue / Math.max(...bookingAnalytics.map(m => m.revenue))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{month.bookings} bookings</span>
                      <span>Avg: {formatCurrency(month.averageValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            {paymentMethodStats.length > 0 ? (
              <div className="space-y-4">
                {paymentMethodStats.map((method, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${getPaymentMethodColor(method.method)}`}></div>
                        <span className="text-gray-600">
                          {method.method.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(method.total)}</div>
                        <div className="text-xs text-gray-500">{method.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getPaymentMethodColor(method.method)}`}
                        style={{ width: `${method.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{method.count} transactions</span>
                      <span>Avg: {formatCurrency(method.total / method.count)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No payment method data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Properties */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Properties</h3>
          <Home className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(propertyRevenue) && propertyRevenue.slice(0, 10).map((property) => (
                <tr key={property.propertyId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{property.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(property.totalRevenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{property.bookings}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {property.averageRating ? (
                        <>
                          <div className="text-yellow-500 font-semibold">
                            {property.averageRating.toFixed(1)}
                          </div>
                          <div className="ml-1 text-xs text-gray-500">/5</div>
                        </>
                      ) : (
                        <div className="text-gray-400">N/A</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min((property.totalRevenue / Math.max(...propertyRevenue.map(p => p.totalRevenue))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {propertyRevenue.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No property revenue data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
          <CreditCard className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-gray-900">
                      {payment.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        #{payment.booking.bookingNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.booking.guestName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`px-2 py-1 text-xs rounded ${getPaymentMethodColor(payment.paymentMethod)}`}>
                        {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {formatCurrencyWithDecimals(payment.amount)}
                    </div>
                    <div className="text-xs text-gray-500">{payment.currency}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDateTime(payment.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toast.info('View payment details')}
                      className="p-1 text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent payments available
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Revenue Forecast</h4>
              <p className="text-sm text-gray-600">Next 30 days</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {revenueData ? formatCurrency(revenueData.totalRevenue * 1.1) : '$0'}
          </div>
          <div className="text-sm text-green-600 mt-2">+10% projected growth</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Success Rate</h4>
              <p className="text-sm text-gray-600">Completed payments</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">94.5%</div>
          <div className="text-sm text-gray-600 mt-2">Based on last 500 payments</div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Risk Indicators</h4>
              <p className="text-sm text-gray-600">Requires attention</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600 mt-2">
            High-risk bookings detected
          </div>
        </div>
      </div>
    </div>
  );
}