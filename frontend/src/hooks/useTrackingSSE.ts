import { useState, useEffect, useRef, useCallback } from 'react';

interface SSEMessage {
  data: string;
  type?: string;
  id?: string;
}

interface UseTrackingSSEReturn {
  isConnected: boolean;
  lastMessage: SSEMessage | null;
  connectionError: string | null;
  connect: () => void;
  disconnect: () => void;
}

export const useTrackingSSE = (trackingNumber?: string): UseTrackingSSEReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SSEMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const connect = useCallback(() => {
    if (!trackingNumber) {
      console.warn('Cannot connect to SSE without tracking number');
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const sseUrl = `${API_BASE_URL}/tracking/events/${encodeURIComponent(trackingNumber)}`;
      console.log('Connecting to SSE:', sseUrl);
      
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        console.log('SSE message received:', event.data);
        setLastMessage({
          data: event.data,
          type: event.type,
          id: event.lastEventId,
        });
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          setConnectionError('Connection closed');
          
          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          } else {
            setConnectionError('Max reconnection attempts reached');
          }
        } else {
          setConnectionError('Connection error');
        }
      };

      // Handle specific event types
      eventSource.addEventListener('tracking_update', (event) => {
        console.log('Tracking update received:', event.data);
        setLastMessage({
          data: event.data,
          type: 'tracking_update',
          id: event.lastEventId,
        });
      });

      eventSource.addEventListener('status_change', (event) => {
        console.log('Status change received:', event.data);
        setLastMessage({
          data: event.data,
          type: 'status_change',
          id: event.lastEventId,
        });
      });

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      setConnectionError('Failed to establish connection');
      setIsConnected(false);
    }
  }, [trackingNumber, API_BASE_URL]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting from SSE');
    
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close EventSource connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
    setLastMessage(null);
    reconnectAttempts.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Auto-connect when tracking number changes
  useEffect(() => {
    if (trackingNumber && trackingNumber.trim()) {
      connect();
    } else {
      disconnect();
    }
  }, [trackingNumber, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    connectionError,
    connect,
    disconnect,
  };
};
