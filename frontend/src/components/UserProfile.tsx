import React, { useState } from 'react';
import { User, Settings, LogOut, Bell, Package, BarChart3, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
  onNavigate?: (page: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const menuItems = [
    {
      icon: User,
      label: 'My Profile',
      action: () => handleNavigation('/profile'),
      description: 'Manage your account settings'
    },
    {
      icon: Package,
      label: 'My Shipments',
      action: () => handleNavigation('/my-shipments'),
      description: 'View and track your shipments'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      action: () => handleNavigation('/analytics'),
      description: 'View shipping analytics and reports'
    },
    {
      icon: Bell,
      label: 'Notifications',
      action: () => handleNavigation('/notifications'),
      description: 'Manage your notification preferences'
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => handleNavigation('/settings'),
      description: 'Account and application settings'
    }
  ];

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {getInitials()}
          </div>
        )}
        <span className="hidden md:block">{user.firstName}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                  {getInitials()}
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{user.company}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Sign Out</div>
                <div className="text-xs text-red-500 dark:text-red-400">Log out of your account</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
