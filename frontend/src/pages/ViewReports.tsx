import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Package, DollarSign, ArrowLeft, Download, Filter, Calendar } from 'lucide-react';

interface ViewReportsProps {
  onBack: () => void;
}

export const ViewReports: React.FC<ViewReportsProps> = ({ onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const mockReportData = {
    summary: {
      totalRevenue: 1250000,
      totalShipments: 8945,
      activeUsers: 2341,
      avgDeliveryTime: 3.2
    },
    chartData: {
      revenue: [
        { month: 'Jan', value: 180000 },
        { month: 'Feb', value: 220000 },
        { month: 'Mar', value: 195000 },
        { month: 'Apr', value: 240000 },
        { month: 'May', value: 285000 },
        { month: 'Jun', value: 310000 }
      ],
      shipments: [
        { month: 'Jan', value: 1200 },
        { month: 'Feb', value: 1450 },
        { month: 'Mar', value: 1380 },
        { month: 'Apr', value: 1620 },
        { month: 'May', value: 1890 },
        { month: 'Jun', value: 2105 }
      ]
    },
    topRoutes: [
      { route: 'LA → NY', shipments: 1245, revenue: 89500 },
      { route: 'SF → Chicago', shipments: 987, revenue: 72300 },
      { route: 'Miami → Boston', shipments: 834, revenue: 61200 },
      { route: 'Seattle → Atlanta', shipments: 756, revenue: 55800 },
      { route: 'Denver → Dallas', shipments: 623, revenue: 45900 }
    ]
  };

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setReportData(mockReportData);
      setIsLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <BarChart3 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive insights into your shipping operations
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600 dark:text-gray-300">Loading reports...</span>
            </div>
          ) : reportData && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.summary.totalRevenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-200" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-blue-100 ml-1">+12.5% from last period</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Shipments</p>
                      <p className="text-2xl font-bold">{formatNumber(reportData.summary.totalShipments)}</p>
                    </div>
                    <Package className="h-8 w-8 text-green-200" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-green-100 ml-1">+8.3% from last period</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Active Users</p>
                      <p className="text-2xl font-bold">{formatNumber(reportData.summary.activeUsers)}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-purple-100 ml-1">+15.2% from last period</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Avg Delivery Time</p>
                      <p className="text-2xl font-bold">{reportData.summary.avgDeliveryTime} days</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-200" />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-300" />
                    <span className="text-sm text-orange-100 ml-1">-0.3 days improved</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Revenue Trend
                  </h3>
                  <div className="space-y-4">
                    {reportData.chartData.revenue.map((item: any, index: number) => (
                      <div key={item.month} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-12">
                          {item.month}
                        </span>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${(item.value / 310000) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipments Chart */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Shipment Volume
                  </h3>
                  <div className="space-y-4">
                    {reportData.chartData.shipments.map((item: any, index: number) => (
                      <div key={item.month} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300 w-12">
                          {item.month}
                        </span>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                            <div
                              className="bg-green-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${(item.value / 2105) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                          {formatNumber(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Routes Table */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Shipping Routes
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Route</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Shipments</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Revenue</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Avg Revenue/Shipment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topRoutes.map((route: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                            {route.route}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                            {formatNumber(route.shipments)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                            {formatCurrency(route.revenue)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                            {formatCurrency(route.revenue / route.shipments)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Generate Detailed Report
                </button>
                <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Schedule Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
