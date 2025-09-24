import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeDB, DatabaseQuery, DatabaseRecord, DatabaseEvent } from '../services/RealtimeDatabase';

export interface UseRealtimeDatabaseOptions {
  autoConnect?: boolean;
  retryOnError?: boolean;
}

export interface DatabaseHookResult<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastUpdate: Date | null;
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  update: (id: string, data: Partial<T>) => Promise<boolean>;
  refresh: () => void;
}

export function useRealtimeDatabase<T = any>(
  query: DatabaseQuery,
  options: UseRealtimeDatabaseOptions = {}
): DatabaseHookResult<T> {
  const { autoConnect = true, retryOnError = true } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const subscriptionRef = useRef<string | null>(null);
  const queryRef = useRef(query);

  // Update query ref when query changes
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  // Handle real-time updates
  const handleDataUpdate = useCallback((records: DatabaseRecord[]) => {
    setData(prevData => {
      const newData = [...prevData];
      
      records.forEach(record => {
        const existingIndex = newData.findIndex(item => (item as any).id === record.id);
        
        if (existingIndex >= 0) {
          // Update existing record
          newData[existingIndex] = record.data;
        } else {
          // Add new record
          newData.push(record.data);
        }
      });
      
      // Apply query filters and sorting to the updated data
      return applyQueryToData(newData, queryRef.current);
    });
    
    setLastUpdate(new Date());
    setLoading(false);
    setError(null);
  }, []);

  // Apply query filters and sorting to data
  const applyQueryToData = useCallback((data: T[], query: DatabaseQuery): T[] => {
    let result = [...data];

    // Apply filters
    if (query.filters) {
      result = result.filter(item => {
        return Object.entries(query.filters!).every(([key, value]) => {
          return (item as any)[key] === value;
        });
      });
    }

    // Apply sorting
    if (query.orderBy) {
      result.sort((a, b) => {
        const aVal = (a as any)[query.orderBy!.field];
        const bVal = (b as any)[query.orderBy!.field];
        const direction = query.orderBy!.direction === 'desc' ? -1 : 1;
        
        if (aVal < bVal) return -1 * direction;
        if (aVal > bVal) return 1 * direction;
        return 0;
      });
    }

    // Apply pagination
    if (query.offset) {
      result = result.slice(query.offset);
    }
    if (query.limit) {
      result = result.slice(0, query.limit);
    }

    return result;
  }, []);

  // Initialize subscription
  useEffect(() => {
    if (!autoConnect) return;

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    subscriptionRef.current = realtimeDB.subscribe(query, handleDataUpdate);

    // Listen for connection events
    const handleConnect = () => {
      setConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectionFailed = () => {
      setConnected(false);
      setError('Failed to connect to real-time database');
      setLoading(false);
    };

    const handleDataUpdated = (record: DatabaseRecord) => {
      if (record.collection === query.collection) {
        setLastUpdate(new Date());
      }
    };

    realtimeDB.on('connected', handleConnect);
    realtimeDB.on('disconnected', handleDisconnect);
    realtimeDB.on('connection_failed', handleConnectionFailed);
    realtimeDB.on('data_updated', handleDataUpdated);

    // Set initial connection status
    setConnected(realtimeDB.isConnected());

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        realtimeDB.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }

      realtimeDB.off('connected', handleConnect);
      realtimeDB.off('disconnected', handleDisconnect);
      realtimeDB.off('connection_failed', handleConnectionFailed);
      realtimeDB.off('data_updated', handleDataUpdated);
    };
  }, [query.collection, query.filters, query.orderBy, query.limit, query.offset, autoConnect, handleDataUpdate]);

  // Create new record
  const create = useCallback(async (newData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const id = await realtimeDB.create(query.collection, newData);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create record';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [query.collection]);

  // Update existing record
  const update = useCallback(async (id: string, updateData: Partial<T>): Promise<boolean> => {
    try {
      const success = await realtimeDB.update(query.collection, id, updateData);
      if (!success) {
        throw new Error('Record not found');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [query.collection]);

  // Refresh data
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await realtimeDB.query(query);
      setData(results);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return {
    data,
    loading,
    error,
    connected,
    lastUpdate,
    create,
    update,
    refresh
  };
}

// Specialized hooks for common collections
export function useShipments(filters?: { [key: string]: any }) {
  return useRealtimeDatabase({
    collection: 'shipments',
    filters,
    orderBy: { field: 'updatedAt', direction: 'desc' }
  });
}

export function useVehicles(filters?: { [key: string]: any }) {
  return useRealtimeDatabase({
    collection: 'vehicles',
    filters,
    orderBy: { field: 'lastUpdate', direction: 'desc' }
  });
}

export function useAnalytics() {
  return useRealtimeDatabase({
    collection: 'analytics',
    limit: 1
  });
}

export function useNotifications(userId?: string) {
  return useRealtimeDatabase({
    collection: 'notifications',
    filters: userId ? { userId } : undefined,
    orderBy: { field: 'timestamp', direction: 'desc' },
    limit: 50
  });
}

export function useMessages(channel?: string) {
  return useRealtimeDatabase({
    collection: 'messages',
    filters: channel ? { channel } : undefined,
    orderBy: { field: 'timestamp', direction: 'desc' },
    limit: 100
  });
}

// Hook for database connection status
export function useDatabaseConnection() {
  const [connected, setConnected] = useState(realtimeDB.isConnected());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setReconnectAttempts(0);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectionFailed = () => {
      setConnected(false);
      const status = realtimeDB.getConnectionStatus();
      setReconnectAttempts(status.reconnectAttempts);
    };

    realtimeDB.on('connected', handleConnect);
    realtimeDB.on('disconnected', handleDisconnect);
    realtimeDB.on('connection_failed', handleConnectionFailed);

    return () => {
      realtimeDB.off('connected', handleConnect);
      realtimeDB.off('disconnected', handleDisconnect);
      realtimeDB.off('connection_failed', handleConnectionFailed);
    };
  }, []);

  return {
    connected,
    reconnectAttempts,
    disconnect: () => realtimeDB.disconnect()
  };
}

// Hook for listening to specific database events
export function useDatabaseEvents(events: DatabaseEvent[], callback: (record: DatabaseRecord) => void) {
  useEffect(() => {
    const handleDataUpdate = (record: DatabaseRecord) => {
      if (events.includes(record.event)) {
        callback(record);
      }
    };

    realtimeDB.on('data_updated', handleDataUpdate);

    return () => {
      realtimeDB.off('data_updated', handleDataUpdate);
    };
  }, [events, callback]);
}
