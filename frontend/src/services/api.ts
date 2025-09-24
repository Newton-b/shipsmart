import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service Classes
export class AuthService {
  static async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  static async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  static async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  static async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  static async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }
}

export class ShipmentService {
  static async getShipments(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const response = await api.get('/shipments', { params });
    return response.data;
  }

  static async getShipment(id: string) {
    const response = await api.get(`/shipments/${id}`);
    return response.data;
  }

  static async createShipment(shipmentData: any) {
    const response = await api.post('/shipments', shipmentData);
    return response.data;
  }

  static async updateShipment(id: string, updateData: any) {
    const response = await api.patch(`/shipments/${id}`, updateData);
    return response.data;
  }

  static async trackShipment(id: string) {
    const response = await api.get(`/shipments/${id}/track`);
    return response.data;
  }

  static async getShipmentStats() {
    const response = await api.get('/shipments/stats');
    return response.data;
  }
}

export class PaymentService {
  static async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const response = await api.get('/payments', { params });
    return response.data;
  }

  static async getPayment(id: string) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }

  static async createPayment(paymentData: any) {
    const response = await api.post('/payments', paymentData);
    return response.data;
  }

  static async processPayment(id: string, processData: any) {
    const response = await api.post(`/payments/${id}/process`, processData);
    return response.data;
  }

  static async refundPayment(id: string, refundData?: any) {
    const response = await api.post(`/payments/${id}/refund`, refundData);
    return response.data;
  }

  static async getPaymentStats() {
    const response = await api.get('/payments/stats');
    return response.data;
  }
}

export class CarrierService {
  static async getSupportedCarriers() {
    const response = await api.get('/carriers/supported');
    return response.data;
  }

  static async trackShipment(trackingNumber: string, carrier?: string) {
    const params = carrier ? { carrier } : {};
    const response = await api.get(`/carriers/track/${trackingNumber}`, { params });
    return response.data;
  }

  static async getRates(rateRequest: {
    origin: any;
    destination: any;
    packages: any[];
    carriers?: string[];
  }) {
    const response = await api.post('/carriers/rates', rateRequest);
    return response.data;
  }

  static async createShipment(shipmentRequest: any) {
    const response = await api.post('/carriers/shipments', shipmentRequest);
    return response.data;
  }

  static async validateAddress(addressData: any) {
    const response = await api.post('/carriers/validate-address', addressData);
    return response.data;
  }
}

export class AnalyticsService {
  static async getDashboardStats() {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  }

  static async getRevenueAnalytics(period?: string) {
    const params = period ? { period } : {};
    const response = await api.get('/analytics/revenue', { params });
    return response.data;
  }

  static async getCarrierPerformance() {
    const response = await api.get('/analytics/carriers');
    return response.data;
  }

  static async getGeographicAnalytics() {
    const response = await api.get('/analytics/geographic');
    return response.data;
  }

  static async getShipmentTrends(days?: number) {
    const params = days ? { days } : {};
    const response = await api.get('/analytics/trends', { params });
    return response.data;
  }

  static async generateRealtimeData() {
    const response = await api.get('/analytics/realtime');
    return response.data;
  }
}

export class NotificationService {
  static async getNotifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }) {
    const response = await api.get('/notifications', { params });
    return response.data;
  }

  static async getNotification(id: string) {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  }

  static async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }

  static async markAsRead(id: string) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  static async markAsUnread(id: string) {
    const response = await api.patch(`/notifications/${id}/unread`);
    return response.data;
  }

  static async markAllAsRead() {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  }

  static async deleteNotification(id: string) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }

  static async deleteAllNotifications(status?: string) {
    const params = status ? { status } : {};
    const response = await api.delete('/notifications/all', { params });
    return response.data;
  }

  static async generateMockNotifications(count: number = 5) {
    const response = await api.get(`/notifications/mock/${count}`);
    return response.data;
  }
}

export class UserService {
  static async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
  }) {
    const response = await api.get('/users', { params });
    return response.data;
  }

  static async getUser(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  static async updateUser(id: string, updateData: any) {
    const response = await api.patch(`/users/${id}`, updateData);
    return response.data;
  }

  static async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }

  static async getUserStats() {
    const response = await api.get('/users/stats');
    return response.data;
  }

  static async getCurrentUserProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }
}

// WebSocket Service for real-time updates
export class WebSocketService {
  private socket: any = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token?: string) {
    if (typeof window === 'undefined') return;

    // Dynamic import for socket.io-client
    import('socket.io-client').then(({ io }) => {
      const socketUrl = API_BASE_URL.replace('/api', '');
      
      this.socket = io(socketUrl, {
        auth: {
          token: token || localStorage.getItem('auth_token'),
        },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('notification', (data: any) => {
        this.emit('notification', data);
      });

      this.socket.on('shipment_update', (data: any) => {
        this.emit('shipment_update', data);
      });

      this.socket.on('analytics_update', (data: any) => {
        this.emit('analytics_update', data);
      });

      this.socket.on('unread_count', (data: any) => {
        this.emit('unread_count', data);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  subscribeToNotifications() {
    if (this.socket) {
      this.socket.emit('subscribe_notifications');
    }
  }

  joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('join_room', room);
    }
  }

  leaveRoom(room: string) {
    if (this.socket) {
      this.socket.emit('leave_room', room);
    }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();

// Health check service
export class HealthService {
  static async checkHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.data;
    } catch (error) {
      throw new Error('Backend server is not responding');
    }
  }
}

// Export the main API instance
export default api;
