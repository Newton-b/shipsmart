import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  MapPin, 
  MessageCircle, 
  Brain, 
  Package, 
  CreditCard,
  Users,
  Settings,
  Maximize2,
  Minimize2,
  Grid3X3,
  List,
  Filter,
  RefreshCw,
  Download,
  Share,
  Bell,
  Activity,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { useAnalytics, useShipments, useVehicles, useDatabaseConnection } from '../hooks/useRealtimeDatabase';
import { DatabaseStatus } from '../components/DatabaseStatus';
import { RealTimeTrackingMap } from '../components/RealTimeTrackingMap';
import { LiveAnalyticsDashboard } from '../components/LiveAnalyticsDashboard';
import { TeamCollaboration } from '../components/TeamCollaboration';
import { AISmartRecommendations } from '../components/AISmartRecommendations';
import { EnhancedPredictiveAnalytics } from '../components/EnhancedPredictiveAnalytics';
import { InteractiveProductSelector } from '../components/InteractiveProductSelector';
import { PaymentIntegration } from '../components/PaymentIntegration';
import { AnimatedCounter, PulsingDots } from '../components/AnimatedElements';

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  icon: React.ComponentType;
  category: 'tracking' | 'analytics' | 'collaboration' | 'ai' | 'commerce';
  size: 'small' | 'medium' | 'large' | 'full';
  priority: number;
  isVisible: boolean;
  props?: any;
}

interface DashboardStats {
  totalShipments: number;
  activeVehicles: number;
  revenue: number;
  customerSatisfaction: number;
  onTimeDelivery: number;
  pendingOrders: number;
}

