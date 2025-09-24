import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Bell,
  Filter,
  Search,
  Download,
  RefreshCw,
  MapPin,
  Clock,
  BarChart3,
  Zap,
  Warehouse,
  Truck,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AnimatedCounter, AnimatedProgressBar, NotificationToast } from './AnimatedElements';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  maxCapacity: number;
  location: string;
  warehouse: string;
  lastUpdated: Date;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  value: number;
  supplier: string;
  inTransit: number;
  reserved: number;
  available: number;
  trend: 'up' | 'down' | 'stable';
  velocity: number;
  reorderPoint: number;
  leadTime: number;
}

interface InventoryAlert {
  id: string;
  type: 'low-stock' | 'out-of-stock' | 'overstock' | 'expiring' | 'damaged';
  severity: 'low' | 'medium' | 'high' | 'critical';
  itemId: string;
  itemName: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  location: string;
}

interface WarehouseMetrics {
  warehouseId: string;
  name: string;
  location: string;
  totalItems: number;
  totalValue: number;
  utilizationRate: number;
  alertsCount: number;
  lastSync: Date;
  status: 'online' | 'offline' | 'syncing';
}

export const RealTimeInventory: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseMetrics[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showAlerts, setShowAlerts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    show: false,
    type: 'info',
    message: ''
  });

  const alertSoundRef = useRef<HTMLAudioElement | null>(null);

  // Mock data initialization
  useEffect(() => {
    alertSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');

    const mockInventory: InventoryItem[] = [
      {
        id: 'inv-001',
        sku: 'ELEC-001',
        name: 'Smartphone Components',
        category: 'Electronics',
        currentStock: 45,
        minThreshold: 50,
        maxCapacity: 500,
        location: 'A-1-15',
        warehouse: 'WH-NYC',
        lastUpdated: new Date(),
        status: 'low-stock',
        value: 125000,
        supplier: 'TechSupply Co',
        inTransit: 100,
        reserved: 25,
        available: 20,
        trend: 'down',
        velocity: 15,
        reorderPoint: 75,
        leadTime: 7
      },
      {
        id: 'inv-002',
        sku: 'TEXT-001',
        name: 'Cotton Fabric Rolls',
        category: 'Textiles',
        currentStock: 0,
        minThreshold: 20,
        maxCapacity: 200,
        location: 'B-2-08',
        warehouse: 'WH-LA',
        lastUpdated: new Date(),
        status: 'out-of-stock',
        value: 0,
        supplier: 'Fabric World',
        inTransit: 50,
        reserved: 0,
        available: 0,
        trend: 'down',
        velocity: 8,
        reorderPoint: 30,
        leadTime: 14
      }
    ];

    const mockWarehouses: WarehouseMetrics[] = [
      {
        warehouseId: 'WH-NYC',
        name: 'New York Distribution Center',
        location: 'New York, NY',
        totalItems: 1250,
        totalValue: 2500000,
        utilizationRate: 78,
        alertsCount: 3,
        lastSync: new Date(),
        status: 'online'
      },
      {
        warehouseId: 'WH-LA',
        name: 'Los Angeles Warehouse',
        location: 'Los Angeles, CA',
        totalItems: 980,
        totalValue: 1800000,
        utilizationRate: 65,
        alertsCount: 5,
        lastSync: new Date(),
        status: 'online'
      }
    ];

    const mockAlerts: InventoryAlert[] = [
      {
        id: 'alert-001',
        type: 'low-stock',
        severity: 'high',
        itemId: 'inv-001',
        itemName: 'Smartphone Components',
        message: 'Stock level below minimum threshold (45/50)',
        timestamp: new Date(),
        acknowledged: false,
        location: 'WH-NYC'
      },
      {
        id: 'alert-002',
        type: 'out-of-stock',
        severity: 'critical',
        itemId: 'inv-002',
        itemName: 'Cotton Fabric Rolls',
        message: 'Item completely out of stock',
        timestamp: new Date(),
        acknowledged: false,
        location: 'WH-LA'
      }
    ];

    setInventoryItems(mockInventory);
    setWarehouses(mockWarehouses);
    setAlerts(mockAlerts);
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setInventoryItems(prev => prev.map(item => {
        const change = Math.floor(Math.random() * 10) - 5;
        const newStock = Math.max(0, Math.min(item.maxCapacity, item.currentStock + change));
        
        let newStatus: InventoryItem['status'] = 'in-stock';
        if (newStock === 0) newStatus = 'out-of-stock';
        else if (newStock < item.minThreshold) newStatus = 'low-stock';
        else if (newStock > item.maxCapacity * 0.9) newStatus = 'overstocked';

        const newTrend: InventoryItem['trend'] = 
          change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

        return {
          ...item,
          currentStock: newStock,
          available: Math.max(0, newStock - item.reserved),
          status: newStatus,
          trend: newTrend,
          lastUpdated: new Date()
        };
      }));

      if (Math.random() > 0.9) {
        const alertTypes: InventoryAlert['type'][] = ['low-stock', 'expiring', 'damaged'];
        const severities: InventoryAlert['severity'][] = ['low', 'medium', 'high'];
        
        const newAlert: InventoryAlert = {
          id: `alert-${Date.now()}`,
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          itemId: 'inv-new',
          itemName: 'Random Item',
          message: 'New inventory alert generated',
          timestamp: new Date(),
          acknowledged: false,
          location: 'WH-NYC'
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
        
        if (alertSoundRef.current) {
          alertSoundRef.current.volume = 0.3;
          alertSoundRef.current.play().catch(() => {});
        }

        setToast({
          show: true,
          type: 'warning',
          message: `New ${newAlert.type.replace('-', ' ')} alert: ${newAlert.itemName}`
        });
      }

      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredInventory = inventoryItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesWarehouse && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'stock': return b.currentStock - a.currentStock;
        case 'value': return b.value - a.value;
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
    setToast({
      show: true,
      type: 'success',
      message: 'Inventory data refreshed successfully'
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'low-stock': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'out-of-stock': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case 'overstocked': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.value, 0);
  const lowStockItems = inventoryItems.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length;
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Warehouse className="w-6 h-6 text-blue-600" />
            <span>Real-Time Inventory</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live inventory tracking across all warehouses
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
              <AnimatedCounter value={inventoryItems.reduce((sum, item) => sum + item.currentStock, 0)} />
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
              <AnimatedCounter value={totalValue} prefix="$" />
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Items</p>
              <AnimatedCounter value={lowStockItems} />
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
              <AnimatedCounter value={unacknowledgedAlerts} />
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg relative">
              <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
              {unacknowledgedAlerts > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <NotificationToast
        type={toast.type}
        message={toast.message}
        show={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};
