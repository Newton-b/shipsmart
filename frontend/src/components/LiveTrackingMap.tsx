import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Truck, Package, Clock, Route, 
  Play, Pause, RotateCcw, Maximize2, Share2, Download,
  AlertTriangle, CheckCircle, Info, Zap, Phone, MessageCircle
} from 'lucide-react';

interface TrackingLocation {
  lat: number;
  lng: number;
  timestamp: Date;
  address: string;
  city: string;
  state: string;
  country: string;
  status: 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  description: string;
  temperature?: number;
  humidity?: number;
  speed?: number;
  heading?: number;
}

interface LiveTrackingData {
  trackingNumber: string;
  shipmentId: string;
  status: 'active' | 'delivered' | 'delayed' | 'exception';
  currentLocation: TrackingLocation;
  route: TrackingLocation[];
  origin: TrackingLocation;
  destination: TrackingLocation;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  carrier: {
    name: string;
    logo: string;
    phone: string;
    email: string;
  };
  driver: {
    name: string;
    phone: string;
    photo: string;
    rating: number;
  };
  vehicle: {
    type: string;
    plateNumber: string;
    model: string;
  };
  cargo: {
    weight: number;
    dimensions: string;
    value: number;
    description: string;
    specialHandling?: string[];
  };
  analytics: {
    distanceCovered: number;
    distanceRemaining: number;
    averageSpeed: number;
    fuelEfficiency: number;
    co2Emissions: number;
    deliveryProbability: number;
    weatherImpact: 'low' | 'moderate' | 'high';
    trafficConditions: 'light' | 'moderate' | 'heavy';
  };
}

