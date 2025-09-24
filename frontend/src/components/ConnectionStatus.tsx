import React from 'react';
import { useApiContext } from '../contexts/ApiContext';

export function ConnectionStatus() {
  const { isOnline, isConnected, backendHealth, reconnect, lastError } = useApiContext();

  // Don't show anything if everything is working fine
  if (isOnline && isConnected && backendHealth === 'healthy') {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (backendHealth === 'unhealthy') return 'bg-red-500';
    if (!isConnected) return 'bg-yellow-500';
    if (backendHealth === 'checking') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'No internet connection';
    if (backendHealth === 'unhealthy') return 'Backend server unavailable';
    if (!isConnected) return 'Real-time features disconnected';
    if (backendHealth === 'checking') return 'Checking connection...';
    return 'Connected';
  };

  const getStatusIcon = () => {
    if (!isOnline || backendHealth === 'unhealthy') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    if (!isConnected || backendHealth === 'checking') {
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`${getStatusColor()} text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        
        {(backendHealth === 'unhealthy' || !isConnected) && (
          <button
            onClick={reconnect}
            className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
      
      {lastError && (
        <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs">
          {lastError}
        </div>
      )}
    </div>
  );
}

export function ConnectionIndicator() {
  const { isOnline, isConnected, backendHealth } = useApiContext();

  const getIndicatorColor = () => {
    if (!isOnline || backendHealth === 'unhealthy') return 'bg-red-500';
    if (!isConnected || backendHealth === 'checking') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTooltipText = () => {
    if (!isOnline) return 'Offline';
    if (backendHealth === 'unhealthy') return 'Backend unavailable';
    if (!isConnected) return 'Real-time disconnected';
    if (backendHealth === 'checking') return 'Connecting...';
    return 'Connected';
  };

  return (
    <div className="relative group">
      <div className={`w-3 h-3 rounded-full ${getIndicatorColor()} ${backendHealth === 'checking' ? 'animate-pulse' : ''}`} />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {getTooltipText()}
      </div>
    </div>
  );
}
