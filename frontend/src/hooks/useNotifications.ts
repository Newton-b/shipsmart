import { useState, useEffect, useCallback, useRef } from 'react';

export interface Notification {
  id: string;
  type: 'shipment_update' | 'delivery_alert' | 'customs_clearance' | 'document_required' | 'payment_due' | 'system_alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: {
    trackingNumber?: string;
    shipmentId?: string;
    customerId?: string;
    documentId?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  recipients: string[];
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationFilters {
  type?: string;
  priority?: string;
  status?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (notification: Partial<Notification>) => Promise<void>;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  clearNotifications: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USER_ID = 'test-user-1'; // In a real app, this would come from auth context

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      setError(null);
      const eventSource = new EventSource(`${API_BASE}/notifications-test/stream/${USER_ID}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        console.log('✅ Connected to notification stream');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            // New notification received
            const notification = data.data;
            setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id,
              });
            }
          } else if (data.type === 'ping' || data.type === 'connected') {
            // Keep-alive ping
            console.log('📡 Received ping from server');
          } else {
            // Direct notification data
            setNotifications(prev => [data, ...prev.slice(0, 49)]);
            setUnreadCount(prev => prev + 1);
          }
        } catch (err) {
          console.error('Error parsing notification data:', err);
        }
      };

      eventSource.onerror = (event) => {
        console.error('❌ SSE connection error:', event);
        setIsConnected(false);
        setError('Connection lost. Attempting to reconnect...');
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect();
          }, delay);
        } else {
          setError('Unable to connect to notification service. Please refresh the page.');
        }
      };
    } catch (err) {
      console.error('Failed to connect to notification stream:', err);
      setError('Failed to connect to notification service');
      setIsConnected(false);
    }
  }, []);

  // Disconnect from SSE stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttempts.current = 0;
    console.log('🔌 Disconnected from notification stream');
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (filters: NotificationFilters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);
      if (filters.unreadOnly) params.append('unreadOnly', 'true');
      params.append('recipient', USER_ID);
      params.append('page', (filters.page || 1).toString());
      params.append('limit', (filters.limit || 20).toString());

      const response = await fetch(`${API_BASE}/notifications-test?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setNotifications(result.data || []);
      
      // Count unread notifications
      const unread = result.data?.filter((n: Notification) => !n.readAt).length || 0;
      setUnreadCount(unread);
      
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/notifications-test/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === id 
            ? { ...n, status: 'read' as const, readAt: new Date() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.readAt)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const response = await fetch(`${API_BASE}/notifications-test/read-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: unreadIds, userId: USER_ID }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notifications as read: ${response.statusText}`);
      }

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read' as const, readAt: new Date() }))
      );
      
      setUnreadCount(0);
      
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  }, [notifications]);

  // Create a new notification
  const createNotification = useCallback(async (notification: Partial<Notification>) => {
    try {
      const response = await fetch(`${API_BASE}/notifications-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'system_alert',
          priority: 'medium',
          recipients: [USER_ID],
          channels: ['in_app'],
          createdBy: USER_ID,
          ...notification,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create notification: ${response.statusText}`);
      }

      // Notification will be received via SSE, no need to update local state
      
    } catch (err) {
      console.error('Failed to create notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to create notification');
    }
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Auto-connect on mount and cleanup on unmount
  useEffect(() => {
    connect();
    fetchNotifications({ unreadOnly: false, limit: 20 });

    return () => {
      disconnect();
    };
  }, [connect, disconnect, fetchNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    createNotification,
    fetchNotifications,
    clearNotifications,
  };
};
