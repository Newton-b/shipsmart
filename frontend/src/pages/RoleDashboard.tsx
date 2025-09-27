import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Users, 
  MessageSquare, 
  DollarSign,
  Package,
  Ship,
  Activity,
  BarChart3,
  MapPin,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RoleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Role to path mapping
  const rolePathMap: Record<string, string> = {
    'shipper': '/shipper',
    'carrier': '/carrier',
    'driver': '/driver',
    'dispatcher': '/dispatcher',
    'customer-service': '/customer-service',
    'finance': '/finance',
    'system-admin': '/admin'
  };

  // Auto-redirect based on user role
  useEffect(() => {
    if (user?.role) {
      const targetPath = rolePathMap[user.role];
      if (targetPath) {
        // Small delay to show loading state
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 1500);
      }
    }
  }, [user, navigate]);

  // Get role display information
  const getRoleInfo = (role: string) => {
    const roleInfo: Record<string, { name: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
      'shipper': { name: 'Shipper (Customer)', icon: Package, color: 'text-blue-600' },
      'system-admin': { name: 'System Administrator', icon: Users, color: 'text-purple-600' },
      'carrier': { name: 'Carrier (Freight Company)', icon: Ship, color: 'text-green-600' },
      'driver': { name: 'Driver', icon: Truck, color: 'text-orange-600' },
      'dispatcher': { name: 'Dispatcher', icon: MapPin, color: 'text-purple-600' },
      'customer-service': { name: 'Customer Service', icon: MessageSquare, color: 'text-pink-600' },
      'finance': { name: 'Finance', icon: DollarSign, color: 'text-indigo-600' }
    };
    return roleInfo[role] || { name: 'User', icon: Users, color: 'text-gray-600' };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(user.role);
  const IconComponent = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          {/* Loading Animation */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className={`w-8 h-8 ${roleInfo.color}`} />
            </div>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Loading your dashboard...</span>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to RaphTrack, {user.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Redirecting you to your {roleInfo.name} dashboard
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
              {roleInfo.name}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>

          {/* Features Preview */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Your dashboard includes:</p>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3 text-green-500" />
                <span>Live Data</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-3 h-3 text-blue-500" />
                <span>Analytics</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-purple-500" />
                <span>Real-time Maps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboard;