interface LiveTrackingMapProps {
  trackingNumber: string;
  onClose?: () => void;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ 
  trackingNumber, 
  onClose 
}) => {
  const [trackingData, setTrackingData] = useState<LiveTrackingData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<TrackingLocation | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of US
  const [zoom, setZoom] = useState(4);
  const mapRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize tracking data
  useEffect(() => {
    loadTrackingData();
    if (isLive) {
      startLiveUpdates();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [trackingNumber, isLive]);

  const loadTrackingData = async () => {
    // Simulate API call to get tracking data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: LiveTrackingData = {
      trackingNumber,
      shipmentId: `SH-${trackingNumber.slice(-6)}`,
      status: 'active',
      currentLocation: {
        lat: 34.0522,
        lng: -118.2437,
        timestamp: new Date(),
        address: '1234 Warehouse Blvd',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        status: 'in_transit',
        description: 'Package is in transit to Phoenix distribution center',
        temperature: 72,
        humidity: 45,
        speed: 65,
        heading: 45
      },
      route: generateRoutePoints(),
      origin: {
        lat: 34.0522,
        lng: -118.2437,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        address: '5678 Shipping St',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        status: 'picked_up',
        description: 'Package picked up from sender'
      },
      destination: {
        lat: 40.7128,
        lng: -74.0060,
        timestamp: new Date(Date.now() + 18 * 60 * 60 * 1000),
        address: '9876 Delivery Ave',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        status: 'in_transit',
        description: 'Final destination'
      },
      estimatedDelivery: new Date(Date.now() + 18 * 60 * 60 * 1000),
      carrier: {
        name: 'RaphTrack Express',
        logo: '/api/placeholder/40/40',
        phone: '+1-800-RAPHTRACK',
        email: 'support@raphtrack.com'
      },
      driver: {
        name: 'Mike Johnson',
        phone: '+1-555-0123',
        photo: '/api/placeholder/60/60',
        rating: 4.8
      },
      vehicle: {
        type: 'Semi-Truck',
        plateNumber: 'RT-2024-001',
        model: 'Freightliner Cascadia'
      },
      cargo: {
        weight: 2500,
        dimensions: '48" x 40" x 36"',
        value: 15000,
        description: 'Electronics - Fragile',
        specialHandling: ['Fragile', 'Keep Upright', 'Temperature Controlled']
      },
      analytics: {
        distanceCovered: 1200,
        distanceRemaining: 1800,
        averageSpeed: 58,
        fuelEfficiency: 8.2,
        co2Emissions: 145,
        deliveryProbability: 94,
        weatherImpact: 'low',
        trafficConditions: 'moderate'
      }
    };

    setTrackingData(mockData);
    setMapCenter({ lat: mockData.currentLocation.lat, lng: mockData.currentLocation.lng });
    setZoom(8);
  };

  const generateRoutePoints = (): TrackingLocation[] => {
    // Generate realistic route points from LA to NY
    const routePoints: TrackingLocation[] = [];
    const waypoints = [
      { lat: 34.0522, lng: -118.2437, city: 'Los Angeles, CA' },
      { lat: 33.4484, lng: -112.0740, city: 'Phoenix, AZ' },
      { lat: 35.2271, lng: -101.8313, city: 'Amarillo, TX' },
      { lat: 35.4676, lng: -97.5164, city: 'Oklahoma City, OK' },
      { lat: 38.2904, lng: -92.6390, city: 'Columbia, MO' },
      { lat: 39.7391, lng: -84.2057, city: 'Dayton, OH' },
      { lat: 40.7128, lng: -74.0060, city: 'New York, NY' }
    ];

    waypoints.forEach((point, index) => {
      routePoints.push({
        lat: point.lat,
        lng: point.lng,
        timestamp: new Date(Date.now() - (6 - index) * 4 * 60 * 60 * 1000),
        address: `Distribution Center ${index + 1}`,
        city: point.city.split(',')[0],
        state: point.city.split(',')[1]?.trim() || '',
        country: 'USA',
        status: index === 0 ? 'picked_up' : index === waypoints.length - 1 ? 'in_transit' : 'in_transit',
        description: index === 0 ? 'Package picked up' : 
                    index === waypoints.length - 1 ? 'Final destination' : 
                    `Passed through ${point.city}`,
        speed: 55 + Math.random() * 20,
        heading: 45 + Math.random() * 90
      });
    });

    return routePoints;
  };

  const startLiveUpdates = () => {
    intervalRef.current = setInterval(() => {
      if (trackingData) {
        // Simulate live location updates
        const newLat = trackingData.currentLocation.lat + (Math.random() - 0.5) * 0.01;
        const newLng = trackingData.currentLocation.lng + (Math.random() - 0.5) * 0.01;
        
        setTrackingData(prev => prev ? {
          ...prev,
          currentLocation: {
            ...prev.currentLocation,
            lat: newLat,
            lng: newLng,
            timestamp: new Date(),
            speed: 55 + Math.random() * 20,
            heading: prev.currentLocation.heading! + (Math.random() - 0.5) * 10
          },
          analytics: {
            ...prev.analytics,
            distanceCovered: prev.analytics.distanceCovered + Math.random() * 5,
            distanceRemaining: Math.max(0, prev.analytics.distanceRemaining - Math.random() * 5),
            averageSpeed: 55 + Math.random() * 15
          }
        } : null);
      }
    }, 5000); // Update every 5 seconds
  };

  const toggleLiveTracking = () => {
    setIsLive(!isLive);
    if (!isLive) {
      startLiveUpdates();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const centerOnVehicle = () => {
    if (trackingData) {
      setMapCenter({ 
        lat: trackingData.currentLocation.lat, 
        lng: trackingData.currentLocation.lng 
      });
      setZoom(12);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen && mapRef.current) {
      mapRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const shareTracking = async () => {
    const shareData = {
      title: `Track Shipment ${trackingNumber}`,
      text: `Follow your package in real-time`,
      url: `${window.location.origin}/track/${trackingNumber}`
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      alert('Tracking link copied to clipboard!');
    }
  };

  const downloadReport = () => {
    if (!trackingData) return;
    
    const report = {
      trackingNumber: trackingData.trackingNumber,
      status: trackingData.status,
      currentLocation: trackingData.currentLocation,
      analytics: trackingData.analytics,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking-report-${trackingNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const contactDriver = () => {
    if (trackingData?.driver.phone) {
      window.open(`tel:${trackingData.driver.phone}`);
    }
  };

  const messageDriver = () => {
    if (trackingData?.driver.phone) {
      window.open(`sms:${trackingData.driver.phone}?body=Hi, I'm tracking shipment ${trackingNumber}. Can you provide an update?`);
    }
  };

  if (!trackingData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Live Tracking Map</h2>
              <p className="text-blue-100 text-sm">Real-time GPS tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isLive ? 'bg-green-500' : 'bg-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">{isLive ? 'LIVE' : 'PAUSED'}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{trackingData.analytics.deliveryProbability}%</div>
            <div className="text-xs text-blue-100">On-Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(trackingData.analytics.distanceRemaining)}</div>
            <div className="text-xs text-blue-100">Miles Left</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(trackingData.analytics.averageSpeed)}</div>
            <div className="text-xs text-blue-100">MPH Avg</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {Math.round((trackingData.analytics.distanceRemaining / trackingData.analytics.averageSpeed) * 10) / 10}
            </div>
            <div className="text-xs text-blue-100">Hours ETA</div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleLiveTracking}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isLive 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isLive ? 'Pause' : 'Resume'}</span>
            </button>
            
            <button
              onClick={centerOnVehicle}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Center</span>
            </button>

            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={shareTracking}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Share tracking"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={downloadReport}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download report"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="relative h-96 bg-gradient-to-br from-blue-100 to-green-100">
        {/* Simulated Map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full overflow-hidden">
            {/* Route Line */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <path
                d="M 50 350 Q 150 200 250 250 Q 350 300 450 200 Q 550 100 650 150"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10,5"
                className="animate-pulse"
              />
            </svg>

            {/* Origin Marker */}
            <div className="absolute left-12 bottom-20 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                <Package className="w-4 h-4" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                {trackingData.origin.city}
              </div>
            </div>

            {/* Current Location (Moving Vehicle) */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
              <div className="bg-blue-600 text-white p-3 rounded-full shadow-xl border-4 border-white">
                <Truck className="w-6 h-6" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
                <div className="font-semibold">{Math.round(trackingData.currentLocation.speed!)} MPH</div>
                <div className="text-xs opacity-90">Phoenix, AZ</div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
              </div>
            </div>

            {/* Destination Marker */}
            <div className="absolute right-12 top-20 transform translate-x-1/2 -translate-y-1/2">
              <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                {trackingData.destination.city}
              </div>
            </div>

            {/* Weather Overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-2 text-sm">
                <div className="text-2xl">☀️</div>
                <div>
                  <div className="font-semibold">72°F</div>
                  <div className="text-gray-600">Clear</div>
                </div>
              </div>
            </div>

            {/* Traffic Conditions */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${
                  trackingData.analytics.trafficConditions === 'light' ? 'bg-green-500' :
                  trackingData.analytics.trafficConditions === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <div className="font-semibold capitalize">{trackingData.analytics.trafficConditions}</div>
                  <div className="text-gray-600">Traffic</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Fuel Efficiency</span>
                <span className="text-orange-500">⛽</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{trackingData.analytics.fuelEfficiency}</div>
              <div className="text-xs text-gray-500">MPG</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">CO₂ Emissions</span>
                <span className="text-green-500">🌱</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{trackingData.analytics.co2Emissions}</div>
              <div className="text-xs text-gray-500">kg</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Distance Covered</span>
                <span className="text-blue-500">📏</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(trackingData.analytics.distanceCovered)}</div>
              <div className="text-xs text-gray-500">miles</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Weather Impact</span>
                <span className="text-purple-500">🌤️</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 capitalize">{trackingData.analytics.weatherImpact}</div>
              <div className="text-xs text-gray-500">impact</div>
            </div>
          </div>
        </div>
      )}

      {/* Driver & Vehicle Info */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={trackingData.driver.photo} 
              alt={trackingData.driver.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-gray-900">{trackingData.driver.name}</div>
              <div className="text-sm text-gray-600">{trackingData.vehicle.model}</div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-sm text-gray-600">{trackingData.driver.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={contactDriver}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
            
            <button
              onClick={messageDriver}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
