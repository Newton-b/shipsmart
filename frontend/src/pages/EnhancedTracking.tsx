import React, { useState, useEffect } from 'react';
import { 
  Search, Package, MapPin, Clock, Truck, Phone, Mail,
  AlertTriangle, CheckCircle, Info, Star, Share2, Download,
  Navigation, Route, Thermometer, Droplets, Wind, Eye,
  Calendar, DollarSign, Shield, Zap, BarChart3
} from 'lucide-react';
import { LiveTrackingMap } from '../components/LiveTrackingMap';
import { MobileButton, MobileInput, MobileCard, MobileAlert } from '../components/MobileUILibrary';

interface TrackingResult {
  trackingNumber: string;
  shipmentId: string;
  status: 'in_transit' | 'delivered' | 'delayed' | 'exception' | 'pending';
  statusDescription: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  origin: {
    address: string;
    city: string;
    state: string;
    country: string;
    timestamp: Date;
  };
  destination: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  currentLocation: {
    address: string;
    city: string;
    state: string;
    country: string;
    timestamp: Date;
    coordinates: { lat: number; lng: number };
  };
  carrier: {
    name: string;
    logo: string;
    trackingUrl: string;
    phone: string;
    email: string;
  };
  events: TrackingEvent[];
  shipmentDetails: {
    weight: number;
    dimensions: string;
    value: number;
    description: string;
    serviceType: string;
    specialInstructions?: string;
  };
  environmental: {
    temperature: number;
    humidity: number;
    conditions: string;
  };
  performance: {
    onTimePercentage: number;
    averageTransitTime: number;
    customerRating: number;
  };
}

interface TrackingEvent {
  id: string;
  timestamp: Date;
  status: string;
  location: string;
  description: string;
  details?: string;
  signature?: string;
  photo?: string;
  temperature?: number;
  humidity?: number;
}

