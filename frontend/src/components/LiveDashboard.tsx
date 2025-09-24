import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  Truck, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Activity,
  Users,
  DollarSign,
  BarChart3,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredToday: number;
  pendingAlerts: number;
  revenue: number;
  customers: number;
  onTimeDelivery: number;
  avgDeliveryTime: number;
}

interface RecentActivity {
  id: string;
  type: 'shipment' | 'delivery' | 'alert' | 'customer';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

const LiveDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 1247,
    activeShipments: 89,
    deliveredToday: 23,
    pendingAlerts: 5,
    revenue: 125430,
    customers: 342,
    onTimeDelivery: 94.2,
    avgDeliveryTime: 2.8
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { notifications, unreadCount, isConnected, createNotification } = useNotifications();

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Randomly update stats to simulate real-time changes
      setStats(prev => ({
        ...prev,
        activeShipments: prev.activeShipments + Math.floor(Math.random() * 3) - 1,
        deliveredToday: prev.deliveredToday + (Math.random() > 0.7 ? 1 : 0),
        pendingAlerts: Math.max(0, prev.pendingAlerts + Math.floor(Math.random() * 3) - 1),
        revenue: prev.revenue + Math.floor(Math.random() * 1000),
      }));

      // Add random activity
      if (Math.random() > 0.6) {
        const activities = [
          {
            type: 'shipment' as const,
            title: 'New Shipment Created',
            description: `Shipment #SHIP${Math.random().toString(36).substr(2, 6).toUpperCase()} from Los Angeles to New York`,
            status: 'info' as const
          },
          {
            type: 'delivery' as const,
            title: 'Package Delivered',
            description: `Package #DEL${Math.random().toString(36).substr(2, 6).toUpperCase()} delivered successfully`,
            status: 'success' as const
          },
          {
            type: 'alert' as const,
            title: 'Customs Delay',
            description: `Shipment held at customs - documentation required`,
            status: 'warning' as const
          },
          {
            type: 'customer' as const,
            title: 'New Customer Registration',
            description: `Customer ${Math.random().toString(36).substr(2, 8)} registered`,
            status: 'info' as const
          }
        ];

        const activity = activities[Math.floor(Math.random() * activities.length)];
        const newActivity: RecentActivity = {
          id: Math.random().toString(36).substr(2, 9),
          ...activity,
          timestamp: new Date()
        };

        setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
      }

      setLastUpdate(new Date());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  // Create test notifications
  const createTestNotification = async (type: string) => {
    const notifications = {
      shipment: {
        type: 'shipment_update' as const,
        priority: 'medium' as const,
        title: 'Shipment Update',
        message: `Your shipment #SHIP${Math.random().toString(36).substr(2, 6).toUpperCase()} is now in transit`,
        data: { trackingNumber: `SHIP${Math.random().toString(36).substr(2, 6).toUpperCase()}` }
      },
      delivery: {
        type: 'delivery_alert' as const,
        priority: 'high' as const,
        title: 'Delivery Alert',
        message: 'Your package is out for delivery and will arrive today',
        data: { trackingNumber: `DEL${Math.random().toString(36).substr(2, 6).toUpperCase()}` }
      },
      critical: {
        type: 'customs_clearance' as const,
        priority: 'critical' as const,
        title: 'URGENT: Action Required',
        message: 'Your shipment requires immediate customs clearance',
        data: { trackingNumber: `CUST${Math.random().toString(36).substr(2, 6).toUpperCase()}` }
      }
    };

    await createNotification(notifications[type as keyof typeof notifications]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shipment': return <Package className="w-4 h-4" />;
      case 'delivery': return <Truck className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <span>Live Dashboard</span>
              {isConnected && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-normal text-green-600">Live</span>
                </div>
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time insights into your shipping operations
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isLive 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isLive ? <Zap className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
              <span>{isLive ? 'Live Updates' : 'Paused'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalShipments.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Shipments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeShipments}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Truck className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Activity className="w-4 h-4 text-orange-500 mr-1 animate-pulse" />
            <span className="text-orange-600 font-medium">In Transit</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.deliveredToday}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Clock className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{stats.onTimeDelivery}%</span>
            <span className="text-gray-500 ml-1">on-time rate</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8.2%</span>
            <span className="text-gray-500 ml-1">this month</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </h2>
              {isLive && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live Updates</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here as it happens</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Quick Actions */}
        <div className="space-y-6">
          {/* Notification Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Notifications</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">Connection Status</p>
                  <p className="text-xs text-blue-700">
                    {isConnected ? 'Connected to live updates' : 'Disconnected'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Unread Notifications</p>
                  <p className="text-xs text-gray-600">{unreadCount} pending alerts</p>
                </div>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Quick Actions</span>
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => createTestNotification('shipment')}
                className="w-full flex items-center space-x-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Test Shipment Update</p>
                  <p className="text-xs text-blue-700">Create a test notification</p>
                </div>
              </button>
              
              <button
                onClick={() => createTestNotification('delivery')}
                className="w-full flex items-center space-x-3 p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Truck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Test Delivery Alert</p>
                  <p className="text-xs text-green-700">Simulate delivery notification</p>
                </div>
              </button>
              
              <button
                onClick={() => createTestNotification('critical')}
                className="w-full flex items-center space-x-3 p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">Test Critical Alert</p>
                  <p className="text-xs text-red-700">Create urgent notification</p>
                </div>
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">On-time Delivery</span>
                  <span className="font-medium">{stats.onTimeDelivery}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.onTimeDelivery}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Avg. Delivery Time</span>
                  <span className="font-medium">{stats.avgDeliveryTime} days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - (stats.avgDeliveryTime * 20))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
