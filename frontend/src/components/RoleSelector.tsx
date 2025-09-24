import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Users, 
  MessageSquare, 
  DollarSign,
  Package,
  Ship,
  User,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Role {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
}

const RoleSelector: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roles: Role[] = [
    {
      id: 'shipper',
      name: 'Shipper',
      description: 'Manage shipments and track deliveries',
      icon: Package,
      path: '/shipper',
      color: 'bg-blue-500'
    },
    {
      id: 'carrier',
      name: 'Carrier',
      description: 'Fleet management and operations',
      icon: Ship,
      path: '/carrier',
      color: 'bg-green-500'
    },
    {
      id: 'driver',
      name: 'Driver',
      description: 'Delivery routes and customer locations',
      icon: Truck,
      path: '/driver',
      color: 'bg-orange-500'
    },
    {
      id: 'dispatcher',
      name: 'Dispatcher',
      description: 'Fleet coordination and route optimization',
      icon: Users,
      path: '/dispatcher',
      color: 'bg-purple-500'
    },
    {
      id: 'customer-service',
      name: 'Customer Service',
      description: 'Support tickets and live chat',
      icon: MessageSquare,
      path: '/customer-service',
      color: 'bg-pink-500'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Financial analytics and billing',
      icon: DollarSign,
      path: '/finance',
      color: 'bg-indigo-500'
    }
  ];

  const handleRoleSelect = (role: Role) => {
    navigate(role.path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative">
      {/* Role Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select Role
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Choose Your Role
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Access different dashboards based on your function
            </p>
          </div>

          <div className="p-2">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {role.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600 dark:text-red-400"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default RoleSelector;
