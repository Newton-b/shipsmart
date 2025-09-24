import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, Truck, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { TrackingTimeline } from './TrackingTimeline';
import { useTrackingSSE } from '../hooks/useTrackingSSE';
import { trackingApi } from '../services/trackingApi';

interface TrackingEvent {
  status: string;
  description?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  timestamp: string;
  estimatedDelivery?: string;
  signedBy?: string;
  externalEventId?: string;
}

interface TrackingResponse {
  trackingNumber: string;
  carrierCode: string;
  carrierName: string;
  currentStatus: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
  actualDelivery?: string;
  origin?: {
    city?: string;
    state?: string;
    country?: string;
  };
  destination?: {
    city?: string;
    state?: string;
    country?: string;
  };
  lastUpdated: string;
  isDelivered: boolean;
}

export const TrackingDashboard: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierCode, setCarrierCode] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCarriers, setAvailableCarriers] = useState<any[]>([]);

  // SSE hook for real-time updates
  const { 
    isConnected, 
    lastMessage, 
    connectionError,
    connect,
    disconnect 
  } = useTrackingSSE(trackingNumber);

  // Load available carriers on component mount
  useEffect(() => {
    const loadCarriers = async () => {
      try {
        const carriers = await trackingApi.getAvailableCarriers();
        setAvailableCarriers(carriers);
      } catch (error) {
        console.error('Failed to load carriers:', error);
      }
    };

    loadCarriers();
  }, []);

  // Handle SSE messages
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      
      if (data.type === 'tracking_update' && data.trackingNumber === trackingNumber) {
        // Refresh tracking data when we receive an update
        handleTrackShipment(false); // Don't show loading spinner for updates
      }
    }
  }, [lastMessage, trackingNumber]);

  const handleTrackShipment = useCallback(async (showLoading = true) => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await trackingApi.trackShipment(trackingNumber, carrierCode || undefined);
      setTrackingData(response);
      
      // Connect to SSE for real-time updates
      if (!isConnected) {
        connect();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to track shipment');
      setTrackingData(null);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [trackingNumber, carrierCode, isConnected, connect]);

  const handleClearTracking = () => {
    setTrackingData(null);
    setTrackingNumber('');
    setCarrierCode('');
    setError(null);
    disconnect();
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EXCEPTION':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />;
      case 'OUT_FOR_DELIVERY':
        return <Truck className="w-4 h-4" />;
      case 'IN_TRANSIT':
        return <Package className="w-4 h-4" />;
      case 'EXCEPTION':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            ShipSmart Tracking Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter tracking number..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={carrierCode}
                onChange={(e) => setCarrierCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Auto-detect carrier</option>
                {availableCarriers.map((carrier) => (
                  <option key={carrier.carrierCode} value={carrier.carrierCode}>
                    {carrier.carrierName}
                  </option>
                ))}
              </select>
            </div>
            <Button 
              onClick={() => handleTrackShipment()}
              disabled={loading || !trackingNumber.trim()}
              className="sm:w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                'Track'
              )}
            </Button>
            {trackingData && (
              <Button 
                variant="outline" 
                onClick={handleClearTracking}
                className="sm:w-24"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Real-time connection status */}
          {trackingData && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-600">
                {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
              </span>
              {connectionError && (
                <span className="text-red-600">({connectionError})</span>
              )}
            </div>
          )}

          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {trackingData && (
        <>
          {/* Tracking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tracking Summary</span>
                <Badge className={getStatusColor(trackingData.currentStatus)}>
                  {getStatusIcon(trackingData.currentStatus)}
                  <span className="ml-1">{trackingData.currentStatus.replace('_', ' ')}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                  <p className="font-mono text-sm">{trackingData.trackingNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Carrier</p>
                  <p className="text-sm">{trackingData.carrierName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                  <p className="text-sm">{new Date(trackingData.lastUpdated).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                  <p className="text-sm">
                    {trackingData.estimatedDelivery ? 
                      new Date(trackingData.estimatedDelivery).toLocaleDateString() : 
                      'Not available'
                    }
                  </p>
                </div>
              </div>

              {/* Origin and Destination */}
              {(trackingData.origin || trackingData.destination) && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trackingData.origin && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Origin
                      </p>
                      <p className="text-sm">
                        {[trackingData.origin.city, trackingData.origin.state, trackingData.origin.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                  {trackingData.destination && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Destination
                      </p>
                      <p className="text-sm">
                        {[trackingData.destination.city, trackingData.destination.state, trackingData.destination.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingTimeline events={trackingData.events} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
