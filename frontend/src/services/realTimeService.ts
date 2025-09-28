import { EventEmitter } from 'events';

export interface RealTimeNotification {
  id: string;
  type: 'shipment_update' | 'payment_received' | 'system_alert' | 'route_change' | 'delivery_confirmation';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId?: string;
  data?: any;
  read: boolean;
  actionUrl?: string;
}

export interface LiveShipmentUpdate {
  shipmentId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'exception';
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    country: string;
  };
  estimatedDelivery: Date;
  actualDelivery?: Date;
  carrier: string;
  trackingNumber: string;
  lastUpdate: Date;
  events: ShipmentEvent[];
}

export interface ShipmentEvent {
  id: string;
  timestamp: Date;
  status: string;
  location: string;
  description: string;
  signature?: string;
}

export interface LiveMetrics {
  activeShipments: number;
  deliveredToday: number;
  pendingPayments: number;
  systemHealth: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
  revenueToday: number;
  lastUpdated: Date;
}

class RealTimeService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private notifications: RealTimeNotification[] = [];
  private shipmentUpdates: Map<string, LiveShipmentUpdate> = new Map();
  private liveMetrics: LiveMetrics | null = null;

  constructor() {
    super();
    this.initializeSimulation();
  }

  // Initialize WebSocket connection (simulated for demo)
  connect(userId: string, token: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate WebSocket connection
      setTimeout(() => {
        this.isConnected = true;
        this.startHeartbeat();
        this.startDataSimulation();
        this.emit('connected');
        resolve(true);
      }, 1000);
    });
  }

  disconnect(): void {
    this.isConnected = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.emit('disconnected');
  }

  // Notification management
  getNotifications(): RealTimeNotification[] {
    return this.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getUnreadNotifications(): RealTimeNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notification_updated', notification);
    }
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.emit('notifications_updated', this.notifications);
  }

  // Shipment tracking
  getShipmentUpdate(shipmentId: string): LiveShipmentUpdate | null {
    return this.shipmentUpdates.get(shipmentId) || null;
  }

  getAllShipmentUpdates(): LiveShipmentUpdate[] {
    return Array.from(this.shipmentUpdates.values());
  }

  subscribeToShipment(shipmentId: string): void {
    // Simulate subscription
    this.emit('shipment_subscribed', shipmentId);
  }

  unsubscribeFromShipment(shipmentId: string): void {
    // Simulate unsubscription
    this.emit('shipment_unsubscribed', shipmentId);
  }

  // Live metrics
  getLiveMetrics(): LiveMetrics | null {
    return this.liveMetrics;
  }

  // Private methods
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.emit('heartbeat');
      }
    }, 30000); // 30 seconds
  }

  private initializeSimulation(): void {
    // Initialize with some sample data
    this.liveMetrics = {
      activeShipments: 1247,
      deliveredToday: 89,
      pendingPayments: 23,
      systemHealth: 99.8,
      averageDeliveryTime: 2.3,
      customerSatisfaction: 4.7,
      revenueToday: 45230,
      lastUpdated: new Date()
    };

    // Sample notifications
    this.notifications = [
      {
        id: '1',
        type: 'shipment_update',
        title: 'Shipment Delivered',
        message: 'Package SH-2024-001234 has been delivered to New York',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        priority: 'medium',
        read: false,
        actionUrl: '/shipments/SH-2024-001234'
      },
      {
        id: '2',
        type: 'payment_received',
        title: 'Payment Received',
        message: 'Payment of $2,450.00 received for invoice INV-2024-5678',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'low',
        read: false,
        actionUrl: '/finance/invoices/INV-2024-5678'
      },
      {
        id: '3',
        type: 'system_alert',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin at 2:00 AM EST',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        priority: 'high',
        read: true
      }
    ];

    // Sample shipment updates
    this.shipmentUpdates.set('SH-2024-001234', {
      shipmentId: 'SH-2024-001234',
      status: 'delivered',
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: '123 Main St',
        city: 'New York',
        country: 'USA'
      },
      estimatedDelivery: new Date(Date.now() - 24 * 60 * 60 * 1000),
      actualDelivery: new Date(Date.now() - 30 * 60 * 1000),
      carrier: 'RaphTrack Express',
      trackingNumber: 'RT1234567890',
      lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
      events: [
        {
          id: '1',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'picked_up',
          location: 'Los Angeles, CA',
          description: 'Package picked up from sender'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'in_transit',
          location: 'Chicago, IL',
          description: 'Package in transit to destination'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'delivered',
          location: 'New York, NY',
          description: 'Package delivered successfully',
          signature: 'J. Smith'
        }
      ]
    });
  }

  private startDataSimulation(): void {
    // Simulate real-time updates
    setInterval(() => {
      if (this.isConnected) {
        this.simulateMetricsUpdate();
      }
    }, 10000); // Update metrics every 10 seconds

    setInterval(() => {
      if (this.isConnected && Math.random() > 0.7) {
        this.simulateNotification();
      }
    }, 15000); // Random notifications every 15 seconds

    setInterval(() => {
      if (this.isConnected && Math.random() > 0.8) {
        this.simulateShipmentUpdate();
      }
    }, 20000); // Random shipment updates every 20 seconds
  }

  private simulateMetricsUpdate(): void {
    if (!this.liveMetrics) return;

    // Simulate small changes in metrics
    this.liveMetrics = {
      ...this.liveMetrics,
      activeShipments: this.liveMetrics.activeShipments + Math.floor(Math.random() * 10 - 5),
      deliveredToday: this.liveMetrics.deliveredToday + Math.floor(Math.random() * 3),
      pendingPayments: Math.max(0, this.liveMetrics.pendingPayments + Math.floor(Math.random() * 6 - 3)),
      systemHealth: Math.min(100, Math.max(95, this.liveMetrics.systemHealth + (Math.random() * 2 - 1))),
      revenueToday: this.liveMetrics.revenueToday + Math.floor(Math.random() * 1000),
      lastUpdated: new Date()
    };

    this.emit('metrics_updated', this.liveMetrics);
  }

  private simulateNotification(): void {
    const notificationTypes = [
      {
        type: 'shipment_update' as const,
        titles: ['Shipment Delivered', 'Shipment Delayed', 'Shipment In Transit'],
        messages: [
          'Package delivered successfully',
          'Shipment delayed due to weather conditions',
          'Package is now in transit to destination'
        ]
      },
      {
        type: 'payment_received' as const,
        titles: ['Payment Received', 'Invoice Paid'],
        messages: [
          'Payment received for recent shipment',
          'Invoice has been paid in full'
        ]
      },
      {
        type: 'system_alert' as const,
        titles: ['System Update', 'Maintenance Notice'],
        messages: [
          'New features have been deployed',
          'Scheduled maintenance completed'
        ]
      }
    ];

    const typeData = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const title = typeData.titles[Math.floor(Math.random() * typeData.titles.length)];
    const message = typeData.messages[Math.floor(Math.random() * typeData.messages.length)];

    const notification: RealTimeNotification = {
      id: Date.now().toString(),
      type: typeData.type,
      title,
      message,
      timestamp: new Date(),
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      read: false
    };

    this.notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.emit('notification_received', notification);
  }

  private simulateShipmentUpdate(): void {
    const shipmentIds = Array.from(this.shipmentUpdates.keys());
    if (shipmentIds.length === 0) return;

    const shipmentId = shipmentIds[Math.floor(Math.random() * shipmentIds.length)];
    const shipment = this.shipmentUpdates.get(shipmentId);
    
    if (!shipment) return;

    // Simulate location update
    const newEvent: ShipmentEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'in_transit',
      location: 'Updated Location',
      description: 'Package location updated'
    };

    const updatedShipment: LiveShipmentUpdate = {
      ...shipment,
      lastUpdate: new Date(),
      events: [...shipment.events, newEvent]
    };

    this.shipmentUpdates.set(shipmentId, updatedShipment);
    this.emit('shipment_updated', updatedShipment);
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService();

