import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EnhancedAuthProvider, useEnhancedAuth } from '../contexts/EnhancedAuthContext';
import { EnhancedMobileNavigation } from './EnhancedMobileNavigation';
import { MobileDashboard } from './MobileDashboard';
import { MobileAlert, MobileLoading } from './MobileUILibrary';
import { realTimeService, useRealTime } from '../services/realTimeService';
import { 
  Wifi, WifiOff, Battery, Signal, Clock, 
  Bell, MessageCircle, Phone, Mail
} from 'lucide-react';

// Mobile Status Bar Component
const MobileStatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);
  const { isConnected, unreadCount } = useRealTime();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-1 text-xs">
      <div className="flex items-center justify-between">
        {/* Left side - Time and Connection */}
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3" />
          <span className="font-medium">{formatTime(currentTime)}</span>
          {isConnected ? (
            <Wifi className="w-3 h-3 text-green-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-400" />
          )}
        </div>

        {/* Center - App name */}
        <div className="font-semibold">
          RaphTrack
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <div className="flex items-center">
              <Bell className="w-3 h-3" />
              <span className="ml-1 bg-red-500 text-white rounded-full px-1 text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
          <div className="flex items-center">
            <Signal className="w-3 h-3" />
            <div className="ml-1 flex space-x-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-2 rounded-sm ${
                    i < signalStrength ? 'bg-white' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Battery className="w-3 h-3" />
            <span className="ml-1">{batteryLevel}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Loading Screen
const MobileLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mb-6 mx-auto shadow-xl">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">RaphTrack</h1>
        <p className="text-blue-100 mb-8">Global Logistics Platform</p>
        <MobileLoading size="lg" color="white" />
        <p className="text-blue-200 text-sm mt-4">Loading your dashboard...</p>
      </div>
    </div>
  );
};

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { user, isAuthenticated, isLoading } = useEnhancedAuth();

  if (isLoading) {
    return <MobileLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <MobileAlert
          type="error"
          title="Access Denied"
          message="You don't have permission to access this page."
        />
      </div>
    );
  }

  return <>{children}</>;
};

// Main Mobile App Component
const MobileAppContent: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useEnhancedAuth();
  const { connect, isConnected } = useRealTime();
  const [appLoading, setAppLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Simulate app initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Connect to real-time service if authenticated
        if (isAuthenticated && user) {
          await connect(user.id, 'mock-token');
        }
        
        setAppLoading(false);
      } catch (error) {
        setConnectionError('Failed to initialize app. Please try again.');
        setAppLoading(false);
      }
    };

    if (!isLoading) {
      initializeApp();
    }
  }, [isLoading, isAuthenticated, user, connect]);

  // Show loading screen during initialization
  if (isLoading || appLoading) {
    return <MobileLoadingScreen />;
  }

  // Show connection error
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <MobileAlert
          type="error"
          title="Connection Error"
          message={connectionError}
          onClose={() => setConnectionError(null)}
        />
      </div>
    );
  }

  const handleNavigate = (path: string) => {
    console.log('Navigating to:', path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Status Bar */}
      <MobileStatusBar />
      
      {/* Navigation */}
      <EnhancedMobileNavigation onNavigate={handleNavigate} />
      
      {/* Connection Status */}
      {!isConnected && isAuthenticated && (
        <div className="fixed top-20 left-4 right-4 z-40">
          <MobileAlert
            type="warning"
            message="Reconnecting to live updates..."
          />
        </div>
      )}

      {/* Main Content */}
      <div className="pt-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
          <Route path="/forgot-password" element={<div>Forgot Password</div>} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MobileDashboard />
            </ProtectedRoute>
          } />
          
          {/* Role-specific routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRoles={['system_administrator']}>
              <div>Admin Dashboard</div>
            </ProtectedRoute>
          } />
          
          <Route path="/shipper/*" element={
            <ProtectedRoute requiredRoles={['shipper']}>
              <MobileDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/carrier/*" element={
            <ProtectedRoute requiredRoles={['carrier']}>
              <MobileDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/driver/*" element={
            <ProtectedRoute requiredRoles={['driver']}>
              <MobileDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dispatcher/*" element={
            <ProtectedRoute requiredRoles={['dispatcher']}>
              <MobileDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/customer-service/*" element={
            <ProtectedRoute requiredRoles={['customer_service']}>
              <MobileDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/finance/*" element={
            <ProtectedRoute requiredRoles={['finance']}>
              <MobileDashboard />
            </ProtectedRoute>
          } />
          
          {/* Feature routes */}
          <Route path="/shipments/*" element={
            <ProtectedRoute>
              <div>Shipments</div>
            </ProtectedRoute>
          } />
          
          <Route path="/tracking" element={
            <ProtectedRoute>
              <div>Tracking</div>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics/*" element={
            <ProtectedRoute>
              <div>Analytics</div>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <div>Profile</div>
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <MobileAlert
                type="info"
                title="Page Not Found"
                message="The page you're looking for doesn't exist."
              />
            </div>
          } />
        </Routes>
      </div>

      {/* Mobile-specific features */}
      {isAuthenticated && (
        <>
          {/* Floating Action Button for quick actions */}
          <div className="md:hidden fixed bottom-20 right-4 z-40">
            <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center active:scale-95">
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Contact Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
            <div className="flex items-center justify-around">
              <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors">
                <Phone className="w-5 h-5 mb-1" />
                <span className="text-xs">Call</span>
              </button>
              <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-5 h-5 mb-1" />
                <span className="text-xs">Chat</span>
              </button>
              <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors">
                <Mail className="w-5 h-5 mb-1" />
                <span className="text-xs">Email</span>
              </button>
              <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-blue-600 transition-colors">
                <Bell className="w-5 h-5 mb-1" />
                <span className="text-xs">Alerts</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main App Wrapper
export const MobileApp: React.FC = () => {
  return (
    <EnhancedAuthProvider>
      <Router>
        <MobileAppContent />
      </Router>
    </EnhancedAuthProvider>
  );
};
