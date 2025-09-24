import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Warehouse,
  BarChart3,
  Filter,
  Download,
  Eye,
  MapPin,
  TrendingUp,
  TrendingDown,
  Zap,
  Bell,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  location: string;
  warehouse: string;
  supplier: string;
  lastUpdated: Date;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'on-order';
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  utilization: number;
  totalItems: number;
  totalValue: number;
}

export const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock' | 'on-order'>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'warehouses' | 'analytics'>('inventory');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time notifications integration
  const { createNotification, isConnected } = useNotifications();

  // Mock data
  useEffect(() => {
    const mockWarehouses: Warehouse[] = [
      {
        id: '1',
        name: 'Main Warehouse',
        location: 'New York, NY',
        capacity: 10000,
        utilization: 75,
        totalItems: 1250,
        totalValue: 2500000
      },
      {
        id: '2',
        name: 'West Coast Hub',
        location: 'Los Angeles, CA',
        capacity: 8000,
        utilization: 60,
        totalItems: 980,
        totalValue: 1800000
      },
      {
        id: '3',
        name: 'Distribution Center',
        location: 'Chicago, IL',
        capacity: 12000,
        utilization: 85,
        totalItems: 1680,
        totalValue: 3200000
      }
    ];

    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        sku: 'ELC-001',
        name: 'Industrial Electronics',
        description: 'High-grade electronic components for manufacturing',
        category: 'Electronics',
        quantity: 150,
        minStock: 50,
        maxStock: 500,
        unitPrice: 250,
        totalValue: 37500,
        location: 'A-12-03',
        warehouse: 'Main Warehouse',
        supplier: 'TechSupply Corp',
        lastUpdated: new Date('2024-01-15'),
        status: 'in-stock'
      },
      {
        id: '2',
        sku: 'TEX-002',
        name: 'Premium Textiles',
        description: 'High-quality fabric materials',
        category: 'Textiles',
        quantity: 25,
        minStock: 100,
        maxStock: 1000,
        unitPrice: 45,
        totalValue: 1125,
        location: 'B-05-12',
        warehouse: 'West Coast Hub',
        supplier: 'Global Textiles Ltd',
        lastUpdated: new Date('2024-01-14'),
        status: 'low-stock'
      },
      {
        id: '3',
        sku: 'MAC-003',
        name: 'Heavy Machinery Parts',
        description: 'Replacement parts for industrial machinery',
        category: 'Machinery',
        quantity: 0,
        minStock: 20,
        maxStock: 200,
        unitPrice: 1200,
        totalValue: 0,
        location: 'C-08-01',
        warehouse: 'Distribution Center',
        supplier: 'MachParts Inc',
        lastUpdated: new Date('2024-01-13'),
        status: 'out-of-stock'
      },
      {
        id: '4',
        sku: 'CHM-004',
        name: 'Chemical Compounds',
        description: 'Industrial grade chemical materials',
        category: 'Chemicals',
        quantity: 75,
        minStock: 30,
        maxStock: 300,
        unitPrice: 180,
        totalValue: 13500,
        location: 'D-15-07',
        warehouse: 'Main Warehouse',
        supplier: 'ChemSource Global',
        lastUpdated: new Date('2024-01-16'),
        status: 'on-order'
      }
    ];

    setWarehouses(mockWarehouses);
    setInventory(mockInventory);
  }, []);

  // Real-time inventory simulation
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      setInventory(prev => {
        const updated = prev.map(item => {
          // Simulate random inventory changes
          const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
          const newQuantity = Math.max(0, item.quantity + change);
          
          // Check for low stock alerts
          if (newQuantity <= item.minStock && item.quantity > item.minStock) {
            createNotification({
              type: 'system_alert',
              priority: 'high',
              title: 'Low Stock Alert',
              message: `${item.name} (${item.sku}) is running low in ${item.warehouse}`,
              data: {
                itemId: item.id,
                sku: item.sku,
                warehouse: item.warehouse,
                currentStock: newQuantity,
                minStock: item.minStock
              }
            });
          }

          // Determine new status
          let newStatus = item.status;
          if (newQuantity === 0) {
            newStatus = 'out-of-stock';
          } else if (newQuantity <= item.minStock) {
            newStatus = 'low-stock';
          } else {
            newStatus = 'in-stock';
          }

          return {
            ...item,
            quantity: newQuantity,
            totalValue: newQuantity * item.unitPrice,
            status: newStatus,
            lastUpdated: new Date()
          };
        });

        setLastUpdate(new Date());
        return updated;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLiveMode, createNotification]);

  // Function to create test notifications
  const createTestNotification = async (type: string) => {
    const notifications = {
      'low-stock': {
        type: 'system_alert' as const,
        priority: 'high' as const,
        title: 'Low Stock Alert',
        message: 'Multiple items are running low in inventory',
        data: { source: 'inventory-management', alertType: 'low-stock' }
      },
      'restock': {
        type: 'system_alert' as const,
        priority: 'medium' as const,
        title: 'Restock Notification',
        message: 'New inventory has been received and processed',
        data: { source: 'inventory-management', alertType: 'restock' }
      },
      'critical': {
        type: 'system_alert' as const,
        priority: 'critical' as const,
        title: 'CRITICAL: Out of Stock',
        message: 'Critical items are completely out of stock',
        data: { source: 'inventory-management', alertType: 'out-of-stock' }
      }
    };

    await createNotification(notifications[type as keyof typeof notifications]);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse;
    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'low-stock':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'out-of-stock':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'on-order':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const InventoryModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Inventory Item' : 'Add New Item'}
          </h3>
          <button 
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SKU
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                defaultValue={isEdit ? selectedItem?.sku : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Electronics</option>
                <option>Textiles</option>
                <option>Machinery</option>
                <option>Chemicals</option>
                <option>Automotive</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Item Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              defaultValue={isEdit ? selectedItem?.name : ''}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              defaultValue={isEdit ? selectedItem?.description : ''}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                defaultValue={isEdit ? selectedItem?.quantity : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Stock
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                defaultValue={isEdit ? selectedItem?.minStock : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Stock
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                defaultValue={isEdit ? selectedItem?.maxStock : ''}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEdit ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <Package className="w-8 h-8 text-blue-600" />
                <span>Inventory Management</span>
              </h1>
              
              {/* Live Status Indicator */}
              {isConnected && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Live Updates
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and manage your warehouse inventory • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Live Mode Toggle */}
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isLiveMode 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {isLiveMode ? <Zap className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
              <span>{isLiveMode ? 'Live Mode' : 'Paused'}</span>
            </button>

            {/* Test Notifications */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-medium transition-colors dark:bg-orange-900 dark:text-orange-300">
                <Bell className="w-4 h-4" />
                <span>Test Alerts</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => createTestNotification('low-stock')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Low Stock Alert
                </button>
                <button
                  onClick={() => createTestNotification('restock')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Restock Notification
                </button>
                <button
                  onClick={() => createTestNotification('critical')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Critical Alert
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'inventory' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex space-x-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                    <option value="on-order">On Order</option>
                  </select>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Warehouses</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.name}>{warehouse.name}</option>
                    ))}
                  </select>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              SKU: {item.sku} | {item.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <span className={`text-sm font-medium ${
                              item.status === 'in-stock' ? 'text-green-600' :
                              item.status === 'low-stock' ? 'text-yellow-600' :
                              item.status === 'out-of-stock' ? 'text-red-600' :
                              'text-blue-600'
                            }`}>
                              {item.status.replace('-', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {item.quantity} / {item.maxStock}
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${
                                item.quantity <= item.minStock ? 'bg-red-500' :
                                item.quantity <= item.minStock * 2 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${(item.quantity / item.maxStock) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {item.location}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.warehouse}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${item.totalValue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'warehouses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((warehouse) => (
              <div key={warehouse.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {warehouse.name}
                  </h3>
                  <Warehouse className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>{warehouse.location}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Utilization</span>
                      <span className="font-medium text-gray-900 dark:text-white">{warehouse.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${warehouse.utilization}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Items</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {warehouse.totalItems.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Value</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${(warehouse.totalValue / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showAddModal && <InventoryModal />}
        {showEditModal && <InventoryModal isEdit />}
      </div>
    </div>
  );
};
