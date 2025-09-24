import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  Users, 
  Package, 
  MapPin, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  MessageSquare,
  Navigation,
  Fuel,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Zap,
  BarChart3,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { AnimatedCounter, AnimatedProgressBar, PulsingDots, NotificationToast } from '../components/AnimatedElements';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  status: 'available' | 'on_route' | 'off_duty' | 'maintenance';
  currentLocation: string;
  vehicleId: string;
  rating: number;
  totalDeliveries: number;
}

interface Vehicle {
  id: string;
  type: 'truck' | 'van' | 'trailer';
  plateNumber: string;
  model: string;
  year: number;
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  currentLocation: string;
  fuelLevel: number;
  mileage: number;
  nextMaintenance: Date;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedDriver?: string;
  assignedVehicle?: string;
  pickupDate: Date;
  deliveryDate: Date;
  weight: number;
  value: number;
  customerName: string;
}

const CarrierDashboard: React.FC = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'drivers' | 'routes'>('overview');
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: '1',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@carrier.com',
      licenseNumber: 'CDL123456',
      status: 'on_route',
      currentLocation: 'Chicago, IL',
      vehicleId: '1',
      rating: 4.8,
      totalDeliveries: 245
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      email: 'sarah.johnson@carrier.com',
      licenseNumber: 'CDL234567',
      status: 'available',
      currentLocation: 'Detroit, MI',
      vehicleId: '2',
      rating: 4.9,
      totalDeliveries: 189
    }
  ]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      type: 'truck',
      plateNumber: 'TRK-001',
      model: 'Freightliner Cascadia',
      year: 2022,
      capacity: 80000,
      status: 'in_use',
      currentLocation: 'Chicago, IL',
      fuelLevel: 75,
      mileage: 45000,
      nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'van',
      plateNumber: 'VAN-002',
      model: 'Mercedes Sprinter',
      year: 2021,
      capacity: 10000,
      status: 'available',
      currentLocation: 'Detroit, MI',
      fuelLevel: 60,
      mileage: 32000,
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [shipments, setShipments] = useState<Shipment[]>([
    {
      id: '1',
      trackingNumber: 'CAR001234',
      origin: 'New York, NY',
      destination: 'Los Angeles, CA',
      status: 'assigned',
      priority: 'high',
      assignedDriver: '1',
      assignedVehicle: '1',
      pickupDate: new Date(),
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      weight: 15000,
      value: 25000,
      customerName: 'Acme Corp'
    },
    {
      id: '2',
      trackingNumber: 'CAR001235',
      origin: 'Chicago, IL',
      destination: 'Miami, FL',
      status: 'pending',
      priority: 'medium',
      pickupDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      weight: 8000,
      value: 15000,
      customerName: 'Global Industries'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'on_route': case 'in_use': case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'off_duty': case 'out_of_service': return 'text-gray-600 bg-gray-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.status === 'available').length,
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    activeShipments: shipments.filter(s => ['assigned', 'picked_up', 'in_transit'].includes(s.status)).length,
    pendingShipments: shipments.filter(s => s.status === 'pending').length,
    totalRevenue: shipments.reduce((sum, s) => sum + (s.value * 0.1), 0), // 10% commission
    fuelEfficiency: vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / vehicles.length
  };

  const assignShipment = (shipmentId: string, driverId: string, vehicleId: string) => {
    setShipments(prev => prev.map(s => 
      s.id === shipmentId 
        ? { ...s, status: 'assigned' as const, assignedDriver: driverId, assignedVehicle: vehicleId }
        : s
    ));
    
    setDrivers(prev => prev.map(d => 
      d.id === driverId ? { ...d, status: 'on_route' as const } : d
    ));
    
    setVehicles(prev => prev.map(v => 
      v.id === vehicleId ? { ...v, status: 'in_use' as const } : v
    ));

    createNotification({
      type: 'shipment_update',
      priority: 'medium',
      title: 'Shipment Assigned',
      message: `Shipment ${shipmentId} has been assigned to driver and vehicle`,
      data: { shipmentId, driverId, vehicleId }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Carrier Operations Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName}! Manage your fleet and operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Fleet Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.availableVehicles}/{stats.totalVehicles}
                </p>
                <p className="text-xs text-gray-500">Available/Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Drivers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.availableDrivers}/{stats.totalDrivers}
                </p>
                <p className="text-xs text-gray-500">Available/Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeShipments}</p>
                <p className="text-xs text-gray-500">{stats.pendingShipments} pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'fleet', label: 'Fleet Management', icon: Truck },
                { id: 'drivers', label: 'Drivers', icon: Users },
                { id: 'shipments', label: 'Shipments', icon: Package },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium">Shipment CAR001234 delivered</p>
                        <p className="text-sm text-gray-600">Driver: John Smith • 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium">Vehicle TRK-001 needs maintenance</p>
                        <p className="text-sm text-gray-600">Due in 15 days • Schedule now</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 border rounded-lg">
                      <Package className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">New shipment assignment available</p>
                        <p className="text-sm text-gray-600">Chicago → Miami • High priority</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fleet Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Fleet Status</h3>
                  <div className="space-y-3">
                    {vehicles.map(vehicle => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <Truck className="w-5 h-5 text-gray-600 mr-3" />
                          <div>
                            <p className="font-medium">{vehicle.plateNumber}</p>
                            <p className="text-sm text-gray-600">{vehicle.currentLocation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <div className="flex items-center mt-1">
                            <Fuel className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600">{vehicle.fuelLevel}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Fleet Management</h2>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Vehicle</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Fuel</th>
                      <th className="text-left py-3 px-4">Maintenance</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map(vehicle => (
                      <tr key={vehicle.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{vehicle.plateNumber}</p>
                            <p className="text-sm text-gray-600">{vehicle.model} ({vehicle.year})</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize">{vehicle.type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">{vehicle.currentLocation}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${vehicle.fuelLevel}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{vehicle.fuelLevel}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {Math.ceil((vehicle.nextMaintenance.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                              <Settings className="w-4 h-4" />
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

          {activeTab === 'drivers' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Driver Management</h2>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map(driver => (
                  <div key={driver.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium">{driver.name}</h3>
                          <p className="text-sm text-gray-600">{driver.licenseNumber}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                        {driver.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        {driver.currentLocation}
                      </div>
                      <div className="flex items-center text-sm">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        {driver.totalDeliveries} deliveries
                      </div>
                      <div className="flex items-center text-sm">
                        <Activity className="w-4 h-4 text-gray-400 mr-2" />
                        Rating: {driver.rating}/5.0
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        Contact
                      </button>
                      <button className="px-3 py-2 text-sm border rounded hover:bg-gray-50">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipments' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Shipment Management</h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search shipments..."
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_transit">In Transit</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Tracking #</th>
                      <th className="text-left py-3 px-4">Route</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Driver</th>
                      <th className="text-left py-3 px-4">Delivery Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map(shipment => (
                      <tr key={shipment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 font-medium">{shipment.trackingNumber}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Navigation className="w-4 h-4 mr-1 text-gray-400" />
                            {shipment.origin} → {shipment.destination}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {shipment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            shipment.priority === 'urgent' ? 'text-red-600 bg-red-100' :
                            shipment.priority === 'high' ? 'text-orange-600 bg-orange-100' :
                            shipment.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                            'text-gray-600 bg-gray-100'
                          }`}>
                            {shipment.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {shipment.assignedDriver ? 
                            drivers.find(d => d.id === shipment.assignedDriver)?.name || 'Unknown' :
                            <span className="text-gray-400">Unassigned</span>
                          }
                        </td>
                        <td className="py-3 px-4">
                          {shipment.deliveryDate.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {shipment.status === 'pending' && (
                              <button 
                                onClick={() => assignShipment(shipment.id, '2', '2')}
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Assign
                              </button>
                            )}
                            <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                              <Eye className="w-4 h-4" />
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

          {activeTab === 'analytics' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Analytics & Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Fleet Utilization</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Vehicles in Use</span>
                      <span className="font-medium">50%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Driver Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Average Rating</span>
                      <span className="font-medium">4.85/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-Time Delivery</span>
                      <span className="font-medium">94%</span>
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

export default CarrierDashboard;