export const EnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Real-time database hooks
  const { data: analyticsData, connected: dbConnected } = useAnalytics();
  const { data: shipmentsData } = useShipments();
  const { data: vehiclesData } = useVehicles();
  const { connected } = useDatabaseConnection();

  // Get real-time stats from database
  const dashboardStats: DashboardStats = analyticsData.length > 0 ? {
    totalShipments: analyticsData[0].totalShipments || 1247,
    activeVehicles: analyticsData[0].activeVehicles || 156,
    revenue: analyticsData[0].revenue || 89750,
    customerSatisfaction: analyticsData[0].customerSatisfaction || 4.7,
    onTimeDelivery: analyticsData[0].onTimeDelivery || 94.8,
    pendingOrders: analyticsData[0].pendingOrders || 23
  } : {
    totalShipments: 1247,
    activeVehicles: 156,
    revenue: 89750,
    customerSatisfaction: 4.7,
    onTimeDelivery: 94.8,
    pendingOrders: 23
  };

  const lastUpdate = analyticsData.length > 0 ? new Date(analyticsData[0].lastUpdate) : new Date();

  // Add database status widget
  const databaseStatusWidget: DashboardWidget = {
    id: 'database-status',
    title: 'Database Status',
    component: DatabaseStatus,
    icon: Database,
    category: 'tracking',
    size: 'small',
    priority: 0,
    isVisible: true,
    props: { showDetails: true }
  };

  // Define available widgets
  const availableWidgets: DashboardWidget[] = [
    {
      id: 'tracking-map',
      title: 'Live Tracking Map',
      component: RealTimeTrackingMap,
      icon: MapPin,
      category: 'tracking',
      size: 'large',
      priority: 1,
      isVisible: true,
      props: { className: 'h-96' }
    },
    {
      id: 'analytics-dashboard',
      title: 'Live Analytics',
      component: LiveAnalyticsDashboard,
      icon: TrendingUp,
      category: 'analytics',
      size: 'large',
      priority: 2,
      isVisible: true,
      props: { className: 'h-96' }
    },
    {
      id: 'team-collaboration',
      title: 'Team Chat',
      component: TeamCollaboration,
      icon: MessageCircle,
      category: 'collaboration',
      size: 'medium',
      priority: 3,
      isVisible: true,
      props: { className: 'h-80' }
    },
    {
      id: 'ai-recommendations',
      title: 'AI Recommendations',
      component: AISmartRecommendations,
      icon: Brain,
      category: 'ai',
      size: 'large',
      priority: 4,
      isVisible: true,
      props: { className: 'h-96' }
    },
    {
      id: 'predictive-analytics',
      title: 'Predictive Analytics',
      component: EnhancedPredictiveAnalytics,
      icon: Brain,
      category: 'ai',
      size: 'large',
      priority: 5,
      isVisible: true,
      props: { className: 'h-96' }
    },
    {
      id: 'product-selector',
      title: 'Product Selection',
      component: InteractiveProductSelector,
      icon: Package,
      category: 'commerce',
      size: 'large',
      priority: 6,
      isVisible: true,
      props: { 
        onProductSelect: (product: any) => setSelectedProduct(product),
        onPriceUpdate: (price: number) => console.log('Price updated:', price)
      }
    }
  ];

  const [widgets, setWidgets] = useState<DashboardWidget[]>([databaseStatusWidget, ...availableWidgets]);

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setShowPayment(true);
    createNotification({
      title: 'Product Selected',
      message: `${product.name} selected for booking`,
      type: 'system_alert'
    });
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPayment(false);
    setSelectedProduct(null);
    createNotification({
      title: 'Payment Successful',
      message: `Payment ${paymentId} processed successfully`,
      type: 'system_alert'
    });
  };

  const handlePaymentError = (error: string) => {
    createNotification({
      title: 'Payment Failed',
      message: error,
      type: 'system_alert'
    });
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, isVisible: !widget.isVisible }
        : widget
    ));
  };

  const filteredWidgets = widgets.filter(widget => 
    widget.isVisible && (selectedCategory === 'all' || widget.category === selectedCategory)
  );

  const categories = [
    { id: 'all', label: 'All Widgets', icon: LayoutDashboard },
    { id: 'tracking', label: 'Tracking', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'collaboration', label: 'Collaboration', icon: MessageCircle },
    { id: 'ai', label: 'AI & Predictions', icon: Brain },
    { id: 'commerce', label: 'Commerce', icon: Package }
  ];

  const getGridClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-1 lg:col-span-2 row-span-1';
      case 'large':
        return 'col-span-1 lg:col-span-2 xl:col-span-3 row-span-1';
      case 'full':
        return 'col-span-full row-span-1';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
            {/* Title and Welcome */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Enhanced Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {user?.firstName || 'User'}! Here's your real-time overview.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shipments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={dashboardStats.totalShipments} />
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Fleet</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={dashboardStats.activeVehicles} />
                </p>
              </div>
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $<AnimatedCounter value={dashboardStats.revenue} />
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={dashboardStats.customerSatisfaction} suffix="/5" />
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On-Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={dashboardStats.onTimeDelivery} suffix="%" />
                </p>
              </div>
              <Activity className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={dashboardStats.pendingOrders} />
                </p>
              </div>
              <Bell className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Widgets Grid */}
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'space-y-6'
          }
        `}>
          {filteredWidgets
            .sort((a, b) => a.priority - b.priority)
            .map(widget => {
              const Component = widget.component;
              const Icon = widget.icon;
              
              return (
                <div
                  key={widget.id}
                  className={`
                    ${viewMode === 'grid' ? getGridClasses(widget.size) : ''}
                    bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden
                  `}
                >
                  {/* Widget Header */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {widget.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Widget Content */}
                  <div className="p-0">
                    <Component {...widget.props} />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Payment Modal */}
        {showPayment && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Complete Payment
                  </h2>
                  <button
                    onClick={() => setShowPayment(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <PaymentIntegration
                  amount={selectedProduct.basePrice || 100}
                  currency="USD"
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  shippingDetails={selectedProduct}
                />
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <DatabaseStatus compact={true} />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredWidgets.length} widgets active
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
);
};