export const EnhancedTracking: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TrackingEvent | null>(null);

  // Auto-populate with sample tracking number for demo
  useEffect(() => {
    setTrackingNumber('SS123456789');
  }, []);

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: TrackingResult = {
        trackingNumber,
        shipmentId: `SH-${trackingNumber.slice(-6)}`,
        status: 'in_transit',
        statusDescription: 'Your package is on its way to Phoenix distribution center',
        estimatedDelivery: new Date(Date.now() + 18 * 60 * 60 * 1000),
        origin: {
          address: '5678 Shipping Street',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        destination: {
          address: '9876 Delivery Avenue',
          city: 'New York',
          state: 'NY',
          country: 'USA'
        },
        currentLocation: {
          address: '1234 Highway 10',
          city: 'Phoenix',
          state: 'AZ',
          country: 'USA',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          coordinates: { lat: 33.4484, lng: -112.0740 }
        },
        carrier: {
          name: 'RaphTrack Express',
          logo: '/api/placeholder/60/30',
          trackingUrl: `https://track.raphtrack.com/${trackingNumber}`,
          phone: '+1-800-RAPHTRACK',
          email: 'support@raphtrack.com'
        },
        events: [
          {
            id: '1',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'Package Picked Up',
            location: 'Los Angeles, CA',
            description: 'Package has been picked up from the sender',
            details: 'Picked up by driver Mike Johnson at 9:15 AM',
            temperature: 72,
            humidity: 45
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            status: 'In Transit',
            location: 'Barstow, CA',
            description: 'Package is in transit to next facility',
            details: 'Passed through Barstow distribution center',
            temperature: 75,
            humidity: 40
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'Arrived at Facility',
            location: 'Phoenix, AZ',
            description: 'Package arrived at Phoenix distribution center',
            details: 'Currently being processed for next delivery route',
            temperature: 78,
            humidity: 35
          },
          {
            id: '4',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            status: 'Out for Delivery',
            location: 'Phoenix, AZ',
            description: 'Package is out for delivery to next destination',
            details: 'Loaded onto truck RT-2024-001 for transport to Albuquerque',
            temperature: 76,
            humidity: 38
          }
        ],
        shipmentDetails: {
          weight: 25.5,
          dimensions: '24" x 18" x 12"',
          value: 1250,
          description: 'Electronics - Laptop Computer',
          serviceType: 'Express Delivery',
          specialInstructions: 'Fragile - Handle with care, Signature required'
        },
        environmental: {
          temperature: 76,
          humidity: 38,
          conditions: 'Clear, Dry'
        },
        performance: {
          onTimePercentage: 94,
          averageTransitTime: 2.3,
          customerRating: 4.7
        }
      };

      setTrackingResult(mockResult);
    } catch (err) {
      setError('Failed to track package. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'in_transit': case 'out for delivery': return 'text-blue-600 bg-blue-50';
      case 'delayed': case 'exception': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return CheckCircle;
      case 'in_transit': case 'out for delivery': return Truck;
      case 'delayed': case 'exception': return AlertTriangle;
      case 'pending': return Clock;
      default: return Info;
    }
  };

  const shareTracking = async () => {
    if (!trackingResult) return;
    
    const shareData = {
      title: `Track Package ${trackingResult.trackingNumber}`,
      text: `Follow your package: ${trackingResult.statusDescription}`,
      url: `${window.location.origin}/track/${trackingResult.trackingNumber}`
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert('Tracking link copied to clipboard!');
    }
  };

  const downloadReport = () => {
    if (!trackingResult) return;
    
    const report = {
      ...trackingResult,
      generatedAt: new Date().toISOString(),
      reportType: 'Detailed Tracking Report'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking-report-${trackingResult.trackingNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Track Your Shipment</h1>
            <p className="text-blue-100">Real-time tracking with live GPS updates</p>
          </div>

          {/* Search Form */}
          <div className="max-w-md mx-auto">
            <div className="flex space-x-3">
              <div className="flex-1">
                <MobileInput
                  placeholder="Enter tracking number (e.g., SS123456789)"
                  value={trackingNumber}
                  onChange={setTrackingNumber}
                  className="bg-white"
                />
              </div>
              <MobileButton
                onClick={handleTrack}
                loading={isLoading}
                icon={Search}
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Track
              </MobileButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <MobileAlert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <MobileCard className="mb-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Tracking your package...</p>
                <p className="text-gray-500 text-sm mt-1">Getting real-time updates</p>
              </div>
            </div>
          </MobileCard>
        )}

        {/* Tracking Results */}
        {trackingResult && (
          <div className="space-y-6">
            {/* Status Overview */}
            <MobileCard>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(trackingResult.status)}`}>
                      {React.createElement(getStatusIcon(trackingResult.status), { className: 'w-5 h-5' })}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 capitalize">
                        {trackingResult.status.replace('_', ' ')}
                      </h2>
                      <p className="text-gray-600">{trackingResult.statusDescription}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tracking #:</span>
                      <div className="font-mono font-semibold">{trackingResult.trackingNumber}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Shipment ID:</span>
                      <div className="font-semibold">{trackingResult.shipmentId}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Delivery:</span>
                      <div className="font-semibold text-blue-600">
                        {formatDateTime(trackingResult.estimatedDelivery)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Service:</span>
                      <div className="font-semibold">{trackingResult.shipmentDetails.serviceType}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <MobileButton
                    onClick={shareTracking}
                    variant="outline"
                    size="sm"
                    icon={Share2}
                  >
                    Share
                  </MobileButton>
                  <MobileButton
                    onClick={downloadReport}
                    variant="outline"
                    size="sm"
                    icon={Download}
                  >
                    Report
                  </MobileButton>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <MobileButton
                  onClick={() => setShowMap(true)}
                  variant="primary"
                  icon={MapPin}
                  fullWidth
                >
                  Live Map
                </MobileButton>
                <MobileButton
                  onClick={() => window.open(`tel:${trackingResult.carrier.phone}`)}
                  variant="secondary"
                  icon={Phone}
                  fullWidth
                >
                  Call Carrier
                </MobileButton>
              </div>
            </MobileCard>

            {/* Live Tracking Map */}
            {showMap && (
              <div className="mb-6">
                <LiveTrackingMap 
                  trackingNumber={trackingResult.trackingNumber}
                  onClose={() => setShowMap(false)}
                />
              </div>
            )}

            {/* Current Location & Environmental Data */}
            <MobileCard title="Current Status" className="mb-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {trackingResult.currentLocation.address}
                    </div>
                    <div className="text-gray-600">
                      {trackingResult.currentLocation.city}, {trackingResult.currentLocation.state}
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {formatDateTime(trackingResult.currentLocation.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Environmental Conditions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Environmental Conditions</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <Thermometer className="w-5 h-5 text-red-500 mb-1" />
                      <div className="text-lg font-bold">{trackingResult.environmental.temperature}°F</div>
                      <div className="text-xs text-gray-600">Temperature</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Droplets className="w-5 h-5 text-blue-500 mb-1" />
                      <div className="text-lg font-bold">{trackingResult.environmental.humidity}%</div>
                      <div className="text-xs text-gray-600">Humidity</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Wind className="w-5 h-5 text-green-500 mb-1" />
                      <div className="text-lg font-bold">{trackingResult.environmental.conditions}</div>
                      <div className="text-xs text-gray-600">Conditions</div>
                    </div>
                  </div>
                </div>
              </div>
            </MobileCard>

            {/* Shipment Details */}
            <MobileCard title="Shipment Details">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Weight:</span>
                  <div className="font-semibold">{trackingResult.shipmentDetails.weight} lbs</div>
                </div>
                <div>
                  <span className="text-gray-500">Dimensions:</span>
                  <div className="font-semibold">{trackingResult.shipmentDetails.dimensions}</div>
                </div>
                <div>
                  <span className="text-gray-500">Value:</span>
                  <div className="font-semibold">{formatCurrency(trackingResult.shipmentDetails.value)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Description:</span>
                  <div className="font-semibold">{trackingResult.shipmentDetails.description}</div>
                </div>
              </div>
              
              {trackingResult.shipmentDetails.specialInstructions && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800">Special Instructions</div>
                      <div className="text-sm text-yellow-700">
                        {trackingResult.shipmentDetails.specialInstructions}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </MobileCard>

            {/* Performance Metrics */}
            <MobileCard title="Performance Metrics">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {trackingResult.performance.onTimePercentage}%
                  </div>
                  <div className="text-xs text-gray-600">On-Time Delivery</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {trackingResult.performance.averageTransitTime}
                  </div>
                  <div className="text-xs text-gray-600">Avg Transit (days)</div>
                </div>
                <div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold text-yellow-600">
                      {trackingResult.performance.customerRating}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">Customer Rating</div>
                </div>
              </div>
            </MobileCard>

            {/* Tracking Events */}
            <MobileCard title="Tracking History">
              <div className="space-y-4">
                {trackingResult.events.map((event, index) => (
                  <div 
                    key={event.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-600' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{event.status}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-1">{event.description}</p>
                      <p className="text-gray-500 text-xs">{event.location}</p>
                      
                      {(event.temperature || event.humidity) && (
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {event.temperature && (
                            <span className="flex items-center space-x-1">
                              <Thermometer className="w-3 h-3" />
                              <span>{event.temperature}°F</span>
                            </span>
                          )}
                          {event.humidity && (
                            <span className="flex items-center space-x-1">
                              <Droplets className="w-3 h-3" />
                              <span>{event.humidity}%</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </MobileCard>

            {/* Carrier Information */}
            <MobileCard title="Carrier Information">
              <div className="flex items-center space-x-4">
                <img 
                  src={trackingResult.carrier.logo} 
                  alt={trackingResult.carrier.name}
                  className="w-12 h-12 object-contain"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{trackingResult.carrier.name}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${trackingResult.carrier.phone}`} className="text-blue-600 hover:underline">
                        {trackingResult.carrier.phone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${trackingResult.carrier.email}`} className="text-blue-600 hover:underline">
                        {trackingResult.carrier.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </MobileCard>
          </div>
        )}

        {/* Sample Tracking Numbers */}
        {!trackingResult && !isLoading && (
          <MobileCard title="Try These Sample Tracking Numbers">
            <div className="space-y-3">
              {[
                { number: 'SS123456789', status: 'In Transit', description: 'Electronics shipment from LA to NY' },
                { number: 'RT987654321', status: 'Delivered', description: 'Furniture delivery completed' },
                { number: 'EX555666777', status: 'Out for Delivery', description: 'Medical supplies for urgent delivery' }
              ].map((sample) => (
                <button
                  key={sample.number}
                  onClick={() => setTrackingNumber(sample.number)}
                  className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="font-mono font-semibold text-blue-600">{sample.number}</div>
                  <div className="text-sm text-gray-600">{sample.description}</div>
                  <div className="text-xs text-gray-500 mt-1">Status: {sample.status}</div>
                </button>
              ))}
            </div>
          </MobileCard>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedEvent.status}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Time:</span>
                  <div className="font-semibold">{formatDateTime(selectedEvent.timestamp)}</div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Location:</span>
                  <div className="font-semibold">{selectedEvent.location}</div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <div>{selectedEvent.description}</div>
                </div>
                
                {selectedEvent.details && (
                  <div>
                    <span className="text-sm text-gray-500">Details:</span>
                    <div className="text-sm text-gray-700">{selectedEvent.details}</div>
                  </div>
                )}
                
                {(selectedEvent.temperature || selectedEvent.humidity) && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-sm text-gray-500 block mb-2">Environmental Data:</span>
                    <div className="flex space-x-4">
                      {selectedEvent.temperature && (
                        <div className="flex items-center space-x-1">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-sm">{selectedEvent.temperature}°F</span>
                        </div>
                      )}
                      {selectedEvent.humidity && (
                        <div className="flex items-center space-x-1">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{selectedEvent.humidity}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
