import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  Package,
  Building,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  type: 'carrier' | 'warehouse' | 'customs' | 'supplier';
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  location: string;
  contact: {
    email: string;
    phone: string;
    person: string;
  };
  services: string[];
  performance: {
    onTimeDelivery: number;
    qualityScore: number;
    responseTime: number;
  };
  contractValue: string;
  lastActivity: string;
}

interface SupplyChainEvent {
  id: string;
  type: 'shipment' | 'delay' | 'delivery' | 'issue';
  vendorId: string;
  vendorName: string;
  description: string;
  timestamp: string;
  status: 'resolved' | 'pending' | 'escalated';
  impact: 'low' | 'medium' | 'high';
}

const SupplyChainManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vendors' | 'events' | 'analytics'>('vendors');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [events, setEvents] = useState<SupplyChainEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Mock data
  useEffect(() => {
    const mockVendors: Vendor[] = [
      {
        id: '1',
        name: 'Global Shipping Co.',
        type: 'carrier',
        status: 'active',
        rating: 4.8,
        location: 'Los Angeles, CA',
        contact: {
          email: 'contact@globalshipping.com',
          phone: '+1-555-0123',
          person: 'John Smith'
        },
        services: ['Ocean Freight', 'Air Freight', 'Customs Clearance'],
        performance: {
          onTimeDelivery: 95,
          qualityScore: 92,
          responseTime: 2.5
        },
        contractValue: '$2.5M',
        lastActivity: '2024-01-16'
      },
      {
        id: '2',
        name: 'Pacific Warehousing',
        type: 'warehouse',
        status: 'active',
        rating: 4.5,
        location: 'Seattle, WA',
        contact: {
          email: 'ops@pacificware.com',
          phone: '+1-555-0456',
          person: 'Sarah Johnson'
        },
        services: ['Storage', 'Distribution', 'Inventory Management'],
        performance: {
          onTimeDelivery: 88,
          qualityScore: 90,
          responseTime: 1.8
        },
        contractValue: '$850K',
        lastActivity: '2024-01-15'
      }
    ];

    const mockEvents: SupplyChainEvent[] = [
      {
        id: '1',
        type: 'delay',
        vendorId: '1',
        vendorName: 'Global Shipping Co.',
        description: 'Shipment SHIP001 delayed due to port congestion',
        timestamp: '2024-01-16T10:30:00Z',
        status: 'pending',
        impact: 'medium'
      },
      {
        id: '2',
        type: 'delivery',
        vendorId: '2',
        vendorName: 'Pacific Warehousing',
        description: 'Successful delivery of 500 units to warehouse',
        timestamp: '2024-01-16T09:15:00Z',
        status: 'resolved',
        impact: 'low'
      }
    ];

    setVendors(mockVendors);
    setEvents(mockEvents);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'carrier': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'warehouse': return <Building className="w-5 h-5 text-green-500" />;
      case 'customs': return <Package className="w-5 h-5 text-purple-500" />;
      case 'supplier': return <Users className="w-5 h-5 text-orange-500" />;
      default: return <Building className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Supply Chain Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage vendors, track performance, and monitor supply chain events
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'vendors', label: 'Vendors', icon: Building },
                { id: 'events', label: 'Events', icon: AlertTriangle },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'vendors' && (
              <div>
                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Types</option>
                      <option value="carrier">Carrier</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="customs">Customs</option>
                      <option value="supplier">Supplier</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Vendor
                  </button>
                </div>

                {/* Vendors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(vendor.type)}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {vendor.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                              {vendor.type}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Rating:</span>
                          <div className="flex items-center gap-1">
                            {renderStars(vendor.rating)}
                            <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                              {vendor.rating}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Contract:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {vendor.contractValue}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {vendor.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowViewModal(true);
                          }}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {event.type === 'delay' && <Clock className="w-5 h-5 text-orange-500" />}
                          {event.type === 'delivery' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {event.type === 'issue' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                          {event.type === 'shipment' && <Package className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {event.description}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {event.vendorName} • {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          event.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {event.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          event.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {event.impact} impact
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Vendors</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                    </div>
                    <Building className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Avg Performance</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active Issues</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Contract Value</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">$8.2M</p>
                    </div>
                    <Package className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Vendor Modal */}
      {showViewModal && selectedVendor && (
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Vendor Details
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedVendor.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedVendor.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedVendor.status)}`}>
                    {selectedVendor.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1">
                    {renderStars(selectedVendor.rating)}
                    <span className="text-gray-900 dark:text-white ml-1">{selectedVendor.rating}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Information
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedVendor.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedVendor.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedVendor.contact.person}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Services
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedVendor.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Performance Metrics
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedVendor.performance.onTimeDelivery}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">On-Time Delivery</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedVendor.performance.qualityScore}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quality Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedVendor.performance.responseTime}h</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Response Time</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { SupplyChainManagement };
