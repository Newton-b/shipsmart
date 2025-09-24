import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Phone,
  MessageSquare,
  Camera,
  Upload,
  Play,
  Pause,
  RefreshCw,
  Navigation2,
  User,
  Package,
  Star,
  TrendingUp,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { AnimatedCounter, AnimatedProgressBar } from '../components/AnimatedElements';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Delivery {
  id: string;
  customerName: string;
  address: string;
  position: [number, number];
  status: 'pending' | 'en_route' | 'arrived' | 'delivered';
  priority: 'high' | 'medium' | 'low';
  timeWindow: string;
  phone: string;
  packages: number;
  notes?: string;
  estimatedTime: number;
}

const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'map' | 'deliveries' | 'profile'>('map');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([40.7128, -74.0060]);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [driverStats, setDriverStats] = useState({
    todayDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    totalDistance: 0,
    efficiency: 0,
    rating: 0
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock delivery data
  const mockDeliveries: Delivery[] = [
    {
      id: 'del-001',
      customerName: 'John Smith',
      address: '123 Main St, New York, NY',
      position: [40.7589, -73.9851],
      status: 'pending',
      priority: 'high',
      timeWindow: '9:00 AM - 11:00 AM',
      phone: '+1 (555) 123-4567',
      packages: 2,
      notes: 'Ring doorbell twice. Customer prefers morning delivery.',
      estimatedTime: 15
    },
    {
      id: 'del-002',
      customerName: 'Sarah Johnson',
      address: '456 Oak Ave, Brooklyn, NY',
      position: [40.6782, -73.9442],
      status: 'en_route',
      priority: 'medium',
      timeWindow: '11:30 AM - 1:30 PM',
      phone: '+1 (555) 987-6543',
      packages: 1,
      notes: 'Leave at front desk if not available.',
      estimatedTime: 25
    },
    {
      id: 'del-003',
      customerName: 'Mike Chen',
      address: '789 Pine St, Queens, NY',
      position: [40.7282, -73.7949],
      status: 'pending',
      priority: 'low',
      timeWindow: '2:00 PM - 4:00 PM',
      phone: '+1 (555) 456-7890',
      packages: 3,
      estimatedTime: 35
    }
  ];

  useEffect(() => {
    setDeliveries(mockDeliveries);
    setDriverStats({
      todayDeliveries: 8,
      completedDeliveries: 5,
      pendingDeliveries: 3,
      totalDistance: 127.5,
      efficiency: 94,
      rating: 4.8
    });
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (isLiveMode) {
      intervalRef.current = setInterval(() => {
        // Simulate location updates
        setCurrentLocation(prev => [
          prev[0] + (Math.random() - 0.5) * 0.001,
          prev[1] + (Math.random() - 0.5) * 0.001
        ]);

        // Random delivery status updates
        if (Math.random() < 0.1) {
          setDeliveries(prev => prev.map(delivery => {
            if (delivery.status === 'pending' && Math.random() < 0.3) {
              createNotification({
                title: 'Delivery Update',
                message: `Started route to ${delivery.customerName}`,
                type: 'shipment_update'
              });
              return { ...delivery, status: 'en_route' as const };
            }
            return delivery;
          }));
        }
      }, 3000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLiveMode, createNotification]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'en_route': return 'text-blue-600 bg-blue-100';
      case 'arrived': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const updateDeliveryStatus = (deliveryId: string, newStatus: Delivery['status']) => {
    setDeliveries(prev => prev.map(delivery => 
      delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
    ));
    
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
      createNotification({
        title: 'Status Updated',
        message: `${delivery.customerName} delivery marked as ${newStatus}`,
        type: 'shipment_update'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Driver Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName}! Manage your deliveries and routes
          </p>
        </div>

        {/* Live Status Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className={`w-5 h-5 ${isLiveMode ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {isLiveMode ? 'Live Tracking Active' : 'Live Tracking Paused'}
                </span>
              </div>
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isLiveMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-sm">{isLiveMode ? 'Pause' : 'Resume'}</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>Current Location: New York, NY</span>
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Deliveries</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={driverStats.todayDeliveries} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={driverStats.completedDeliveries} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={driverStats.pendingDeliveries} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Navigation2 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Distance (mi)</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={Math.round(driverStats.totalDistance * 10) / 10} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={driverStats.efficiency} />%
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={Math.round(driverStats.rating * 10) / 10} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'map', label: 'Live Map', icon: MapPin },
                { id: 'deliveries', label: 'Deliveries', icon: Package },
                { id: 'profile', label: 'Profile', icon: User }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {activeTab === 'map' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Delivery Map</h2>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {deliveries.length} deliveries on route
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden h-96">
                <MapContainer
                  center={currentLocation}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Driver Location */}
                  <Marker position={currentLocation}>
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold">Your Location</h4>
                        <p className="text-sm text-gray-600">Driver: {user?.firstName}</p>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Customer Locations */}
                  {deliveries.map((delivery) => (
                    <Marker key={delivery.id} position={delivery.position}>
                      <Popup>
                        <div className="p-2 min-w-48">
                          <h4 className="font-semibold">{delivery.customerName}</h4>
                          <p className="text-sm text-gray-600">{delivery.address}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(delivery.status)}`}>
                                {delivery.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs">Priority:</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(delivery.priority)}`}>
                                {delivery.priority}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs">Packages:</span>
                              <span className="text-xs font-medium">{delivery.packages}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {/* Route Lines */}
                  {deliveries.map((delivery) => (
                    <Polyline
                      key={`route-${delivery.id}`}
                      positions={[currentLocation, delivery.position]}
                      color={delivery.status === 'en_route' ? '#3B82F6' : '#6B7280'}
                      weight={3}
                      opacity={0.7}
                      dashArray={delivery.status === 'en_route' ? undefined : '10, 10'}
                    />
                  ))}
                </MapContainer>
              </div>
            </div>
          )}

          {activeTab === 'deliveries' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Today's Deliveries</h2>
              
              <div className="space-y-4">
                {deliveries.map((delivery) => (
                  <div key={delivery.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{delivery.customerName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{delivery.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                          {delivery.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Time Window</p>
                        <p className="text-sm font-medium">{delivery.timeWindow}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Packages</p>
                        <p className="text-sm font-medium">{delivery.packages}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ETA</p>
                        <p className="text-sm font-medium">{delivery.estimatedTime} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{delivery.phone}</p>
                      </div>
                    </div>
                    
                    {delivery.notes && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{delivery.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'en_route')}
                        disabled={delivery.status !== 'pending'}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        Start Route
                      </button>
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'arrived')}
                        disabled={delivery.status !== 'en_route'}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                      >
                        Mark Arrived
                      </button>
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                        disabled={delivery.status !== 'arrived'}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Complete
                      </button>
                      <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Driver Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Delivery Success Rate</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <AnimatedProgressBar progress={94} color="bg-green-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">On-Time Performance</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <AnimatedProgressBar progress={87} color="bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Customer Satisfaction</span>
                        <span className="text-sm font-medium">96%</span>
                      </div>
                      <AnimatedProgressBar progress={96} color="bg-purple-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <span>Upload Proof of Delivery</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span>Report Issue</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <span>Contact Dispatcher</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
