import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle,
  Package,
  Truck,
  Ship,
  Plane,
  DollarSign,
  FileText,
  Settings,
  ExternalLink,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { useNotifications, Notification } from '../hooks/useNotifications';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  // Retry connection function
  const handleRetry = async () => {
    setIsRetrying(true);
    // Simulate reconnection attempt
    setTimeout(() => {
      setIsRetrying(false);
      // Force page refresh as a fallback
      window.location.reload();
    }, 2000);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    const iconProps = { className: "w-5 h-5" };
    switch (type) {
      case 'shipment_update': return <Ship {...iconProps} className="w-5 h-5 text-blue-600" />;
      case 'delivery_alert': return <Package {...iconProps} className="w-5 h-5 text-green-600" />;
      case 'customs_clearance': return <FileText {...iconProps} className="w-5 h-5 text-purple-600" />;
      case 'document_required': return <FileText {...iconProps} className="w-5 h-5 text-orange-600" />;
      case 'payment_due': return <DollarSign {...iconProps} className="w-5 h-5 text-red-600" />;
      case 'system_alert': return <AlertCircle {...iconProps} className="w-5 h-5 text-yellow-600" />;
      case 'fleet_update': return <Truck {...iconProps} className="w-5 h-5 text-indigo-600" />;
      case 'route_update': return <MapPin {...iconProps} className="w-5 h-5 text-teal-600" />;
      case 'user_action': return <User {...iconProps} className="w-5 h-5 text-gray-600" />;
      default: return <Bell {...iconProps} className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await markAsRead(notification.id);
    }
    
    // Navigate to action URL if available
    if (notification.data?.actionUrl) {
      window.open(notification.data.actionUrl, '_blank');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-blue-50 text-blue-600' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-6 h-6" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`} />
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {isConnected ? (
                  <div title="Connected">
                    <Wifi className="w-4 h-4 text-green-500" />
                  </div>
                ) : (
                  <div title="Disconnected">
                    <WifiOff className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Mark all read</span>
                  </button>
                )}
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">
                      {error.includes('Connection lost') ? 'Connection lost. Attempting to reconnect...' : error}
                    </span>
                  </div>
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="relative">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <p className="text-lg font-medium text-gray-700">All caught up!</p>
                <p className="text-sm text-gray-500 mb-4">No new notifications at the moment</p>
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Connected</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Real-time updates</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.readAt ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Type Icon */}
                      <div className="flex-shrink-0 p-2 rounded-full bg-gray-100">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold truncate ${
                              !notification.readAt ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                              {/* Priority Badge */}
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${
                                getPriorityColor(notification.priority)
                              }`}>
                                {notification.priority}
                              </span>
                            </div>
                          </div>
                          
                          {!notification.readAt && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* Enhanced Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {notification.data?.trackingNumber && (
                              <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-mono">
                                📦 {notification.data.trackingNumber}
                              </span>
                            )}
                            {notification.data?.location && (
                              <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                                📍 {notification.data.location}
                              </span>
                            )}
                            {notification.data?.amount && (
                              <span className="inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-md">
                                💰 ${notification.data.amount}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {notification.data?.actionUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(notification.data?.actionUrl, '_blank');
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                title="Open link"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                            {!notification.readAt && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear all</span>
                  </button>
                )}
                <button
                  onClick={() => window.location.href = '/notifications'}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Settings className="w-3 h-3" />
                  <span>View all</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>{isConnected ? 'Live' : 'Offline'}</span>
                </div>
                {notifications.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{notifications.length} total</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
