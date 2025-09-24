import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Ship, 
  Plane, 
  Truck,
  MapPin,
  TrendingUp,
  Users,
  Globe,
  DollarSign,
  Bell,
  Zap,
  Activity,
  Eye,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different transport types
const createCustomIcon = (color: string, type: 'ship' | 'plane' | 'truck', shipmentId: string) => {
  const iconMap = {
    ship: 'S',
    plane: 'A',
    truck: 'T'
  };
  
  const safeShipmentId = shipmentId || 'N/A';
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative;">
      <span style="font-size: 14px; font-weight: bold; color: white;">${iconMap[type]}</span>
      <div style="position: absolute; top: 32px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 1px 4px; border-radius: 3px; font-size: 8px; white-space: nowrap; font-weight: bold;">#${safeShipmentId}</div>
    </div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const portIcon = (name: string, code: string) => L.divIcon({
  html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative;">
    <div style="position: absolute; top: 22px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; white-space: nowrap; font-weight: bold;">${code}</div>
  </div>`,
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

interface ShipmentRoute {
  id: string;
  from: { lat: number; lng: number; name: string };
  to: { lat: number; lng: number; name: string };
  progress: number;
  type: 'ocean' | 'air' | 'ground';
  status: 'in-transit' | 'delivered' | 'delayed';
}

interface Port {
  name: string;
  lat: number;
  lng: number;
  code: string;
}

const majorPorts: Port[] = [
  { name: 'New York', lat: 40.7128, lng: -74.0060, code: 'NYC' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, code: 'LAX' },
  { name: 'London', lat: 51.5074, lng: -0.1278, code: 'LON' },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, code: 'SHA' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, code: 'TYO' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, code: 'SIN' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, code: 'DXB' },
  { name: 'Rotterdam', lat: 51.9225, lng: 4.4792, code: 'RTM' },
  // African Ports
  { name: 'Accra', lat: 5.6037, lng: -0.1870, code: 'ACC' },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, code: 'LOS' },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241, code: 'CPT' },
  { name: 'Durban', lat: -29.8587, lng: 31.0218, code: 'DUR' },
  { name: 'Alexandria', lat: 31.2001, lng: 29.9187, code: 'ALY' },
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898, code: 'CAS' }
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedService, setSelectedService] = useState<'ocean' | 'air' | 'ground'>('ocean');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [liveStats, setLiveStats] = useState({
    activeShipments: 247,
    revenue: 1200000,
    globalRoutes: 89,
    activeClients: 1847
  });
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
    isNew: boolean;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionPulse, setConnectionPulse] = useState(0);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  
  const [shipmentRoutes, setShipmentRoutes] = useState<ShipmentRoute[]>([
    {
      id: '1',
      from: { lat: 40.7128, lng: -74.0060, name: 'New York' },
      to: { lat: 31.2304, lng: 121.4737, name: 'Shanghai' },
      progress: 0,
      type: 'ocean',
      status: 'in-transit'
    },
    {
      id: '2',
      from: { lat: 51.5074, lng: -0.1278, name: 'London' },
      to: { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
      progress: 0,
      type: 'air',
      status: 'in-transit'
    },
    {
      id: '3',
      from: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
      to: { lat: 40.7128, lng: -74.0060, name: 'New York' },
      progress: 0,
      type: 'ground',
      status: 'in-transit'
    },
    {
      id: '4',
      from: { lat: 51.9225, lng: 4.4792, name: 'Rotterdam' },
      to: { lat: 5.6037, lng: -0.1870, name: 'Accra' },
      progress: 0,
      type: 'ocean',
      status: 'in-transit'
    },
    {
      id: '5',
      from: { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
      to: { lat: 6.5244, lng: 3.3792, name: 'Lagos' },
      progress: 0,
      type: 'air',
      status: 'in-transit'
    },
    {
      id: '6',
      from: { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
      to: { lat: -29.8587, lng: 31.0218, name: 'Durban' },
      progress: 0,
      type: 'ocean',
      status: 'in-transit'
    },
    {
      id: '7',
      from: { lat: 40.7128, lng: -74.0060, name: 'New York' },
      to: { lat: -33.9249, lng: 18.4241, name: 'Cape Town' },
      progress: 0,
      type: 'air',
      status: 'in-transit'
    }
  ]);

  // Initialize notification sound
  useEffect(() => {
    notificationSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
  }, []);

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time stat changes
      setLiveStats(prev => ({
        activeShipments: prev.activeShipments + Math.floor(Math.random() * 3) - 1,
        revenue: prev.revenue + Math.floor(Math.random() * 10000) - 5000,
        globalRoutes: prev.globalRoutes + (Math.random() > 0.95 ? 1 : 0),
        activeClients: prev.activeClients + Math.floor(Math.random() * 5) - 2
      }));

      // Random notifications
      if (Math.random() > 0.97) {
        const notificationTypes = ['success', 'warning', 'info'] as const;
        const messages = [
          'New shipment booked from Shanghai to Los Angeles',
          'Shipment #SH-2024-156 has cleared customs',
          'Weather alert: Potential delays in Atlantic routes',
          'Container ship MSC Bella arrived ahead of schedule',
          'New client registration: Global Tech Solutions',
          'Payment received for shipment #SH-2024-142'
        ];
        
        const newNotification = {
          id: Date.now().toString(),
          type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date(),
          isNew: true
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        
        // Play notification sound
        if (notificationSound.current) {
          notificationSound.current.volume = 0.3;
          notificationSound.current.play().catch(() => {});
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Connection pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionPulse(prev => (prev + 1) % 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animate shipment progress with varying speeds
  useEffect(() => {
    const interval = setInterval(() => {
      setShipmentRoutes(prev => prev.map(route => {
        const speed = route.type === 'air' ? 1.2 : route.type === 'ground' ? 0.8 : 0.5;
        const newProgress = route.progress >= 100 ? 0 : route.progress + speed;
        return {
          ...route,
          progress: newProgress,
          status: newProgress > 95 ? 'delivered' : newProgress > 80 ? 'in-transit' : 'in-transit'
        };
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Mark notifications as read after viewing
  useEffect(() => {
    if (showNotifications) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showNotifications]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getShipmentIcon = (type: string) => {
    switch (type) {
      case 'ocean': return <Ship className="w-4 h-4" />;
      case 'air': return <Plane className="w-4 h-4" />;
      case 'ground': return <Truck className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const calculateShipmentPosition = (route: ShipmentRoute) => {
    const progress = route.progress / 100;
    const lat = route.from.lat + (route.to.lat - route.from.lat) * progress;
    const lng = route.from.lng + (route.to.lng - route.from.lng) * progress;
    return { lat, lng };
  };

  const getRouteColor = (type: string) => {
    switch (type) {
      case 'ocean': return '#3b82f6';
      case 'air': return '#8b5cf6';
      case 'ground': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Button handlers
  const handleGetQuote = () => {
    setShowQuoteModal(true);
  };

  const handleBookShipment = () => {
    setShowBookingModal(true);
  };

  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }
    
    // Mock tracking result
    setTrackingResult({
      trackingNumber: trackingNumber,
      status: 'In Transit',
      location: 'Shanghai Port',
      estimatedDelivery: '2024-01-15',
      carrier: 'Maersk'
    });
  };

  const handleServiceSelect = (service: 'ocean' | 'air' | 'ground') => {
    setSelectedService(service);
  };

  // Modal Components
  const QuoteModal = () => (
    showQuoteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Get Quote</h3>
            <button 
              onClick={() => setShowQuoteModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Origin Port
              </label>
              <input
                type="text"
                placeholder="e.g., New York"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Destination Port
              </label>
              <input
                type="text"
                placeholder="e.g., Shanghai"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cargo Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Container (20ft)</option>
                <option>Container (40ft)</option>
                <option>LCL (Less than Container Load)</option>
                <option>Break Bulk</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Get Quote
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  const BookingModal = () => (
    showBookingModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Book Shipment</h3>
            <button 
              onClick={() => setShowBookingModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shipper Name
              </label>
              <input
                type="text"
                placeholder="Company or individual name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Consignee Name
              </label>
              <input
                type="text"
                placeholder="Recipient name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Ocean Freight</option>
                <option>Air Freight</option>
                <option>Ground Transport</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Book Now
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Live Features */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <span>{getGreeting()}, {user?.firstName || 'User'}! 👋</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} ${connectionPulse === 0 ? 'animate-pulse' : ''}`}></div>
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    {isOnline ? 'Live' : 'Offline'}
                  </span>
                </div>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center space-x-4">
                <span>Here's what's happening with your shipments today</span>
                <span className="flex items-center space-x-1 text-sm">
                  <Activity className="w-4 h-4" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </span>
              </p>
            </div>
            
            {/* Live Notifications Panel */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                {notifications.filter(n => n.isNew).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-xs text-white font-bold">
                      {notifications.filter(n => n.isNew).length}
                    </span>
                  </div>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span>Live Updates</span>
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            notification.isNew ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'success' ? 'bg-green-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                            } ${notification.isNew ? 'animate-pulse' : ''}`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {notification.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{liveStats.activeShipments}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">+12% from last month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${liveStats.revenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">+8% from last month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Global Routes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{liveStats.globalRoutes}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">+5 new routes</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{liveStats.activeClients}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">+23% growth</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real World Map */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Global Shipment Tracking
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Live Tracking</span>
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Watch Live</span>
                  </button>
                </div>
              </div>
              
              <div className="h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                <MapContainer
                  center={[30, 0]}
                  zoom={2}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Major Ports */}
                  {majorPorts.map((port) => (
                    <Marker
                      key={port.code}
                      position={[port.lat, port.lng]}
                      icon={portIcon(port.name, port.code)}
                    >
                      <Popup>
                        <div className="text-center">
                          <h3 className="font-semibold">{port.name}</h3>
                          <p className="text-sm text-gray-600">{port.code}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* Shipment Routes */}
                  {shipmentRoutes.map((route) => (
                    <React.Fragment key={route.id}>
                      {/* Route Line */}
                      <Polyline
                        positions={[
                          [route.from.lat, route.from.lng],
                          [route.to.lat, route.to.lng]
                        ]}
                        color={getRouteColor(route.type)}
                        weight={3}
                        opacity={0.7}
                        dashArray="10, 10"
                      />
                      
                      {/* Moving Shipment */}
                      <Marker
                        position={[
                          calculateShipmentPosition(route).lat,
                          calculateShipmentPosition(route).lng
                        ]}
                        icon={createCustomIcon(
                          getRouteColor(route.type),
                          route.type,
                          `${route.id}`
                        )}
                      >
                        <Popup>
                          <div className="text-center">
                            <h3 className="font-semibold">Shipment #{route.id}</h3>
                            <p className="text-sm">From: {route.from.name}</p>
                            <p className="text-sm">To: {route.to.name}</p>
                            <p className="text-sm">Progress: {Math.round(route.progress)}%</p>
                            <p className="text-sm capitalize">Type: {route.type}</p>
                            <p className="text-sm capitalize">Status: {route.status}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  ))}
                </MapContainer>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-1 bg-blue-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Ocean Freight</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-1 bg-purple-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Air Freight</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-1 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Ground Transport</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Exceptions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Exceptions
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Mechanical Delay</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Container ship MSC Bella - 4 hours behind schedule</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mt-1">
                      High Priority
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Clock className="w-5 h-5 text-yellow-500 mt-0.5 animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">FDA Review</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Shipment #SH-2024-001 pending customs clearance</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mt-1">
                      Medium Priority
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Resolved</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Weather delay cleared - shipment resumed</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                      Resolved
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SKUs in Transit */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                SKUs in Transit
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Electronics</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">2,450 units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Shanghai</p>
                    <p className="text-xs text-green-600 dark:text-green-400">ETA: 2 days</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👕</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Textiles</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">8,900 units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Mumbai</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">ETA: 5 days</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚗</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Auto Parts</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">1,200 units</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Detroit</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">ETA: 1 day</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tracking Interface */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Track Your Shipments
              </h2>
              <div className="flex space-x-2">
                <button 
                  onClick={handleGetQuote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Get Quote</span>
                </button>
                <button 
                  onClick={handleBookShipment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Ship className="w-4 h-4" />
                  <span>Book Shipment</span>
                </button>
              </div>
            </div>

            {/* Service Type Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                onClick={() => handleServiceSelect('ocean')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md shadow-sm transition-all ${
                  selectedService === 'ocean' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Ship className="w-4 h-4" />
                <span className="font-medium">Ocean Freight</span>
              </button>
              <button 
                onClick={() => handleServiceSelect('air')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md shadow-sm transition-all ${
                  selectedService === 'air' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Plane className="w-4 h-4" />
                <span className="font-medium">Air Freight</span>
              </button>
              <button 
                onClick={() => handleServiceSelect('ground')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md shadow-sm transition-all ${
                  selectedService === 'ground' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span className="font-medium">Ground Transport</span>
              </button>
            </div>

            {/* Tracking Input */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number (e.g., 1Z999AA1234567890)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button 
                onClick={handleTrack}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Track
              </button>
            </div>

            {/* Tracking Result */}
            {trackingResult && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                  Tracking Result
                </h4>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <p><strong>Tracking #:</strong> {trackingResult.trackingNumber}</p>
                  <p><strong>Status:</strong> {trackingResult.status}</p>
                  <p><strong>Current Location:</strong> {trackingResult.location}</p>
                  <p><strong>Carrier:</strong> {trackingResult.carrier}</p>
                  <p><strong>Est. Delivery:</strong> {trackingResult.estimatedDelivery}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <QuoteModal />
        <BookingModal />
      </div>
    </div>
  );
};