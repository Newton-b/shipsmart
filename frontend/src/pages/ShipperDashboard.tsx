import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign,
  Truck,
  AlertCircle,
  CheckCircle,
  Star,
  MessageSquare,
  Download,
  Eye,
  TrendingUp,
  Activity,
  Bell,
  Zap,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Map
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { AnimatedCounter, AnimatedProgressBar, NotificationToast, PulsingDots } from '../components/AnimatedElements';
import { RealTimeTrackingMap } from '../components/RealTimeTrackingMap';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'delayed';
  service: 'standard' | 'express' | 'overnight';
  weight: number;
  value: number;
  createdAt: Date;
  estimatedDelivery: Date;
  carrier: string;
}

const ShipperDashboard: React.FC = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'map' | 'book' | 'billing'>('overview');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Real-time features
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({
    totalShipments: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0,
    totalValue: 0,
    avgDeliveryTime: 0
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock shipment data
  useEffect(() => {
    const mockShipments: Shipment[] = [
      {
        id: '1',
        trackingNumber: 'SHP001234',
        origin: 'New York, NY',
        destination: 'Los Angeles, CA',
        status: 'in_transit',
        service: 'express',
        weight: 25.5,
        value: 1200,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        carrier: 'FedEx'
      },
      {
        id: '2',
        trackingNumber: 'SHP001235',
        origin: 'Chicago, IL',
        destination: 'Miami, FL',
        status: 'delivered',
        service: 'standard',
        weight: 15.2,
        value: 800,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        carrier: 'UPS'
      }
    ];
    setShipments(mockShipments);
    
    // Update live stats
    setLiveStats({
      totalShipments: mockShipments.length,
      inTransit: mockShipments.filter(s => s.status === 'in_transit').length,
      delivered: mockShipments.filter(s => s.status === 'delivered').length,
      pending: mockShipments.filter(s => s.status === 'pending').length,
      totalValue: mockShipments.reduce((sum, s) => sum + s.value, 0),
      avgDeliveryTime: 3.2
    });
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    if (isLiveMode) {
      intervalRef.current = setInterval(() => {
        setLastUpdate(new Date());
        
        // Simulate random shipment status updates
        setShipments(prev => prev.map(shipment => {
          if (Math.random() < 0.1) { // 10% chance of status change
            const statuses: Array<Shipment['status']> = ['pending', 'picked_up', 'in_transit', 'delivered'];
            const currentIndex = statuses.indexOf(shipment.status);
            const nextIndex = Math.min(currentIndex + 1, statuses.length - 1);
            
            if (currentIndex < statuses.length - 1) {
              createNotification({
                title: 'Shipment Update',
                message: `Shipment ${shipment.trackingNumber} is now ${statuses[nextIndex]}`,
                type: 'shipment_update'
              });
              
              return { ...shipment, status: statuses[nextIndex] };
            }
          }
          return shipment;
        }));
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLiveMode, createNotification]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'in_transit': return 'text-blue-600 bg-blue-100';
      case 'picked_up': return 'text-yellow-600 bg-yellow-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delayed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalShipments: shipments.length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    totalValue: shipments.reduce((sum, s) => sum + s.value, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your shipments and track deliveries
          </p>
        </div>

        {/* Live Status Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className={`w-5 h-5 ${isLiveMode ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {isLiveMode ? 'Live Updates Active' : 'Live Updates Paused'}
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
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards with Animations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Shipments</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={stats.totalShipments} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-yellow-600" />
              <div className="ml-4 flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">In Transit</p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={stats.inTransit} />
                </div>
                <div className="mt-2">
                  <AnimatedProgressBar 
                    progress={(stats.inTransit / stats.totalShipments) * 100} 
                    color="bg-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delivered}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Package },
                { id: 'shipments', label: 'My Shipments', icon: Truck },
                { id: 'map', label: 'Live Map', icon: Map },
                { id: 'book', label: 'Book Shipment', icon: Plus },
                { id: 'billing', label: 'Billing', icon: DollarSign }
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
                  <div className="space-y-4">
                    {shipments.slice(0, 3).map(shipment => (
                      <div key={shipment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(shipment.status)}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{shipment.origin} → {shipment.destination}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {shipment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setActiveTab('shipments')}
                    className="mt-4 w-full text-center py-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                  >
                    View All Shipments →
                  </button>
                </div>
                
                {/* Live Map Preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Tracking</h2>
                    <button 
                      onClick={() => setActiveTab('map')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      View Full Map →
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden h-80">
                    <RealTimeTrackingMap />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <div className="ml-2">
                          <p className="text-xs text-blue-600 dark:text-blue-400">Active</p>
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">8 vehicles</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="ml-2">
                          <p className="text-xs text-green-600 dark:text-green-400">On Time</p>
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300">94%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Tracking Map</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Real-time vehicle locations and shipment tracking
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className={`w-5 h-5 ${isLiveMode ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isLiveMode ? 'Live Updates Active' : 'Live Updates Paused'}
                  </span>
                </div>
              </div>
              
              {/* Live Tracking Map Component */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                <RealTimeTrackingMap />
              </div>
              
              {/* Map Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Active Vehicles</p>
                      <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">12</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="w-6 h-6 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm text-green-600 dark:text-green-400">Moving</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">8</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Stopped</p>
                      <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">3</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm text-purple-600 dark:text-purple-400">Loading</p>
                      <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">1</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">My Shipments</h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search shipments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tracking Number</th>
                      <th className="text-left py-3 px-4">Route</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Service</th>
                      <th className="text-left py-3 px-4">Value</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map(shipment => (
                      <tr key={shipment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 font-medium">{shipment.trackingNumber}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {shipment.origin} → {shipment.destination}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {shipment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 capitalize">{shipment.service}</td>
                        <td className="py-3 px-4">${shipment.value.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'book' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Book New Shipment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Origin Details</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Origin Address"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Contact Name"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Destination Details</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Destination Address"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Recipient Name"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Recipient Phone"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Weight (lbs)</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Service Type</label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="overnight">Overnight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Package Value</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Save as Draft
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Get Quote
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Billing & Invoices</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Invoice #INV-001234</p>
                    <p className="text-sm text-gray-600">Shipment: SHP001234</p>
                    <p className="text-sm text-gray-600">Date: March 15, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$125.50</p>
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">Paid</span>
                    <div className="mt-2">
                      <button className="text-blue-600 hover:underline text-sm mr-4">
                        <Download className="w-4 h-4 inline mr-1" />
                        Download
                      </button>
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

export default ShipperDashboard;
