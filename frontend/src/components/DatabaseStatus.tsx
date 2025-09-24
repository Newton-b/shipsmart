import React, { useState } from 'react';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Zap,
  Clock,
  Users,
  BarChart3,
  Package,
  Navigation,
  CreditCard,
  MessageCircle,
  Bell
} from 'lucide-react';
import { useDatabaseConnection, useDatabaseEvents } from '../hooks/useRealtimeDatabase';
import { DatabaseRecord } from '../services/RealtimeDatabase';
import { AnimatedCounter, PulsingDots } from './AnimatedElements';

interface DatabaseStatusProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({
  className = "",
  showDetails = false,
  compact = false
}) => {
  const { connected, reconnectAttempts } = useDatabaseConnection();
  const [recentEvents, setRecentEvents] = useState<DatabaseRecord[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);

  // Listen to all database events
  useDatabaseEvents(
    [
      'shipment_created',
      'shipment_updated',
      'vehicle_location_updated',
      'driver_status_changed',
      'payment_processed',
      'message_sent',
      'notification_created',
      'analytics_updated',
      'prediction_generated',
      'recommendation_created'
    ],
    (record) => {
      setRecentEvents(prev => [record, ...prev.slice(0, 9)]); // Keep last 10 events
      setEventCount(prev => prev + 1);
      setLastEventTime(new Date());
    }
  );

  const getStatusColor = () => {
    if (connected) return 'text-green-500';
    if (reconnectAttempts > 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (connected) return <Wifi className="w-4 h-4" />;
    if (reconnectAttempts > 0) return <RefreshCw className="w-4 h-4 animate-spin" />;
    return <WifiOff className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (connected) return 'Connected';
    if (reconnectAttempts > 0) return `Reconnecting... (${reconnectAttempts})`;
    return 'Disconnected';
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'shipment_created':
      case 'shipment_updated':
        return <Package className="w-3 h-3 text-blue-500" />;
      case 'vehicle_location_updated':
        return <Navigation className="w-3 h-3 text-green-500" />;
      case 'driver_status_changed':
        return <Users className="w-3 h-3 text-orange-500" />;
      case 'payment_processed':
        return <CreditCard className="w-3 h-3 text-purple-500" />;
      case 'message_sent':
        return <MessageCircle className="w-3 h-3 text-indigo-500" />;
      case 'notification_created':
        return <Bell className="w-3 h-3 text-yellow-500" />;
      case 'analytics_updated':
        return <BarChart3 className="w-3 h-3 text-pink-500" />;
      case 'prediction_generated':
      case 'recommendation_created':
        return <Zap className="w-3 h-3 text-cyan-500" />;
      default:
        return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </div>
        {connected && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <Activity className="w-3 h-3" />
            <AnimatedCounter value={eventCount} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Real-time Database
          </h3>
        </div>
        
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            {connected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Status</div>
          <div className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? 'Online' : 'Offline'}
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Events</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            <AnimatedCounter value={eventCount} />
          </div>
        </div>
      </div>

      {/* Last Activity */}
      {lastEventTime && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">
              Last activity: {lastEventTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Recent Events */}
      {showDetails && recentEvents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Recent Events
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentEvents.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div className="flex-shrink-0">
                  {getEventIcon(event.event)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {event.event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {event.collection} • {event.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {connected && (
                  <div className="flex-shrink-0">
                    <PulsingDots />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Issues */}
      {!connected && reconnectAttempts > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Attempting to reconnect... ({reconnectAttempts}/5)
            </span>
          </div>
        </div>
      )}

      {/* Offline Warning */}
      {!connected && reconnectAttempts === 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800 dark:text-red-200">
              Database connection lost. Some features may not work properly.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
