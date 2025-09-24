import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, DollarSign, Clock, MapPin, Calendar, Download, Filter, Globe, Truck, Plane, Ship, AlertTriangle, CheckCircle, Users, Target, Zap, Activity, Eye, Star, Award, Gauge, Timer, TrendingDown, RefreshCw, Settings, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedCounter } from '../components/AnimatedElements';

interface AnalyticsData {
  totalShipments: number;
  totalValue: number;
  avgDeliveryTime: number;
  onTimeDelivery: number;
  monthlyShipments: { month: string; count: number; value: number }[];
  serviceBreakdown: { service: string; count: number; percentage: number; icon: React.ReactNode; color: string }[];
  topRoutes: { route: string; count: number; avgTime: number; distance: number; cost: number }[];
  recentTrends: { metric: string; value: number; change: number; trend: 'up' | 'down' }[];
  carrierPerformance: { carrier: string; shipments: number; onTime: number; avgCost: number; rating: number }[];
  geographicData: { region: string; shipments: number; revenue: number; growth: number }[];
  customerMetrics: { totalCustomers: number; activeCustomers: number; newCustomers: number; retention: number };
  operationalMetrics: { 
    warehouseUtilization: number;
    fuelEfficiency: number;
    carbonFootprint: number;
    employeeProductivity: number;
    equipmentUptime: number;
    costPerShipment: number;
  };
  alerts: { type: 'warning' | 'error' | 'info'; message: string; count: number }[];
  forecasting: { 
    nextMonth: { shipments: number; revenue: number; confidence: number };
    quarter: { shipments: number; revenue: number; confidence: number };
  };
}

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('last_6_months');
  const [selectedMetric, setSelectedMetric] = useState('shipments');

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    totalShipments: 247,
    totalValue: 1250000,
    avgDeliveryTime: 4.2,
    onTimeDelivery: 94.5,
    monthlyShipments: [
      { month: 'Aug 2023', count: 32, value: 180000 },
      { month: 'Sep 2023', count: 38, value: 220000 },
      { month: 'Oct 2023', count: 45, value: 195000 },
      { month: 'Nov 2023', count: 41, value: 210000 },
      { month: 'Dec 2023', count: 52, value: 245000 },
      { month: 'Jan 2024', count: 39, value: 200000 }
    ],
    serviceBreakdown: [
      { service: 'Ocean Freight', count: 128, percentage: 51.8, icon: <Ship className="h-4 w-4" />, color: 'bg-blue-500' },
      { service: 'Air Freight', count: 74, percentage: 30.0, icon: <Plane className="h-4 w-4" />, color: 'bg-green-500' },
      { service: 'Ground Transportation', count: 45, percentage: 18.2, icon: <Truck className="h-4 w-4" />, color: 'bg-purple-500' }
    ],
    topRoutes: [
      { route: 'Shanghai → Los Angeles', count: 45, avgTime: 18.5, distance: 6434, cost: 2850 },
      { route: 'Los Angeles → New York', count: 38, avgTime: 3.2, distance: 2445, cost: 1200 },
      { route: 'Hamburg → Miami', count: 32, avgTime: 21.3, distance: 4567, cost: 3100 },
      { route: 'Chicago → Dallas', count: 28, avgTime: 2.1, distance: 925, cost: 650 },
      { route: 'Tokyo → Seattle', count: 24, avgTime: 16.8, distance: 4792, cost: 2950 }
    ],
    recentTrends: [
      { metric: 'Total Shipments', value: 247, change: 12.5, trend: 'up' },
      { metric: 'Average Value', value: 5060, change: -3.2, trend: 'down' },
      { metric: 'On-Time Delivery', value: 94.5, change: 2.1, trend: 'up' },
      { metric: 'Avg Delivery Time', value: 4.2, change: -0.8, trend: 'up' }
    ],
    carrierPerformance: [
      { carrier: 'FedEx', shipments: 89, onTime: 96.2, avgCost: 45.80, rating: 4.8 },
      { carrier: 'UPS', shipments: 76, onTime: 94.1, avgCost: 42.30, rating: 4.6 },
      { carrier: 'DHL', shipments: 52, onTime: 91.7, avgCost: 52.10, rating: 4.4 },
      { carrier: 'USPS', shipments: 30, onTime: 87.3, avgCost: 28.90, rating: 4.1 }
    ],
    geographicData: [
      { region: 'North America', shipments: 142, revenue: 680000, growth: 15.2 },
      { region: 'Europe', shipments: 67, revenue: 340000, growth: 8.7 },
      { region: 'Asia Pacific', shipments: 28, revenue: 180000, growth: 22.1 },
      { region: 'Latin America', shipments: 10, revenue: 50000, growth: 5.3 }
    ],
    customerMetrics: {
      totalCustomers: 1247,
      activeCustomers: 892,
      newCustomers: 156,
      retention: 87.3
    },
    operationalMetrics: {
      warehouseUtilization: 78.5,
      fuelEfficiency: 7.2,
      carbonFootprint: 2.4,
      employeeProductivity: 94.1,
      equipmentUptime: 96.8,
      costPerShipment: 45.60
    },
    alerts: [
      { type: 'warning', message: 'High fuel costs detected', count: 3 },
      { type: 'error', message: 'Delayed shipments requiring attention', count: 7 },
      { type: 'info', message: 'New carrier partnerships available', count: 2 }
    ],
    forecasting: {
      nextMonth: { shipments: 285, revenue: 1420000, confidence: 87.2 },
      quarter: { shipments: 820, revenue: 4100000, confidence: 82.5 }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMaxValue = (data: { count: number; value: number }[]) => {
    return selectedMetric === 'shipments' 
      ? Math.max(...data.map(d => d.count))
      : Math.max(...data.map(d => d.value));
  };

  const getValue = (item: { count: number; value: number }) => {
    return selectedMetric === 'shipments' ? item.count : item.value;
  };

  const maxValue = getMaxValue(analyticsData.monthlyShipments);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View shipping analytics and performance reports
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="last_year">Last Year</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalShipments}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+12.5% from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(analyticsData.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+8.3% from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.avgDeliveryTime} days</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">-0.8 days improvement</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Delivery</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPercentage(analyticsData.onTimeDelivery)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+2.1% improvement</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Trends</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="shipments">Shipments</option>
                <option value="value">Value</option>
              </select>
            </div>
            <div className="space-y-4">
              {analyticsData.monthlyShipments.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-16 text-sm text-gray-600 dark:text-gray-400">{item.month}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {selectedMetric === 'shipments' ? item.count : formatCurrency(item.value)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(getValue(item) / maxValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Service Breakdown</h3>
            <div className="space-y-4">
              {analyticsData.serviceBreakdown.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                    <span className="text-sm text-gray-900 dark:text-white">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{service.count}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatPercentage(service.percentage)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Donut Chart Representation */}
            <div className="mt-6 flex justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${analyticsData.serviceBreakdown[0].percentage}, 100`}
                    strokeLinecap="round"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{analyticsData.totalShipments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Routes and Recent Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Routes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Top Routes
            </h3>
            <div className="space-y-4">
              {analyticsData.topRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{route.route}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {route.count} shipments • {route.distance.toLocaleString()} miles • ${route.cost.toLocaleString()} avg
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-900 dark:text-white">{route.avgTime} days</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">avg time</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance Trends
            </h3>
            <div className="space-y-4">
              {analyticsData.recentTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{trend.metric}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {trend.metric.includes('Value') ? formatCurrency(trend.value) : 
                       trend.metric.includes('%') || trend.metric.includes('Delivery') ? formatPercentage(trend.value) :
                       trend.metric.includes('Time') ? `${trend.value} days` : trend.value}
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    trend.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <TrendingUp className={`h-4 w-4 ${trend.trend === 'down' ? 'transform rotate-180' : ''}`} />
                    <span className="text-sm font-medium">
                      {Math.abs(trend.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Metrics and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Customer Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Customer Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Customers</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={analyticsData.customerMetrics.totalCustomers} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Active Customers</span>
                <span className="text-xl font-bold text-green-600">
                  <AnimatedCounter value={analyticsData.customerMetrics.activeCustomers} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">New This Month</span>
                <span className="text-xl font-bold text-blue-600">
                  <AnimatedCounter value={analyticsData.customerMetrics.newCustomers} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
                <span className="text-xl font-bold text-purple-600">
                  {formatPercentage(analyticsData.customerMetrics.retention)}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Alerts
            </h3>
            <div className="space-y-3">
              {analyticsData.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {alert.type === 'error' ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
                       alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                       <CheckCircle className="h-4 w-4 text-blue-500" />}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {alert.message}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.type === 'error' ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200' :
                      alert.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                      'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                    }`}>
                      {alert.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecasting */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Forecasting
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Next Month</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Shipments</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      <AnimatedCounter value={analyticsData.forecasting.nextMonth.shipments} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(analyticsData.forecasting.nextMonth.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                    <span className="font-bold text-green-600">
                      {formatPercentage(analyticsData.forecasting.nextMonth.confidence)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Next Quarter</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Shipments</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      <AnimatedCounter value={analyticsData.forecasting.quarter.shipments} />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(analyticsData.forecasting.quarter.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Confidence</span>
                    <span className="font-bold text-green-600">
                      {formatPercentage(analyticsData.forecasting.quarter.confidence)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carrier Performance and Geographic Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Carrier Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Carrier Performance
            </h3>
            <div className="space-y-4">
              {analyticsData.carrierPerformance.map((carrier, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{carrier.carrier}</h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${
                              i < Math.floor(carrier.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`} />
                          ))}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            {carrier.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {carrier.shipments} shipments
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${carrier.avgCost.toFixed(2)} avg cost
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Performance</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${carrier.onTime}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatPercentage(carrier.onTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Data */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Geographic Performance
            </h3>
            <div className="space-y-4">
              {analyticsData.geographicData.map((region, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{region.region}</h4>
                    <div className={`flex items-center space-x-1 ${
                      region.growth > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${region.growth < 0 ? 'transform rotate-180' : ''}`} />
                      <span className="text-sm font-medium">
                        {Math.abs(region.growth)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Shipments</span>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        <AnimatedCounter value={region.shipments} />
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(region.revenue)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
            <Gauge className="h-5 w-5 mr-2" />
            Operational Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(analyticsData.operationalMetrics.warehouseUtilization)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Warehouse Utilization</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.operationalMetrics.fuelEfficiency} mpg
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Fuel Efficiency</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.operationalMetrics.carbonFootprint} kg
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Carbon Footprint</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(analyticsData.operationalMetrics.employeeProductivity)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Employee Productivity</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Activity className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(analyticsData.operationalMetrics.equipmentUptime)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Equipment Uptime</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${analyticsData.operationalMetrics.costPerShipment.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Cost Per Shipment</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
