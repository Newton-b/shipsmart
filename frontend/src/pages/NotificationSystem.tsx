import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  MoreVertical, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Truck, 
  Package, 
  Clock, 
  MapPin,
  User,
  Calendar,
  Settings,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'shipment' | 'delivery' | 'delay' | 'customs' | 'payment' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  shipmentId?: string;
  customerId?: string;
  metadata?: {
    location?: string;
    estimatedDelivery?: string;
    delayReason?: string;
    amount?: string;
  };
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  shipmentUpdates: boolean;
  deliveryAlerts: boolean;
  delayNotifications: boolean;
  customsAlerts: boolean;
  paymentReminders: boolean;
  systemUpdates: boolean;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    shipmentUpdates: true,
    deliveryAlerts: true,
    delayNotifications: true,
    customsAlerts: true,
    paymentReminders: false,
    systemUpdates: true
  });

  // Mock data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'shipment',
        priority: 'high',
        title: 'Shipment SHIP001 Departed',
        message: 'Your shipment has departed from Los Angeles Port and is en route to Shanghai.',
        timestamp: '2024-01-16T10:30:00Z',
        read: false,
        actionRequired: false,
        shipmentId: 'SHIP001',
        customerId: 'CUST001',
        metadata: {
          location: 'Los Angeles Port',
          estimatedDelivery: '2024-01-25'
        }
      },
      {
        id: '2',
        type: 'delay',
        priority: 'urgent',
        title: 'Shipment SHIP002 Delayed',
        message: 'Shipment delayed due to customs inspection. New ETA: Jan 20, 2024.',
        timestamp: '2024-01-16T09:15:00Z',
        read: false,
        actionRequired: true,
        shipmentId: 'SHIP002',
        customerId: 'CUST002',
        metadata: {
          location: 'Hamburg Port',
          estimatedDelivery: '2024-01-20',
          delayReason: 'Customs inspection'
        }
      },
      {
        id: '3',
        type: 'delivery',
        priority: 'medium',
        title: 'Delivery Completed - SHIP003',
        message: 'Package successfully delivered to recipient at 123 Main St, New York.',
        timestamp: '2024-01-16T08:45:00Z',
        read: true,
        actionRequired: false,
        shipmentId: 'SHIP003',
        customerId: 'CUST003',
        metadata: {
          location: '123 Main St, New York'
        }
      },
      {
        id: '4',
        type: 'customs',
        priority: 'high',
        title: 'Customs Documentation Required',
        message: 'Additional customs documentation needed for shipment SHIP004.',
        timestamp: '2024-01-16T07:20:00Z',
        read: false,
        actionRequired: true,
        shipmentId: 'SHIP004',
        customerId: 'CUST004'
      },
      {
        id: '5',
        type: 'payment',
        priority: 'medium',
        title: 'Payment Reminder',
        message: 'Invoice #INV-2024-001 is due in 3 days. Amount: $2,450.00',
        timestamp: '2024-01-15T16:30:00Z',
        read: true,
        actionRequired: true,
        customerId: 'CUST001',
        metadata: {
          amount: '$2,450.00'
        }
      },
      {
        id: '6',
        type: 'system',
        priority: 'low',
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance on Jan 18, 2024 from 2:00 AM - 4:00 AM EST.',
        timestamp: '2024-01-15T14:00:00Z',
        read: true,
        actionRequired: false
      }
    ];
    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
  }, []);

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.shipmentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(notification => notification.priority === priorityFilter);
    }

    if (readFilter !== 'all') {
      const isRead = readFilter === 'read';
      filtered = filtered.filter(notification => notification.read === isRead);
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, priorityFilter, readFilter]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'shipment': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivery': return <Package className="w-5 h-5 text-green-500" />;
      case 'delay': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'customs': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'payment': return <User className="w-5 h-5 text-purple-500" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Bell className="w-8 h-8" />
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with real-time shipment and system notifications
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={markAllAsRead}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark All Read
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="shipment">Shipment</option>
                <option value="delivery">Delivery</option>
                <option value="delay">Delay</option>
                <option value="customs">Customs</option>
                <option value="payment">Payment</option>
                <option value="system">System</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 p-6 transition-all hover:shadow-md ${
                notification.read 
                  ? 'border-l-gray-300 dark:border-l-gray-600' 
                  : 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                        {notification.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority.toUpperCase()}
                      </span>
                      {notification.actionRequired && (
                        <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
                          Action Required
                        </span>
                      )}
                    </div>
                    
                    <p className={`mb-3 ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatTimestamp(notification.timestamp)}
                      </div>
                      {notification.shipmentId && (
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {notification.shipmentId}
                        </div>
                      )}
                      {notification.metadata?.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {notification.metadata.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or check back later for new updates.
            </p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notification Settings
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Delivery Methods
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Email notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">SMS notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Push notifications</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Notification Types
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.shipmentUpdates}
                      onChange={(e) => setSettings({...settings, shipmentUpdates: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Shipment updates</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.deliveryAlerts}
                      onChange={(e) => setSettings({...settings, deliveryAlerts: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Delivery alerts</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.delayNotifications}
                      onChange={(e) => setSettings({...settings, delayNotifications: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Delay notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.customsAlerts}
                      onChange={(e) => setSettings({...settings, customsAlerts: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Customs alerts</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.paymentReminders}
                      onChange={(e) => setSettings({...settings, paymentReminders: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">Payment reminders</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.systemUpdates}
                      onChange={(e) => setSettings({...settings, systemUpdates: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">System updates</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { NotificationSystem };
