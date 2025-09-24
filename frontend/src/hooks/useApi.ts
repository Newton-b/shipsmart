import { useState, useEffect, useCallback } from 'react';
import { 
  AuthService, 
  ShipmentService, 
  PaymentService, 
  CarrierService, 
  AnalyticsService, 
  NotificationService, 
  UserService,
  webSocketService 
} from '../services/api';

// Generic API hook for handling loading states and errors
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.login(email, password);
      
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      // Connect to WebSocket
      webSocketService.connect(response.access_token);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await AuthService.register(userData);
      
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      // Connect to WebSocket
      webSocketService.connect(response.access_token);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    webSocketService.disconnect();
  };

  const updateProfile = async (updateData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserService.updateUser(user?.id, updateData);
      
      const updatedUser = { ...user, ...response };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initialize user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        webSocketService.connect(token);
      } catch (err) {
        console.error('Failed to parse user data:', err);
        logout();
      }
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };
}

// Shipments hooks
export function useShipments(params?: any) {
  return useApi(() => ShipmentService.getShipments(params), [params]);
}

export function useShipment(id: string) {
  return useApi(() => ShipmentService.getShipment(id), [id]);
}

export function useShipmentTracking(id: string) {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackShipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ShipmentService.trackShipment(id);
      setTrackingData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tracking failed');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      trackShipment();
    }
  }, [trackShipment]);

  // Listen for real-time updates
  useEffect(() => {
    const handleShipmentUpdate = (data: any) => {
      if (data.shipmentId === id) {
        setTrackingData(prev => ({ ...prev, ...data }));
      }
    };

    webSocketService.on('shipment_update', handleShipmentUpdate);
    
    return () => {
      webSocketService.off('shipment_update', handleShipmentUpdate);
    };
  }, [id]);

  return { trackingData, loading, error, refetch: trackShipment };
}

// Payments hooks
export function usePayments(params?: any) {
  return useApi(() => PaymentService.getPayments(params), [params]);
}

export function usePayment(id: string) {
  return useApi(() => PaymentService.getPayment(id), [id]);
}

// Carrier hooks
export function useCarriers() {
  return useApi(() => CarrierService.getSupportedCarriers(), []);
}

export function useCarrierTracking(trackingNumber: string, carrier?: string) {
  return useApi(
    () => CarrierService.trackShipment(trackingNumber, carrier),
    [trackingNumber, carrier]
  );
}

export function useShippingRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRates = useCallback(async (rateRequest: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CarrierService.getRates(rateRequest);
      setRates(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to get rates';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { rates, loading, error, getRates };
}

// Analytics hooks
export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnalyticsService.getDashboardStats();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Listen for real-time analytics updates
  useEffect(() => {
    const handleAnalyticsUpdate = (data: any) => {
      setAnalytics(data);
    };

    webSocketService.on('analytics_update', handleAnalyticsUpdate);
    
    return () => {
      webSocketService.off('analytics_update', handleAnalyticsUpdate);
    };
  }, []);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

export function useRevenueAnalytics(period?: string) {
  return useApi(() => AnalyticsService.getRevenueAnalytics(period), [period]);
}

export function useCarrierPerformance() {
  return useApi(() => AnalyticsService.getCarrierPerformance(), []);
}

// Notifications hooks
export function useNotifications(params?: any) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [notificationsData, unreadData] = await Promise.all([
        NotificationService.getNotifications(params),
        NotificationService.getUnreadCount(),
      ]);
      
      setNotifications(notificationsData.notifications || []);
      setUnreadCount(unreadData.unreadCount || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, status: 'read' } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, status: 'read' }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (data: any) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    const handleUnreadCount = (data: any) => {
      setUnreadCount(data.count || 0);
    };

    webSocketService.on('notification', handleNewNotification);
    webSocketService.on('unread_count', handleUnreadCount);
    webSocketService.subscribeToNotifications();
    
    return () => {
      webSocketService.off('notification', handleNewNotification);
      webSocketService.off('unread_count', handleUnreadCount);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

// Users hooks
export function useUsers(params?: any) {
  return useApi(() => UserService.getUsers(params), [params]);
}

export function useUser(id: string) {
  return useApi(() => UserService.getUser(id), [id]);
}

// Real-time connection hook
export function useWebSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    webSocketService.on('connect', handleConnect);
    webSocketService.on('disconnect', handleDisconnect);

    return () => {
      webSocketService.off('connect', handleConnect);
      webSocketService.off('disconnect', handleDisconnect);
    };
  }, []);

  return {
    connected,
    joinRoom: webSocketService.joinRoom.bind(webSocketService),
    leaveRoom: webSocketService.leaveRoom.bind(webSocketService),
    on: webSocketService.on.bind(webSocketService),
    off: webSocketService.off.bind(webSocketService),
  };
}
