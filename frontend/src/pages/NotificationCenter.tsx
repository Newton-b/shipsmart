import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Filter, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Trash2,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Archive,
  Star,
  Zap,
  TrendingUp,
  BarChart3,
  Activity,
  Package,
  Truck,
  Ship,
  DollarSign,
  FileText,
  MapPin,
  User,
  Calendar,
  Download,
  ExternalLink,
  Wifi,
  WifiOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useNotifications, Notification, NotificationFilters } from '../hooks/useNotifications';

const NotificationCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    clearNotifications,
    createNotification
  } = useNotifications();

  // Fetch notifications on component mount and when filters change
  useEffect(() => {
    const filters: NotificationFilters = {
      page: 1,
      limit: 50
    };

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unread') {
        filters.unreadOnly = true;
      } else {
        filters.status = selectedFilter;
      }
    }

    if (selectedPriority !== 'all') {
      filters.priority = selectedPriority;
    }

    fetchNotifications(filters);
  }, [selectedFilter, selectedPriority, fetchNotifications]);

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (notification.data?.trackingNumber && 
     notification.data.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    for (const id of selectedNotifications) {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.readAt) {
        await markAsRead(id);
      }
    }
    setSelectedNotifications([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    const iconProps = { className: "w-6 h-6" };
    switch (type) {
      case 'shipment_update': return <Ship {...iconProps} className="w-6 h-6 text-blue-600" />;
      case 'delivery_alert': return <Package {...iconProps} className="w-6 h-6 text-green-600" />;
      case 'customs_clearance': return <FileText {...iconProps} className="w-6 h-6 text-purple-600" />;
      case 'document_required': return <FileText {...iconProps} className="w-6 h-6 text-orange-600" />;
      case 'payment_due': return <DollarSign {...iconProps} className="w-6 h-6 text-red-600" />;
      case 'system_alert': return <AlertCircle {...iconProps} className="w-6 h-6 text-yellow-600" />;
      case 'fleet_update': return <Truck {...iconProps} className="w-6 h-6 text-indigo-600" />;
      case 'route_update': return <MapPin {...iconProps} className="w-6 h-6 text-teal-600" />;
      case 'user_action': return <User {...iconProps} className="w-6 h-6 text-gray-600" />;
      default: return <Bell {...iconProps} className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
  };

  const createTestNotifications = async () => {
    const testNotifications = [
      {
        type: 'shipment_update' as const,
        priority: 'medium' as const,
        title: 'Shipment Departed',
        message: 'Your shipment has departed from Los Angeles and is en route to New York',
        data: { trackingNumber: `SHIP${Math.random().toString(36).substr(2, 6).toUpperCase()}` }
      },
      {
        type: 'delivery_alert' as const,
        priority: 'high' as const,
        title: 'Out for Delivery',
        message: 'Your package is out for delivery and will arrive today between 2-6 PM',
        data: { trackingNumber: `DEL${Math.random().toString(36).substr(2, 6).toUpperCase()}` }
      },
      {
        type: 'customs_clearance' as const,
        priority: 'critical' as const,
        title: 'Customs Documentation Required',
        message: 'Your shipment is held at customs. Please provide additional documentation within 48 hours.',
        data: { trackingNumber: `CUST${Math.random().toString(36).substr(2, 6).toUpperCase()}` }
      }
    ];

    for (const notification of testNotifications) {
      await createNotification(notification);
      // Add small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell className="w-8 h-8 text-blue-600" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Notification Center
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage your shipping notifications and alerts • {notifications.length} total
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                    <Wifi className="w-4 h-4 text-green-600" />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Live Updates
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900 rounded-full">
                    <WifiOff className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      Offline
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                  {autoRefresh ? <Play className="w-4 h-4 text-blue-600" /> : <Pause className="w-4 h-4 text-blue-600" />}
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Auto-refresh {autoRefresh ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showAnalytics 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
              
              <button
                onClick={createTestNotifications}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Generate Test</span>
              </button>
              
              <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-l-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-r-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <span>Notification Analytics</span>
              </h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Notification Types Chart */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Types Distribution</h3>
                <div className="space-y-3">
                  {[
                    { type: 'shipment_update', count: 45, color: 'bg-blue-500' },
                    { type: 'delivery_alert', count: 32, color: 'bg-green-500' },
                    { type: 'payment_due', count: 18, color: 'bg-red-500' },
                    { type: 'system_alert', count: 12, color: 'bg-yellow-500' }
                  ].map(({ type, count, color }) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Priority Distribution */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Priority Levels</h3>
                <div className="space-y-3">
                  {[
                    { priority: 'critical', count: 8, color: 'bg-purple-500' },
                    { priority: 'high', count: 23, color: 'bg-red-500' },
                    { priority: 'medium', count: 56, color: 'bg-yellow-500' },
                    { priority: 'low', count: 20, color: 'bg-green-500' }
                  ].map(({ priority, count, color }) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{priority}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Response Times */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Response Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Avg. Read Time</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">2.5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Read Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Action Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">64%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Peak Hour</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">2-4 PM</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Trend Chart */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Weekly Trend</h3>
              <div className="h-32 flex items-end justify-between space-x-2">
                {[65, 78, 82, 90, 85, 92, 88].map((height, index) => (
                  <div key={index} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${height}%` }}>
                    <div className="w-full h-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Notifications</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{notifications.length}</p>
                <div className="flex items-center mt-2 text-xs text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+12% this week</span>
                </div>
              </div>
              <div className="relative">
                <Bell className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Unread</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{unreadCount}</p>
                <div className="flex items-center mt-2 text-xs text-orange-600 dark:text-orange-400">
                  <Activity className="w-3 h-3 mr-1" />
                  <span>Requires attention</span>
                </div>
              </div>
              <div className="relative">
                <EyeOff className="w-12 h-12 text-orange-600 dark:text-orange-400" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 rounded-full animate-bounce"></div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6 border border-red-200 dark:border-red-700 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical Priority</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                  {notifications.filter(n => n.priority === 'critical').length}
                </p>
                <div className="flex items-center mt-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>Immediate action needed</span>
                </div>
              </div>
              <div className="relative">
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                {notifications.filter(n => n.priority === 'critical').length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-ping"></div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Today's Activity</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {notifications.filter(n => {
                    const today = new Date();
                    const notificationDate = new Date(n.createdAt);
                    return notificationDate.toDateString() === today.toDateString();
                  }).length}
                </p>
                <div className="flex items-center mt-2 text-xs text-green-600 dark:text-green-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Last updated now</span>
                </div>
              </div>
              <div className="relative">
                <Calendar className="w-12 h-12 text-green-600 dark:text-green-400" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status Filter
                </label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority Filter
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
              </span>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Read</span>
                </button>
                
                <button
                  onClick={() => setSelectedNotifications([])}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <span>Clear Selection</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* List Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
                
                <button
                  onClick={() => fetchNotifications()}
                  disabled={isLoading}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedFilter !== 'all' || selectedPriority !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'You\'re all caught up! New notifications will appear here.'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.readAt ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    <div className="flex-shrink-0 p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-medium ${
                          !notification.readAt 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            getPriorityColor(notification.priority)
                          }`}>
                            {notification.priority}
                          </span>
                          
                          {!notification.readAt && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {notification.message}
                      </p>
                      
                      {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {notification.data.trackingNumber && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Tracking:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">
                                  {notification.data.trackingNumber}
                                </span>
                              </div>
                            )}
                            {notification.data.location && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                                <span className="ml-2 text-gray-600 dark:text-gray-400">
                                  {notification.data.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                          <span>{formatTime(notification.createdAt)}</span>
                          <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                          {notification.readAt && (
                            <span className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              <span>Read</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {notification.data?.actionUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(notification.data?.actionUrl, '_blank');
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Open related page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Archive notification
                            }}
                            className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Archive notification"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Star notification
                            }}
                            className="p-1 text-gray-600 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                            title="Star notification"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Delete notification
                            }}
                            className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
