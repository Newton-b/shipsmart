import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Package, 
  Truck, 
  Clock, 
  Users, 
  Globe, 
  Zap,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Calendar,
  Download,
  Eye,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { AnimatedCounter, AnimatedProgressBar, PulsingDots } from './AnimatedElements';
import { useNotifications } from '../hooks/useNotifications';

interface AnalyticsDashboardProps {
  className?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
  icon: React.ComponentType;
}

interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

interface LiveMetrics {
  totalShipments: MetricData;
  revenue: MetricData;
  activeVehicles: MetricData;
  deliveryRate: MetricData;
  avgDeliveryTime: MetricData;
  customerSatisfaction: MetricData;
}

export const LiveAnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = "",
  timeRange = '24h'
}) => {
  const { createNotification } = useNotifications();
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    totalShipments: {
      label: 'Total Shipments',
      value: 1247,
      change: 12.5,
      trend: 'up',
      color: 'blue',
      icon: Package
    },
    revenue: {
      label: 'Revenue',
      value: 89750,
      change: 8.3,
      trend: 'up',
      color: 'green',
      icon: DollarSign
    },
    activeVehicles: {
      label: 'Active Vehicles',
      value: 156,
      change: -2.1,
      trend: 'down',
      color: 'orange',
      icon: Truck
    },
    deliveryRate: {
      label: 'On-Time Delivery',
      value: 94.8,
      change: 1.2,
      trend: 'up',
      color: 'purple',
      icon: Clock
    },
    avgDeliveryTime: {
      label: 'Avg Delivery Time',
      value: 2.4,
      change: -0.3,
      trend: 'up',
      color: 'indigo',
      icon: Activity
    },
    customerSatisfaction: {
      label: 'Customer Rating',
      value: 4.7,
      change: 0.1,
      trend: 'up',
      color: 'pink',
      icon: Users
    }
  });

  const [chartData, setChartData] = useState<{[key: string]: ChartDataPoint[]}>({
    shipments: [],
    revenue: [],
    deliveryTimes: []
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate initial chart data
  useEffect(() => {
    const generateChartData = (baseValue: number, points: number = 24) => {
      const data: ChartDataPoint[] = [];
      const now = new Date();
      
      for (let i = points - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Hourly data
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        const value = baseValue * (1 + variation);
        
        data.push({
          timestamp,
          value: Math.round(value * 100) / 100
        });
      }
      
      return data;
    };

    setChartData({
      shipments: generateChartData(52), // ~52 shipments per hour
      revenue: generateChartData(3740), // ~$3740 per hour
      deliveryTimes: generateChartData(2.4) // ~2.4 hours avg
    });
  }, [selectedTimeRange]);

  // Real-time updates simulation
  useEffect(() => {
    if (isLiveMode) {
      intervalRef.current = setInterval(() => {
        // Update metrics with small random changes
        setMetrics(prevMetrics => {
          const updatedMetrics = { ...prevMetrics };
          
          Object.keys(updatedMetrics).forEach(key => {
            const metric = updatedMetrics[key as keyof LiveMetrics];
            const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
            const newValue = metric.value * (1 + variation);
            const change = ((newValue - metric.value) / metric.value) * 100;
            
            updatedMetrics[key as keyof LiveMetrics] = {
              ...metric,
              value: Math.round(newValue * 100) / 100,
              change: Math.round(change * 100) / 100,
              trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
            };
          });
          
          return updatedMetrics;
        });

        // Update chart data
        setChartData(prevData => {
          const newData = { ...prevData };
          const now = new Date();
          
          Object.keys(newData).forEach(key => {
            const currentData = newData[key];
            const lastValue = currentData[currentData.length - 1]?.value || 0;
            const variation = (Math.random() - 0.5) * 0.1;
            const newValue = lastValue * (1 + variation);
            
            // Add new point and remove oldest if we have too many
            const newPoint: ChartDataPoint = {
              timestamp: now,
              value: Math.round(newValue * 100) / 100
            };
            
            newData[key] = [...currentData.slice(-23), newPoint]; // Keep last 24 points
          });
          
          return newData;
        });

        setLastUpdate(new Date());

        // Occasionally send notifications for significant changes
        if (Math.random() < 0.1) { // 10% chance
          createNotification({
            title: 'Analytics Alert',
            message: 'Significant change detected in delivery metrics',
            type: 'system_alert'
          });
        }
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLiveMode, createNotification]);

  const getMetricColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      green: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
      pink: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const renderMiniChart = (data: ChartDataPoint[], color: string) => {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="flex items-end space-x-1 h-12 w-full">
        {data.slice(-12).map((point, index) => {
          const height = ((point.value - minValue) / range) * 100;
          return (
            <div
              key={index}
              className={`flex-1 bg-${color}-500 opacity-60 rounded-sm transition-all duration-300`}
              style={{ height: `${Math.max(height, 5)}%` }}
            />
          );
        })}
      </div>
    );
  };

  const containerClasses = `
    ${className}
    ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-auto' : 'relative'}
  `;

  return (
    <div className={containerClasses}>
      {/* Mobile-First Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <span>Live Analytics</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time business metrics and insights
            </p>
          </div>

          {/* Mobile-Responsive Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Range Selector */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            {/* Live Mode Toggle */}
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              {isLiveMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">{isLiveMode ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className={`w-4 h-4 ${isLiveMode ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isLiveMode ? 'Live Updates Active' : 'Updates Paused'}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          {isLiveMode && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
      </div>

      {/* Mobile-Responsive Metrics Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Object.entries(metrics).map(([key, metric]) => {
            const Icon = metric.icon;
            const colorClasses = getMetricColorClasses(metric.color);
            
            return (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${colorClasses}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend, metric.change)}
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {metric.label}
                  </h3>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    <AnimatedCounter 
                      value={metric.value} 
                      prefix={key === 'revenue' ? '$' : ''}
                      suffix={key === 'deliveryRate' || key === 'customerSatisfaction' ? 
                        (key === 'deliveryRate' ? '%' : '/5') : 
                        key === 'avgDeliveryTime' ? 'h' : ''
                      }
                    />
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="h-12">
                  {renderMiniChart(
                    chartData[key === 'totalShipments' ? 'shipments' : 
                             key === 'revenue' ? 'revenue' : 'deliveryTimes'], 
                    metric.color
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile-Responsive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Shipments Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shipments Over Time
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedTimeRange}
              </div>
            </div>
            
            <div className="h-48 sm:h-64 flex items-end space-x-1">
              {chartData.shipments.slice(-24).map((point, index) => {
                const maxValue = Math.max(...chartData.shipments.map(d => d.value));
                const height = (point.value / maxValue) * 100;
                
                return (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${point.value} shipments at ${point.timestamp.toLocaleTimeString()}`}
                  />
                );
              })}
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {chartData.shipments[0]?.timestamp.toLocaleTimeString() || ''}
              </span>
              <span>Now</span>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue Trend
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                USD
              </div>
            </div>
            
            <div className="h-48 sm:h-64 flex items-end space-x-1">
              {chartData.revenue.slice(-24).map((point, index) => {
                const maxValue = Math.max(...chartData.revenue.map(d => d.value));
                const height = (point.value / maxValue) * 100;
                
                return (
                  <div
                    key={index}
                    className="flex-1 bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600 cursor-pointer"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`$${point.value} at ${point.timestamp.toLocaleTimeString()}`}
                  />
                );
              })}
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {chartData.revenue[0]?.timestamp.toLocaleTimeString() || ''}
              </span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Mobile-Responsive Performance Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Summary
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                <AnimatedCounter value={metrics.deliveryRate.value} suffix="%" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</div>
              <div className="mt-2">
                <AnimatedProgressBar progress={metrics.deliveryRate.value} color="bg-blue-500" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                <AnimatedCounter value={metrics.customerSatisfaction.value} suffix="/5" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Customer Rating</div>
              <div className="mt-2">
                <AnimatedProgressBar progress={metrics.customerSatisfaction.value * 20} color="bg-green-500" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                <AnimatedCounter value={metrics.avgDeliveryTime.value} suffix="h" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery</div>
              <div className="mt-2">
                <AnimatedProgressBar progress={100 - (metrics.avgDeliveryTime.value * 10)} color="bg-purple-500" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                <AnimatedCounter value={metrics.activeVehicles.value} />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Fleet</div>
              <div className="mt-2">
                <AnimatedProgressBar progress={(metrics.activeVehicles.value / 200) * 100} color="bg-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
