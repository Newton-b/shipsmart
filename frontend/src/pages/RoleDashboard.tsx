import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Users, 
  MessageSquare, 
  DollarSign,
  Package,
  Ship,
  ArrowRight,
  Activity,
  BarChart3,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RoleCard {
  id: string;
  name: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
  bgGradient: string;
}

const RoleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const roles: RoleCard[] = [
    {
      id: 'shipper',
      name: 'Shipper Dashboard',
      description: 'Manage your shipments, track deliveries, and monitor logistics operations',
      features: ['Live Tracking Map', 'Shipment Management', 'Analytics Dashboard', 'Real-time Notifications'],
      icon: Package,
      path: '/shipper',
      color: 'text-blue-600',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'carrier',
      name: 'Carrier Dashboard',
      description: 'Fleet management, operations oversight, and business analytics',
      features: ['Fleet Overview', 'Operations Management', 'Performance Analytics', 'Route Optimization'],
      icon: Ship,
      path: '/carrier',
      color: 'text-green-600',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      id: 'driver',
      name: 'Driver Dashboard',
      description: 'Delivery routes, customer locations, and real-time navigation',
      features: ['Live Delivery Map', 'Customer Locations', 'Route Optimization', 'Performance Tracking'],
      icon: Truck,
      path: '/driver',
      color: 'text-orange-600',
      bgGradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'dispatcher',
      name: 'Dispatcher Dashboard',
      description: 'Fleet coordination, route optimization, and driver management',
      features: ['Fleet Management', 'Route Planning', 'Driver Analytics', 'Real-time Tracking'],
      icon: Users,
      path: '/dispatcher',
      color: 'text-purple-600',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'customer-service',
      name: 'Customer Service',
      description: 'Support ticket management, live chat, and customer analytics',
      features: ['Ticket Management', 'Live Chat Support', 'Customer Analytics', 'Knowledge Base'],
      icon: MessageSquare,
      path: '/customer-service',
      color: 'text-pink-600',
      bgGradient: 'from-pink-500 to-pink-600'
    },
    {
      id: 'finance',
      name: 'Finance Dashboard',
      description: 'Financial analytics, invoicing, and comprehensive reporting',
      features: ['Financial Analytics', 'Invoice Management', 'Revenue Tracking', 'Expense Reports'],
      icon: DollarSign,
      path: '/finance',
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  const handleRoleSelect = (role: RoleCard) => {
    navigate(role.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to ShipSmart
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            Hello, {user?.firstName}! Choose your role to access specialized features
          </p>
          <p className="text-gray-500 dark:text-gray-500">
            Each dashboard is tailored with live analytics, real-time maps, and interactive features
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
              >
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-r ${role.bgGradient} p-6 rounded-t-xl`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{role.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Activity className="w-4 h-4 text-white/80" />
                        <span className="text-white/80 text-sm">Live & Interactive</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {role.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg transition-colors">
                    <span className="font-medium">Access Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Live Indicators */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>Real-time Maps</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>Live Analytics</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="w-3 h-3 text-green-500" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              All Dashboards Feature
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Live Maps</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Real-time vehicle tracking</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Live data visualization</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Real-time Updates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Live notifications & alerts</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Collaboration</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Team communication tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDashboard;
