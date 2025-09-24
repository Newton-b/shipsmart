import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Anchor } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserProfile } from './UserProfile';
import NotificationBell from './NotificationBell';
import { useAuth } from '../contexts/AuthContext';

interface FreightNavigationProps {
  onNavigate?: (page: string) => void;
}

export const FreightNavigation: React.FC<FreightNavigationProps> = ({ onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const { isAuthenticated, isSystemAdmin, isShipper } = useAuth();
  const navigate = useNavigate();

  const services = [
    { name: 'Ocean Freight', path: '/ocean-freight' },
    { name: 'Air Freight', path: '/air-freight' },
    { name: 'Ground Transportation', path: '/ground-transport' },
    { name: 'Customs Clearance', path: '/customs' },
    { name: 'Warehousing', path: '/warehousing' },
    { name: 'Project Cargo', path: '/project-cargo' },
  ];

  const resources = [
    { name: 'Documentation', path: '/documentation' },
    { name: 'API Reference', path: '/api-reference' },
    { name: 'Shipping Calculator', path: '/shipping-calculator' },
  ];

  const company = [
    { name: 'About Us', path: '/about' },
    { name: 'Team', path: '/team' },
    { name: 'Careers', path: '/careers' },
    { name: 'News', path: '/news' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Partners', path: '/partners' },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
    setIsResourcesOpen(false);
    setIsCompanyOpen(false);
    
    // Call the optional callback for backward compatibility
    if (onNavigate) {
      onNavigate(path.replace('/', ''));
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleMenuClick('/')}
              className="flex items-center space-x-2"
            >
              <Anchor className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">ShipSmart</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleMenuClick('/')}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Home
            </button>

            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Services
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {isServicesOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {services.map((service) => (
                    <button
                      key={service.path}
                      onClick={() => handleMenuClick(service.path)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsResourcesOpen(true)}
              onMouseLeave={() => setIsResourcesOpen(false)}
            >
              <button
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Resources
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {isResourcesOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {resources.map((resource) => (
                    <button
                      key={resource.path}
                      onClick={() => handleMenuClick(resource.path)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {resource.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Company Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsCompanyOpen(true)}
              onMouseLeave={() => setIsCompanyOpen(false)}
            >
              <button
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Company
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              
              {isCompanyOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {company.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleMenuClick(item.path)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role-based navigation items */}
            {isAuthenticated && isShipper && (
              <button
                onClick={() => handleMenuClick('/tracking')}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Track Shipments
              </button>
            )}

            {/* Admin Dashboard removed from main navigation - only accessible via profile dropdown or direct URL */}

            {/* Show Track for non-authenticated users */}
            {!isAuthenticated && (
              <button
                onClick={() => handleMenuClick('/track')}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Track
              </button>
            )}

            <button
              onClick={() => handleMenuClick('/products')}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Products
            </button>

            <button
              onClick={() => handleMenuClick('/contact')}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Right side - Notifications, Theme Toggle and Auth */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && <NotificationBell />}
            <ThemeToggle />
            
            {isAuthenticated ? (
              <UserProfile onNavigate={onNavigate} />
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => handleMenuClick('/login')}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => handleMenuClick('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => handleMenuClick('/')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                Home
              </button>

              {/* Mobile Services */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-base font-medium text-gray-900 dark:text-white">Services</div>
                {services.map((service) => (
                  <button
                    key={service.path}
                    onClick={() => handleMenuClick(service.path)}
                    className="block w-full text-left px-6 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {service.name}
                  </button>
                ))}
              </div>

              {/* Mobile Resources */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-base font-medium text-gray-900 dark:text-white">Resources</div>
                {resources.map((resource) => (
                  <button
                    key={resource.path}
                    onClick={() => handleMenuClick(resource.path)}
                    className="block w-full text-left px-6 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {resource.name}
                  </button>
                ))}
              </div>

              {/* Mobile Company */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-base font-medium text-gray-900 dark:text-white">Company</div>
                {company.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleMenuClick(item.path)}
                    className="block w-full text-left px-6 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Mobile Role-based navigation items */}
              {isAuthenticated && isShipper && (
                <button
                  onClick={() => handleMenuClick('/tracking')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Track Shipments
                </button>
              )}

              {isAuthenticated && isSystemAdmin && (
                <button
                  onClick={() => handleMenuClick('/admin')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Admin Dashboard
                </button>
              )}

              {/* Show Track for non-authenticated users */}
              {!isAuthenticated && (
                <button
                  onClick={() => handleMenuClick('/track')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Track
                </button>
              )}

              <button
                onClick={() => handleMenuClick('/contact')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                Contact
              </button>

              {/* Mobile Auth */}
              {!isAuthenticated && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <button
                    onClick={() => handleMenuClick('/login')}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleMenuClick('/register')}
                    className="block w-full text-left px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