// React hook for using real-time service
export const useRealTime = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [notifications, setNotifications] = React.useState<RealTimeNotification[]>([]);
  const [metrics, setMetrics] = React.useState<LiveMetrics | null>(null);

  React.useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    const handleNotificationReceived = (notification: RealTimeNotification) => {
      setNotifications(prev => [notification, ...prev]);
    };
    const handleMetricsUpdated = (newMetrics: LiveMetrics) => {
      setMetrics(newMetrics);
    };

    realTimeService.on('connected', handleConnected);
    realTimeService.on('disconnected', handleDisconnected);
    realTimeService.on('notification_received', handleNotificationReceived);
    realTimeService.on('metrics_updated', handleMetricsUpdated);

    // Initialize data
    setNotifications(realTimeService.getNotifications());
    setMetrics(realTimeService.getLiveMetrics());

    return () => {
      realTimeService.off('connected', handleConnected);
      realTimeService.off('disconnected', handleDisconnected);
      realTimeService.off('notification_received', handleNotificationReceived);
      realTimeService.off('metrics_updated', handleMetricsUpdated);
    };
  }, []);

  return {
    isConnected,
    notifications,
    metrics,
    unreadCount: notifications.filter(n => !n.read).length,
    connect: realTimeService.connect.bind(realTimeService),
    disconnect: realTimeService.disconnect.bind(realTimeService),
    markAsRead: realTimeService.markNotificationAsRead.bind(realTimeService),
    markAllAsRead: realTimeService.markAllNotificationsAsRead.bind(realTimeService)
  };
};
