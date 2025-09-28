import React, { useState, useEffect } from 'react';
import {
  Package, TrendingUp, DollarSign, Clock, MapPin, Bell,
  Activity, Users, Truck, Ship, Plane, AlertTriangle,
  CheckCircle, XCircle, BarChart3, PieChart, Calendar,
  Filter, Search, RefreshCw, Eye, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useEnhancedAuth } from '../contexts/EnhancedAuthContext';

interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
}

interface RecentActivity {
  id: string;
  type: 'shipment' | 'payment' | 'alert' | 'update';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
  actionUrl?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  isNew?: boolean;
}

export const MobileDashboard: React.FC = () => {
  const { user, hasPermission } = useEnhancedAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [dashboardData, setDashboardData] = useState<DashboardCard[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  // Generate role-specific dashboard data
  useEffect(() => {
    generateDashboardData();
    generateRecentActivity();
    generateQuickActions();
  }, [user?.role, timeRange]);

  const generateDashboardData = () => {
    const baseCards: DashboardCard[] = [];

    switch (user?.role) {
      case 'system_administrator':
        baseCards.push(
          {
            id: 'total-users',
            title: 'Total Users',
            value: '1,247',
            change: 12.5,
            changeType: 'increase',
            icon: Users,
            color: 'bg-blue-500',
            subtitle: '+156 this month'
          },
          {
            id: 'active-shipments',
            title: 'Active Shipments',
            value: '3,892',
            change: 8.3,
            changeType: 'increase',
            icon: Package,
            color: 'bg-green-500',
            subtitle: 'Across all carriers'
          },
          {
            id: 'revenue',
            title: 'Monthly Revenue',
            value: '$847,230',
            change: 15.2,
            changeType: 'increase',
            icon: DollarSign,
            color: 'bg-purple-500',
            subtitle: 'vs last month'
          },
          {
            id: 'system-health',
            title: 'System Health',
            value: '99.8%',
            change: 0.1,
            changeType: 'increase',
            icon: Activity,
            color: 'bg-emerald-500',
            subtitle: 'Uptime'
          }
        );
        break;

      case 'shipper':
        baseCards.push(
          {
            id: 'active-shipments',
            title: 'Active Shipments',
            value: '24',
            change: 20,
            changeType: 'increase',
            icon: Package,
            color: 'bg-blue-500',
            subtitle: '6 in transit'
          },
          {
            id: 'pending-quotes',
            title: 'Pending Quotes',
            value: '8',
            change: -12.5,
            changeType: 'decrease',
            icon: Clock,
            color: 'bg-orange-500',
            subtitle: 'Awaiting response'
          },
          {
            id: 'monthly-spend',
            title: 'Monthly Spend',
            value: '$12,450',
            change: 8.7,
            changeType: 'increase',
            icon: DollarSign,
            color: 'bg-green-500',
            subtitle: 'vs last month'
          },
          {
            id: 'on-time-delivery',
            title: 'On-Time Rate',
            value: '94.2%',
            change: 2.1,
            changeType: 'increase',
            icon: CheckCircle,
            color: 'bg-emerald-500',
            subtitle: 'Last 30 days'
          }
        );
        break;

      case 'carrier':
        baseCards.push(
          {
            id: 'fleet-utilization',
            title: 'Fleet Utilization',
            value: '87%',
            change: 5.2,
            changeType: 'increase',
            icon: Truck,
            color: 'bg-blue-500',
            subtitle: '142/163 vehicles'
          },
          {
            id: 'active-routes',
            title: 'Active Routes',
            value: '89',
            change: 12,
            changeType: 'increase',
            icon: MapPin,
            color: 'bg-purple-500',
            subtitle: 'Across regions'
          },
          {
            id: 'revenue',
            title: 'Weekly Revenue',
            value: '$45,230',
            change: 7.8,
            changeType: 'increase',
            icon: DollarSign,
            color: 'bg-green-500',
            subtitle: 'vs last week'
          },
          {
            id: 'driver-satisfaction',
            title: 'Driver Rating',
            value: '4.8',
            change: 0.2,
            changeType: 'increase',
            icon: Users,
            color: 'bg-yellow-500',
            subtitle: 'Average rating'
          }
        );
        break;

      case 'driver':
        baseCards.push(
          {
            id: 'todays-deliveries',
            title: "Today's Deliveries",
            value: '8',
            change: 0,
            changeType: 'neutral',
            icon: Package,
            color: 'bg-blue-500',
            subtitle: '3 completed'
          },
          {
            id: 'route-progress',
            title: 'Route Progress',
            value: '67%',
            change: 0,
            changeType: 'neutral',
            icon: MapPin,
            color: 'bg-green-500',
            subtitle: '4.2 hrs remaining'
          },
          {
            id: 'weekly-earnings',
            title: 'Weekly Earnings',
            value: '$1,240',
            change: 15.3,
            changeType: 'increase',
            icon: DollarSign,
            color: 'bg-purple-500',
            subtitle: 'vs last week'
          },
          {
            id: 'safety-score',
            title: 'Safety Score',
            value: '98',
            change: 2,
            changeType: 'increase',
            icon: CheckCircle,
            color: 'bg-emerald-500',
            subtitle: 'Out of 100'
          }
        );
        break;

      default:
        baseCards.push(
          {
            id: 'shipments',
            title: 'Shipments',
            value: '156',
            change: 12.5,
            changeType: 'increase',
            icon: Package,
            color: 'bg-blue-500'
          },
          {
            id: 'revenue',
            title: 'Revenue',
            value: '$23,450',
            change: 8.3,
            changeType: 'increase',
            icon: DollarSign,
            color: 'bg-green-500'
          }
        );
    }

    setDashboardData(baseCards);
  };

  const generateRecentActivity = () => {
    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'shipment',
        title: 'Shipment Delivered',
        description: 'Package #SH-2024-001234 delivered to New York',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'success'
      },
      {
        id: '2',
        type: 'alert',
        title: 'Route Delay',
        description: 'Route NYC-LAX delayed by 2 hours due to weather',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'warning'
      },
      {
        id: '3',
        type: 'payment',
        title: 'Payment Received',
        description: 'Invoice #INV-2024-5678 paid - $2,450.00',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'success'
      },
      {
        id: '4',
        type: 'update',
        title: 'System Update',
        description: 'New tracking features now available',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'info'
      }
    ];

    setRecentActivity(activities);
  };

  const generateQuickActions = () => {
    const actions: QuickAction[] = [];

    if (hasPermission('shipments', 'create')) {
      actions.push({
        id: 'create-shipment',
        title: 'Create Shipment',
        description: 'Start a new shipment',
        icon: Package,
        color: 'bg-blue-500',
        action: () => console.log('Create shipment'),
        isNew: true
      });
    }

    if (hasPermission('quotes', 'create')) {
      actions.push({
        id: 'get-quote',
        title: 'Get Quote',
        description: 'Request shipping rates',
        icon: DollarSign,
        color: 'bg-green-500',
        action: () => console.log('Get quote')
      });
    }

    if (hasPermission('tracking', 'read')) {
      actions.push({
        id: 'track-shipment',
        title: 'Track Shipment',
        description: 'Track your packages',
        icon: MapPin,
        color: 'bg-purple-500',
        action: () => console.log('Track shipment')
      });
    }

    actions.push({
      id: 'support',
      title: 'Get Support',
      description: '24/7 customer service',
      icon: Bell,
      color: 'bg-orange-500',
      action: () => console.log('Contact support')
    });

    setQuickActions(actions);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    generateDashboardData();
    generateRecentActivity();
    setIsRefreshing(false);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'shipment':
        return status === 'success' ? CheckCircle : Package;
      case 'payment':
        return DollarSign;
      case 'alert':
        return AlertTriangle;
      case 'update':
        return Bell;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500 bg-green-50';
      case 'warning': return 'text-yellow-500 bg-yellow-50';
      case 'error': return 'text-red-500 bg-red-50';
      case 'info': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 text-sm">
                {user?.role?.replace('_', ' ')} Dashboard
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full bg-blue-500 text-white transition-all ${
                isRefreshing ? 'animate-spin' : 'hover:bg-blue-600'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex space-x-2 overflow-x-auto">
            {['24h', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === '24h' ? 'Today' : 
                 range === '7d' ? 'This Week' :
                 range === '30d' ? 'This Month' : 'Last 3 Months'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {dashboardData.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex items-center text-xs font-medium ${
                    card.changeType === 'increase' ? 'text-green-600' :
                    card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.changeType === 'increase' ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : card.changeType === 'decrease' ? (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    ) : null}
                    {card.change !== 0 && `${Math.abs(card.change)}%`}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {card.title}
                  </div>
                  {card.subtitle && (
                    <div className="text-xs text-gray-500 mt-1">
                      {card.subtitle}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="relative p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-left group"
                >
                  {action.isNew && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      NEW
                    </span>
                  )}
                  <div className={`p-2 rounded-lg ${action.color} mb-3 inline-block`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {action.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {action.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-blue-500 text-sm font-medium hover:text-blue-600">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type, activity.status);
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {activity.title}
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {activity.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                  {activity.actionUrl && (
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <BarChart3 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <PieChart className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <div className="text-gray-600 font-medium">Interactive Charts</div>
              <div className="text-gray-500 text-sm">Coming Soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
