import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Home, Package, Truck, Ship, Plane, Warehouse, 
  FileText, Calculator, Book, Users, Settings, LogOut, 
  Bell, Search, User, ChevronRight, ChevronDown, MapPin,
  BarChart3, CreditCard, Shield, Headphones, Globe,
  Clock, Star, Zap, Activity, TrendingUp, DollarSign
} from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  badge?: number;
  children?: NavigationItem[];
  roles?: UserRole[];
  isNew?: boolean;
  isPro?: boolean;
}

interface EnhancedMobileNavigationProps {
  onNavigate: (path: string) => void;
}

export const EnhancedMobileNavigation: React.FC<EnhancedMobileNavigationProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Role-based navigation structure
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: user?.role === 'system_administrator' ? '/admin' :
            user?.role === 'carrier' ? '/carrier' :
            user?.role === 'driver' ? '/driver' :
            user?.role === 'dispatcher' ? '/dispatcher' :
            user?.role === 'customer_service' ? '/customer-service' :
            user?.role === 'finance' ? '/finance' : '/shipper',
      roles: ['system_administrator', 'shipper', 'carrier', 'driver', 'dispatcher', 'customer_service', 'finance']
    },
    {
      id: 'shipments',
      label: 'Shipments',
      icon: Package,
      badge: 12,
      roles: ['system_administrator', 'shipper', 'carrier', 'driver', 'dispatcher', 'customer_service'],
      children: [
        { id: 'active-shipments', label: 'Active Shipments', icon: Activity, path: '/shipments/active', badge: 8 },
        { id: 'create-shipment', label: 'Create Shipment', icon: Zap, path: '/shipments/create', isNew: true },
        { id: 'shipment-history', label: 'History', icon: Clock, path: '/shipments/history' },
        { id: 'tracking', label: 'Track & Trace', icon: MapPin, path: '/tracking' }
      ]
    },
    {
      id: 'services',
      label: 'Services',
      icon: Truck,
      roles: ['system_administrator', 'shipper', 'carrier', 'dispatcher'],
      children: [
        { id: 'ocean-freight', label: 'Ocean Freight', icon: Ship, path: '/services/ocean' },
        { id: 'air-freight', label: 'Air Freight', icon: Plane, path: '/services/air' },
        { id: 'ground-transport', label: 'Ground Transport', icon: Truck, path: '/services/ground' },
        { id: 'warehousing', label: 'Warehousing', icon: Warehouse, path: '/services/warehouse' },
        { id: 'customs', label: 'Customs Clearance', icon: FileText, path: '/services/customs' }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      roles: ['system_administrator', 'shipper', 'carrier', 'dispatcher', 'finance'],
      children: [
        { id: 'performance', label: 'Performance', icon: TrendingUp, path: '/analytics/performance' },
        { id: 'costs', label: 'Cost Analysis', icon: DollarSign, path: '/analytics/costs' },
        { id: 'reports', label: 'Reports', icon: FileText, path: '/analytics/reports' }
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: CreditCard,
      roles: ['system_administrator', 'shipper', 'finance'],
      children: [
        { id: 'invoices', label: 'Invoices', icon: FileText, path: '/finance/invoices', badge: 3 },
        { id: 'payments', label: 'Payments', icon: CreditCard, path: '/finance/payments' },
        { id: 'billing', label: 'Billing', icon: DollarSign, path: '/finance/billing' }
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      roles: ['system_administrator', 'customer_service', 'dispatcher'],
      children: [
        { id: 'customer-list', label: 'All Customers', icon: Users, path: '/customers' },
        { id: 'customer-support', label: 'Support Tickets', icon: Headphones, path: '/customers/support', badge: 5 }
      ]
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: Shield,
      roles: ['system_administrator'],
      children: [
        { id: 'user-management', label: 'User Management', icon: Users, path: '/admin/users' },
        { id: 'system-settings', label: 'System Settings', icon: Settings, path: '/admin/settings' },
        { id: 'security', label: 'Security', icon: Shield, path: '/admin/security' }
      ]
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: Calculator,
      roles: ['system_administrator', 'shipper', 'carrier', 'dispatcher'],
      children: [
        { id: 'rate-calculator', label: 'Rate Calculator', icon: Calculator, path: '/tools/calculator' },
        { id: 'documentation', label: 'Documentation', icon: Book, path: '/tools/docs' },
        { id: 'api-reference', label: 'API Reference', icon: Globe, path: '/tools/api' }
      ]
    }
  ];

  // Filter navigation items based on user role
  const getFilteredNavigation = () => {
    if (!user) return [];
    
    return navigationItems.filter(item => 
      !item.roles || item.roles.includes(user.role)
    ).map(item => ({
      ...item,
      children: item.children?.filter(child => 
        !child.roles || child.roles.includes(user.role)
      )
    }));
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
    onNavigate(path);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const filteredNavigation = getFilteredNavigation();

  const renderNavItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = window.location.pathname === item.path;

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.path) {
              handleNavigate(item.path);
            }
          }}
          className={`
            w-full flex items-center justify-between px-4 py-4 text-left
            transition-all duration-200 min-h-[56px] touch-manipulation
            ${level > 0 ? 'pl-12 bg-gray-800/50' : ''}
            ${isActive 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-300 hover:bg-gray-800 active:bg-gray-700'
            }
            active:scale-[0.98] group
          `}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className={`
              p-2 rounded-lg transition-colors
              ${isActive 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
              }
            `}>
              <item.icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{item.label}</span>
                {item.isNew && (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    NEW
                  </span>
                )}
                {item.isPro && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    PRO
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              )}
            </div>
          </div>
        </button>

        {hasChildren && isExpanded && (
          <div className="bg-gray-800/30 border-l-2 border-blue-500/30 ml-4">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 shadow-xl border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3 min-h-[64px]">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">RaphTrack</span>
              <div className="text-xs text-gray-400 -mt-1">
                {user?.role?.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button className="relative p-3 hover:bg-gray-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Search className="w-5 h-5 text-gray-300" />
            </button>

            {/* Notifications */}
            <button className="relative p-3 hover:bg-gray-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Bell className="w-5 h-5 text-gray-300" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                  {notifications}
                </span>
              )}
            </button>

            {/* Menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 hover:bg-gray-800 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-70 transition-opacity backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  {user?.firstName ? (
                    <span className="text-white font-bold text-sm">
                      {user.firstName[0]}{user.lastName?.[0]}
                    </span>
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {user?.role?.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`
                    w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400
                    transition-all duration-200 text-sm
                    ${isSearchFocused 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : 'border-gray-600 hover:border-gray-500'
                    }
                  `}
                />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                {filteredNavigation
                  .filter(item => 
                    !searchQuery || 
                    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.children?.some(child => 
                      child.label.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  )
                  .map(item => renderNavItem(item))
                }
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-700 bg-gray-800">
              <button
                onClick={() => handleNavigate('/profile')}
                className="w-full flex items-center space-x-3 px-4 py-4 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <div className="p-2 bg-gray-700 rounded-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">Settings</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-4 text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <div className="p-2 bg-red-900/30 rounded-lg">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="md:hidden h-[64px]" />
    </>
  );
};
