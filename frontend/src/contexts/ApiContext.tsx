import React, { createContext, useContext, useEffect, useState } from 'react';
import { webSocketService, HealthService } from '../services/api';

interface ApiContextType {
  isOnline: boolean;
  isConnected: boolean;
  backendHealth: 'healthy' | 'unhealthy' | 'checking';
  reconnect: () => void;
  lastError: string | null;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(false);
  const [backendHealth, setBackendHealth] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');
  const [lastError, setLastError] = useState<string | null>(null);

  // Check backend health
  const checkBackendHealth = async () => {
    try {
      setBackendHealth('checking');
      await HealthService.checkHealth();
      setBackendHealth('healthy');
      setLastError(null);
    } catch (error: any) {
      setBackendHealth('unhealthy');
      setLastError(error.message);
    }
  };

  // Initialize WebSocket connection
  const initializeWebSocket = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      webSocketService.connect(token);
    }
  };

  // Reconnect function
  const reconnect = () => {
    checkBackendHealth();
    initializeWebSocket();
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      reconnect();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor WebSocket connection
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setLastError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      setLastError(error.message || 'WebSocket connection error');
    };

    webSocketService.on('connect', handleConnect);
    webSocketService.on('disconnect', handleDisconnect);
    webSocketService.on('error', handleError);

    return () => {
      webSocketService.off('connect', handleConnect);
      webSocketService.off('disconnect', handleDisconnect);
      webSocketService.off('error', handleError);
    };
  }, []);

  // Initial health check and WebSocket connection
  useEffect(() => {
    checkBackendHealth();
    initializeWebSocket();

    // Periodic health checks
    const healthCheckInterval = setInterval(checkBackendHealth, 30000); // Every 30 seconds

    return () => {
      clearInterval(healthCheckInterval);
    };
  }, []);

  const value: ApiContextType = {
    isOnline,
    isConnected,
    backendHealth,
    reconnect,
    lastError,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
}
