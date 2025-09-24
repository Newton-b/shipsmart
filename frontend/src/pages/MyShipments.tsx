import React, { useState, useEffect, useRef } from 'react';
import { Package, Search, Filter, MapPin, Clock, Truck, Ship, Plane, CheckCircle, AlertCircle, Eye, Activity, Play, Pause, RefreshCw, Bell, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { AnimatedCounter, AnimatedProgressBar, PulsingDots, NotificationToast } from '../components/AnimatedElements';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: 'in_transit' | 'delivered' | 'pending' | 'delayed';
  service: 'air' | 'ocean' | 'ground';
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  dimensions: string;
  value: number;
  createdAt: string;
  lastUpdate: string;
}

export const MyShipments: React.FC = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_transit' | 'delivered' | 'pending' | 'delayed'>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'air' | 'ocean' | 'ground'>('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  
  // Real-time features
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock shipment data
  const [shipments] = useState<Shipment[]>([
    {
      id: '1',
      trackingNumber: 'SS2024001234',
      origin: 'Los Angeles, CA',
      destination: 'New York, NY',
      status: 'in_transit',
      service: 'air',
      estimatedDelivery: '2024-01-20T14:00:00Z',
      weight: 25.5,
      dimensions: '24x18x12 inches',
      value: 1500,
      createdAt: '2024-01-15T09:00:00Z',
      lastUpdate: '2024-01-18T16:30:00Z'
    },
    {
      id: '2',
      trackingNumber: 'SS2024001235',
      origin: 'Shanghai, China',
      destination: 'Los Angeles, CA',
      status: 'delivered',
      service: 'ocean',
      estimatedDelivery: '2024-01-10T10:00:00Z',
      actualDelivery: '2024-01-10T08:45:00Z',
      weight: 150.0,
      dimensions: '48x36x24 inches',
      value: 8500,
      createdAt: '2023-12-15T14:00:00Z',
      lastUpdate: '2024-01-10T08:45:00Z'
    },
    {
      id: '3',
      trackingNumber: 'SS2024001236',
      origin: 'Chicago, IL',
      destination: 'Miami, FL',
      status: 'delayed',
      service: 'ground',
      estimatedDelivery: '2024-01-19T12:00:00Z',
      weight: 75.2,
      dimensions: '36x24x18 inches',
      value: 3200,
      createdAt: '2024-01-16T11:00:00Z',
      lastUpdate: '2024-01-18T14:20:00Z'
    }
  ]);

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    const matchesService = serviceFilter === 'all' || shipment.service === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'air':
        return <Plane className="h-4 w-4" />;
      case 'ocean':
        return <Ship className="h-4 w-4" />;
      case 'ground':
        return <Truck className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Shipments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track and manage all your shipments in one place
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tracking number, origin, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-400" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value as any)}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Services</option>
                <option value="air">Air Freight</option>
                <option value="ocean">Ocean Freight</option>
                <option value="ground">Ground Transportation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipments List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {shipment.trackingNumber}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Created: {formatDate(shipment.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">{shipment.origin}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">to {shipment.destination}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getServiceIcon(shipment.service)}
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {shipment.service} Freight
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(shipment.status)}`}>
                        {shipment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {shipment.actualDelivery ? 'Delivered' : 'Expected'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(shipment.actualDelivery || shipment.estimatedDelivery)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedShipment(shipment)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredShipments.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No shipments found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Shipment Details - {selectedShipment.trackingNumber}
              </h3>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Route Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Origin:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedShipment.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Destination:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedShipment.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Service:</span>
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{selectedShipment.service} Freight</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Package Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Weight:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedShipment.weight} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Dimensions:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{selectedShipment.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Value:</span>
                      <span className="text-sm text-gray-900 dark:text-white">${selectedShipment.value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedShipment.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Last Update:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedShipment.lastUpdate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedShipment.actualDelivery ? 'Delivered:' : 'Expected Delivery:'}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedShipment.actualDelivery || selectedShipment.estimatedDelivery)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
