import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Truck, 
  Users, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Navigation2,
  Zap,
  RefreshCw,
  Play,
  Pause,
  Filter,
  Search,
  Phone,
  MessageSquare
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

interface Driver {
  id: string;
  name: string;
  position: [number, number];
  status: 'available' | 'busy' | 'offline';
  currentDeliveries: number;
  completedToday: number;
  efficiency: number;
  phone: string;
  vehicle: string;
}

interface Assignment {
  id: string;
  driverId: string;
  customerName: string;
  address: string;
  priority: 'high' | 'medium' | 'low';
  status: 'assigned' | 'in_progress' | 'completed';
  estimatedTime: number;
}

const DispatcherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'assignments' | 'analytics'>('overview');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [fleetStats, setFleetStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    totalDeliveries: 0,
    completedDeliveries: 0,
    avgEfficiency: 0,
    totalDistance: 0
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock driver data
  const mockDrivers: Driver[] = [
    {
      id: 'drv-001',
      name: 'John Smith',
      position: [40.7128, -74.0060],
      status: 'busy',
      currentDeliveries: 3,
      completedToday: 8,
      efficiency: 94,
      phone: '+1 (555) 123-4567',
      vehicle: 'TRK-001'
    },
    {
      id: 'drv-002',
      name: 'Sarah Johnson',
      position: [40.6782, -73.9442],
      status: 'available',
      currentDeliveries: 0,
      completedToday: 12,
      efficiency: 97,
      phone: '+1 (555) 987-6543',
      vehicle: 'TRK-002'
    },
    {
      id: 'drv-003',
      name: 'Mike Chen',
      position: [40.7589, -73.9851],
      status: 'busy',
      currentDeliveries: 2,
      completedToday: 6,
      efficiency: 89,
      phone: '+1 (555) 456-7890',
      vehicle: 'TRK-003'
    }
  ];

  const mockAssignments: Assignment[] = [
    {
      id: 'asn-001',
      driverId: 'drv-001',
      customerName: 'ABC Corp',
      address: '123 Business Ave, NYC',
      priority: 'high',
      status: 'in_progress',
      estimatedTime: 25
    },
    {
      id: 'asn-002',
      driverId: 'drv-003',
      customerName: 'XYZ Store',
      address: '456 Retail St, NYC',
      priority: 'medium',
      status: 'assigned',
      estimatedTime: 35
    }
  ];

  useEffect(() => {
    setDrivers(mockDrivers);
    setAssignments(mockAssignments);
    setFleetStats({
      totalDrivers: 15,
      activeDrivers: 12,
      totalDeliveries: 87,
      completedDeliveries: 64,
      avgEfficiency: 93,
      totalDistance: 1247.5
    });
  }, []);

  // Real-time updates
  useEffect(() => {
    if (isLiveMode) {
      intervalRef.current = setInterval(() => {
        // Simulate driver location updates
        setDrivers(prev => prev.map(driver => ({
          ...driver,
          position: [
            driver.position[0] + (Math.random() - 0.5) * 0.002,
            driver.position[1] + (Math.random() - 0.5) * 0.002
          ] as [number, number]
        })));

        // Random status updates
        if (Math.random() < 0.1) {
          const randomDriver = mockDrivers[Math.floor(Math.random() * mockDrivers.length)];
          createNotification({
            title: 'Fleet Update',
            message: `${randomDriver.name} completed a delivery`,
            type: 'shipment_update'
          });
        }
      }, 3000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLiveMode, createNotification]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-blue-600 bg-blue-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dispatch Control Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName}! Manage your fleet and optimize routes
          </p>
        </div>

        {/* Live Status Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className={`w-5 h-5 ${isLiveMode ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Fleet Tracking {isLiveMode ? 'Active' : 'Paused'}
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
              <Truck className="w-4 h-4" />
              <span>{drivers.filter(d => d.status !== 'offline').length} active drivers</span>
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Drivers</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={fleetStats.totalDrivers} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Now</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={fleetStats.activeDrivers} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={fleetStats.completedDeliveries} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={fleetStats.totalDeliveries - fleetStats.completedDeliveries} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Efficiency</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={fleetStats.avgEfficiency} />%
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Navigation2 className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Miles</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={Math.round(fleetStats.totalDistance)} />
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
                { id: 'overview', label: 'Fleet Overview', icon: MapPin },
                { id: 'fleet', label: 'Driver Management', icon: Users },
                { id: 'assignments', label: 'Assignments', icon: Navigation2 },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Fleet Map</h2>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {drivers.filter(d => d.status !== 'offline').length} drivers active
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden h-96 mb-6">
                <MapContainer
                  center={[40.7128, -74.0060]}
                  zoom={11}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {drivers.map((driver) => (
                    <Marker key={driver.id} position={driver.position}>
                      <Popup>
                        <div className="p-2 min-w-48">
                          <h4 className="font-semibold">{driver.name}</h4>
                          <p className="text-sm text-gray-600">Vehicle: {driver.vehicle}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(driver.status)}`}>
                                {driver.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs">Current:</span>
                              <span className="text-xs font-medium">{driver.currentDeliveries} deliveries</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs">Completed:</span>
                              <span className="text-xs font-medium">{driver.completedToday} today</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs">Efficiency:</span>
                              <span className="text-xs font-medium">{driver.efficiency}%</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm text-green-600 dark:text-green-400">Available Drivers</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                        {drivers.filter(d => d.status === 'available').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Busy Drivers</p>
                      <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {drivers.filter(d => d.status === 'busy').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending Assignments</p>
                      <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                        {assignments.filter(a => a.status === 'assigned').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Driver Management</h2>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    className="px-3 py-1 border rounded-md text-sm"
                  />
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                {drivers.map((driver) => (
                  <div key={driver.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{driver.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle: {driver.vehicle}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(driver.status)}`}>
                          {driver.status}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-medium">{driver.efficiency}% efficiency</p>
                          <p className="text-xs text-gray-500">{driver.completedToday} completed today</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Current Deliveries</p>
                        <p className="text-sm font-medium">{driver.currentDeliveries}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{driver.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Performance</p>
                        <div className="mt-1">
                          <AnimatedProgressBar progress={driver.efficiency} color="bg-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Active Assignments</h2>
              
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const driver = drivers.find(d => d.id === assignment.driverId);
                  return (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.customerName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.address}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {assignment.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Truck className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{driver?.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{assignment.estimatedTime} min ETA</span>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Track
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Fleet Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Fleet Efficiency</span>
                        <span className="text-sm font-medium">93%</span>
                      </div>
                      <AnimatedProgressBar progress={93} color="bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">On-Time Delivery</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <AnimatedProgressBar progress={87} color="bg-green-500" />
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
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Today's Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Deliveries</span>
                      <span className="text-sm font-medium">87</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-sm font-medium text-green-600">64</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="text-sm font-medium text-blue-600">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Distance</span>
                      <span className="text-sm font-medium">12.4 mi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fuel Efficiency</span>
                      <span className="text-sm font-medium">8.2 MPG</span>
                    </div>
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

export default DispatcherDashboard;
