import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {!isAuthenticated 
              ? "You need to be logged in to access this page."
              : `Sorry, you don't have permission to access this page. Your current role (${user?.role?.replace('_', ' ')}) doesn't have the required permissions.`
            }
          </p>

          {isAuthenticated && (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Current User:</strong> {user?.firstName} {user?.lastName}<br />
                <strong>Role:</strong> {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}<br />
                <strong>Email:</strong> {user?.email}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!isAuthenticated ? (
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleGoBack}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Go Back</span>
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Go to Homepage</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            Need access? Contact your administrator at{' '}
            <a href="mailto:admin@shipsmart.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              admin@shipsmart.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
