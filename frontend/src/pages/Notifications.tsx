import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Settings, Check, X, Clock, Package, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NotificationPreference {
  id: string;
  category: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: string;
}

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'preferences' | 'history'>('preferences');

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: '1',
      category: 'Shipments',
      title: 'Shipment Updates',
      description: 'Get notified when your shipments change status',
      email: true,
      push: true,
      sms: false
    },
    {
      id: '2',
      category: 'Shipments',
      title: 'Delivery Confirmations',
      description: 'Receive notifications when packages are delivered',
      email: true,
      push: true,
      sms: true
    },
    {
      id: '3',
      category: 'Shipments',
      title: 'Delay Alerts',
      description: 'Get alerted when shipments are delayed',
      email: true,
      push: true,
      sms: true
    },
    {
      id: '4',
      category: 'Account',
      title: 'Account Security',
      description: 'Security alerts and login notifications',
      email: true,
      push: false,
      sms: true
    },
    {
      id: '5',
      category: 'Account',
      title: 'Profile Updates',
      description: 'Confirmations for profile and settings changes',
      email: true,
      push: false,
      sms: false
    },
    {
      id: '6',
      category: 'Marketing',
      title: 'Promotional Offers',
      description: 'Special deals and promotional content',
      email: false,
      push: false,
      sms: false
    },
    {
      id: '7',
      category: 'Marketing',
      title: 'Newsletter',
      description: 'Monthly newsletter with industry updates',
      email: false,
      push: false,
      sms: false
    },
    {
      id: '8',
      category: 'System',
      title: 'System Maintenance',
      description: 'Scheduled maintenance and system updates',
      email: true,
      push: false,
      sms: false
    }
  ]);

  const [notifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'success',
      title: 'Shipment Delivered',
      message: 'Your shipment SS2024001234 has been successfully delivered to New York, NY',
      timestamp: '2024-01-18T14:30:00Z',
      read: false,
      category: 'Shipments'
    },
    {
      id: '2',
      type: 'info',
      title: 'Shipment Update',
      message: 'Your shipment SS2024001235 is now in transit from Los Angeles',
      timestamp: '2024-01-18T10:15:00Z',
      read: true,
      category: 'Shipments'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Delivery Delay',
      message: 'Your shipment SS2024001236 has been delayed due to weather conditions',
      timestamp: '2024-01-17T16:45:00Z',
      read: false,
      category: 'Shipments'
    },
    {
      id: '4',
      type: 'info',
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated',
      timestamp: '2024-01-16T09:20:00Z',
      read: true,
      category: 'Account'
    },
    {
      id: '5',
      type: 'info',
      title: 'New Login',
      message: 'New login detected from Chrome on Windows',
      timestamp: '2024-01-15T18:30:00Z',
      read: true,
      category: 'Account'
    }
  ]);

  const updatePreference = (id: string, channel: 'email' | 'push' | 'sms', value: boolean) => {
    setPreferences(prev => prev.map(pref => 
      pref.id === id ? { ...pref, [channel]: value } : pref
    ));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, NotificationPreference[]>);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your notification preferences and view notification history
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Preferences</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>History</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                {Object.entries(groupedPreferences).map(([category, prefs]) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{category}</h3>
                    <div className="space-y-4">
                      {prefs.map((pref) => (
                        <div key={pref.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{pref.title}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{pref.description}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                              </div>
                              <button
                                onClick={() => updatePreference(pref.id, 'email', !pref.email)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  pref.email ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  pref.email ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Bell className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Push</span>
                              </div>
                              <button
                                onClick={() => updatePreference(pref.id, 'push', !pref.push)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  pref.push ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  pref.push ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Smartphone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                              </div>
                              <button
                                onClick={() => updatePreference(pref.id, 'sms', !pref.sms)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  pref.sms ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  pref.sms ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You don't have any notifications yet.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 ${getNotificationBg(notification.type)} ${
                        !notification.read ? 'border-l-4' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(notification.timestamp)}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                              {notification.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
