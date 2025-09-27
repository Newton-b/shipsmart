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
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => handleMenuClick('/')}
              className="flex items-center space-x-2 group"
            >
              <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                <Anchor className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">RaphTrack</span>
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated && (
              <div className="hidden sm:block">
                <NotificationBell />
              </div>
            )}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {isAuthenticated ? (
              <div className="hidden sm:block">
                <UserProfile onNavigate={onNavigate} />
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => handleMenuClick('/login')}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Login
                </button>
                <button
                  onClick={() => handleMenuClick('/register')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Toggle mobile menu"
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute inset-0 transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-180 opacity-0' : 'rotate-0 opacity-100'}`}>
                    <Menu className="h-6 w-6" />
                  </span>
                  <span className={`absolute inset-0 transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'}`}>
                    <X className="h-6 w-6" />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile User Profile Section */}
              {isAuthenticated && (
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <UserProfile onNavigate={onNavigate} />
                </div>
              )}

              {/* Mobile Quick Actions */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                {isAuthenticated && <NotificationBell />}
                <ThemeToggle />
                {!isAuthenticated && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleMenuClick('/login')}
                      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleMenuClick('/register')}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <button
                  onClick={() => handleMenuClick('/')}
                  className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                >
                  Home
                </button>

                {/* Mobile Services Section */}
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Services</div>
                  {services.map((service) => (
                    <button
                      key={service.path}
                      onClick={() => handleMenuClick(service.path)}
                      className="flex items-center w-full px-6 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    >
                      {service.name}
                    </button>
                  ))}
                </div>

                {/* Mobile Resources Section */}
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Resources</div>
                  {resources.map((resource) => (
                    <button
                      key={resource.path}
                      onClick={() => handleMenuClick(resource.path)}
                      className="flex items-center w-full px-6 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    >
                      {resource.name}
                    </button>
                  ))}
                </div>

                {/* Mobile Company Section */}
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Company</div>
                  {company.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleMenuClick(item.path)}
                      className="flex items-center w-full px-6 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>

                {/* Mobile Role-based navigation items */}
                {isAuthenticated && isShipper && (
                  <button
                    onClick={() => handleMenuClick('/tracking')}
                    className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                  >
                    Track Shipments
                  </button>
                )}

                {isAuthenticated && isSystemAdmin && (
                  <button
                    onClick={() => handleMenuClick('/admin')}
                    className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                  >
                    Admin Dashboard
                  </button>
                )}

                {/* Show Track for non-authenticated users */}
                {!isAuthenticated && (
                  <button
                    onClick={() => handleMenuClick('/track')}
                    className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                  >
                    Track
                  </button>
                )}

                <button
                  onClick={() => handleMenuClick('/contact')}
                  className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
