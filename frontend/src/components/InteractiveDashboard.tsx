import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  Ship, 
  Plane, 
  Truck, 
  DollarSign, 
  Users, 
  Globe,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Bell
} from 'lucide-react';
import { InteractiveButton } from './InteractiveButton';

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface DashboardProps {
  title?: string;
  metrics?: DashboardMetric[];
  showFilters?: boolean;
  showExport?: boolean;
  refreshInterval?: number;
  onRefresh?: () => Promise<void>;
  onExport?: () => Promise<void>;
  onMetricClick?: (metricId: string) => void;
}

const defaultMetrics: DashboardMetric[] = [
  {
    id: 'total-shipments',
    title: 'Total Shipments',
    value: 1247,
    change: 12.5,
    changeType: 'increase',
    icon: Package,
    color: 'blue',
    description: 'Active shipments this month'
  },
  {
    id: 'revenue',
    title: 'Revenue',
    value: '$2.4M',
    change: 8.2,
    changeType: 'increase',
    icon: DollarSign,
    color: 'green',
    description: 'Monthly revenue growth'
  },
  {
    id: 'on-time-delivery',
    title: 'On-Time Delivery',
    value: '98.5%',
    change: 2.1,
    changeType: 'increase',
    icon: CheckCircle,
    color: 'emerald',
    description: 'Delivery performance rate'
  },
  {
    id: 'active-routes',
    title: 'Active Routes',
    value: 156,
    change: -3.2,
    changeType: 'decrease',
    icon: Globe,
    color: 'purple',
    description: 'Currently active shipping routes'
  }
];

export const InteractiveDashboard: React.FC<DashboardProps> = ({
  title = 'Dashboard Overview',
  metrics = defaultMetrics,
  showFilters = true,
  showExport = true,
  refreshInterval = 30000,
  onRefresh,
  onExport,
  onMetricClick
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [animatedMetrics, setAnimatedMetrics] = useState(metrics);

  useEffect(() => {
    // Auto-refresh functionality
    if (refreshInterval > 0) {
      const interval = setInterval(async () => {
        await handleRefresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  useEffect(() => {
    // Animate metrics on load
    const timer = setTimeout(() => {
      setAnimatedMetrics(metrics);
    }, 100);

    return () => clearTimeout(timer);
  }, [metrics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    if (onExport) {
      await onExport();
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      emerald: 'bg-emerald-500 text-white',
      purple: 'bg-purple-500 text-white',
      red: 'bg-red-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      indigo: 'bg-indigo-500 text-white'
    };
    return colorMap[color] || 'bg-gray-500 text-white';
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decrease':
        return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {showFilters && (
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          )}
          
          <InteractiveButton
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            icon={RefreshCw}
            disabled={isRefreshing}
            className={isRefreshing ? 'animate-spin' : ''}
          >
            Refresh
          </InteractiveButton>
          
          {showExport && (
            <InteractiveButton
              onClick={handleExport}
              variant="primary"
              size="sm"
              icon={Download}
            >
              Export
            </InteractiveButton>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {animatedMetrics.map((metric, index) => (
          <div
            key={metric.id}
            onClick={() => onMetricClick?.(metric.id)}
            className={`
              bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer
              transform transition-all duration-300 hover:scale-105 hover:shadow-xl
              ${onMetricClick ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-1">
                {getChangeIcon(metric.changeType)}
                <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InteractiveButton
            variant="outline"
            size="sm"
            icon={Package}
            className="justify-center"
          >
            New Shipment
          </InteractiveButton>
          <InteractiveButton
            variant="outline"
            size="sm"
            icon={Eye}
            className="justify-center"
          >
            Track Package
          </InteractiveButton>
          <InteractiveButton
            variant="outline"
            size="sm"
            icon={BarChart3}
            className="justify-center"
          >
            View Reports
          </InteractiveButton>
          <InteractiveButton
            variant="outline"
            size="sm"
            icon={Bell}
            className="justify-center"
          >
            Notifications
          </InteractiveButton>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <InteractiveButton
            variant="outline"
            size="sm"
            className="text-xs"
          >
            View All
          </InteractiveButton>
        </div>
        
        <div className="space-y-4">
          {[
            { icon: Ship, text: 'Ocean freight shipment #SF-2024-001 departed from Shanghai', time: '2 hours ago', status: 'success' },
            { icon: Plane, text: 'Air cargo #AC-2024-045 arrived at Los Angeles', time: '4 hours ago', status: 'success' },
            { icon: Truck, text: 'Ground delivery #GD-2024-123 out for delivery', time: '6 hours ago', status: 'warning' },
            { icon: AlertTriangle, text: 'Customs delay for shipment #SF-2024-002', time: '8 hours ago', status: 'error' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className={`p-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-100 text-green-600' :
                activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                activity.status === 'error' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">{activity.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
