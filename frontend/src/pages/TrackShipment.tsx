import React, { useState, useEffect } from 'react';
import { Search, Package, MapPin, ArrowLeft, Truck, Activity, BarChart3, TrendingUp, Clock, Navigation, Zap } from 'lucide-react';

interface TrackShipmentProps {
  onBack: () => void;
}

export const TrackShipment: React.FC<TrackShipmentProps> = ({ onBack }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [liveLocation, setLiveLocation] = useState({ lat: 34.0522, lng: -118.2437 });
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const mockTrackingData = {
    trackingNumber: 'SS123456789',
    status: 'In Transit',
    origin: 'Los Angeles, CA',
    destination: 'New York, NY',
    estimatedDelivery: '2024-01-20',
    carrier: 'FedEx',
    service: 'Express',
    currentLocation: {
      city: 'Phoenix',
      state: 'AZ',
      facility: 'FedEx Distribution Center',
      coordinates: { lat: 33.4484, lng: -112.0740 }
    },
    route: {
      totalDistance: 2445,
      completedDistance: 1200,
      remainingDistance: 1245,
      estimatedTimeRemaining: '18 hours'
    },
    vehicle: {
      type: 'Truck',
      id: 'TRK-4521',
      driver: 'John Smith',
      speed: 65,
      lastUpdate: new Date().toISOString()
    }
  };

  const mockAnalytics = {
    deliveryProbability: 94,
    onTimePerformance: 87,
    averageDelay: 2.3,
    weatherImpact: 'Low',
    trafficConditions: 'Moderate',
    fuelEfficiency: 8.2,
    co2Emissions: 145,
    metrics: [
      { label: 'Distance Covered', value: 1200, unit: 'miles', trend: 'up' },
      { label: 'Average Speed', value: 58, unit: 'mph', trend: 'stable' },
      { label: 'Fuel Used', value: 42, unit: 'gallons', trend: 'down' },
      { label: 'Stops Made', value: 3, unit: 'stops', trend: 'stable' }
    ]
  };

  // Live tracking simulation
  useEffect(() => {
    if (shipmentData && isLiveMode) {
      const interval = setInterval(() => {
        // Simulate vehicle movement
        setLiveLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.01,
          lng: prev.lng + (Math.random() - 0.5) * 0.01
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [shipmentData, isLiveMode]);

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setShipmentData(mockTrackingData);
      setAnalytics(mockAnalytics);
      setLiveLocation(mockTrackingData.currentLocation.coordinates);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Package className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Track Your Shipment - Enhanced
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your tracking number to get real-time updates
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-8">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter tracking number (e.g., SS123456789)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                />
              </div>
              <button
                onClick={handleTrack}
                disabled={isLoading || !trackingNumber.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span>{isLoading ? 'Tracking...' : 'Track'}</span>
              </button>
            </div>
          </div>

          {/* Results Section */}
          {shipmentData && (
            <div className="space-y-6">
              {/* Shipment Overview */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Tracking Number
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {shipmentData.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </h3>
                    <p className="text-lg font-semibold text-green-600">
                      {shipmentData.status}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estimated Delivery
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {shipmentData.estimatedDelivery}
                    </p>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Origin</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{shipmentData.origin}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-gray-900 dark:text-white">Destination</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{shipmentData.destination}</p>
                </div>
              </div>

              {/* Live Map Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Navigation className="h-6 w-6 text-white" />
                      <h3 className="text-lg font-semibold text-white">Live Tracking Map</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                      <span className="text-white text-sm">{isLiveMode ? 'Live' : 'Paused'}</span>
                      <button
                        onClick={() => setIsLiveMode(!isLiveMode)}
                        className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm transition-colors"
                      >
                        {isLiveMode ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Mock Map Display */}
                <div className="relative h-80 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900">
                  {/* Map Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 400 320">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                  
                  {/* Route Line */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path
                      d="M 50 250 Q 150 100 250 150 Q 300 120 350 180"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="8,4"
                      className="animate-pulse"
                    />
                  </svg>
                  
                  {/* Vehicle Position */}
                  <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-5000"
                    style={{ 
                      left: `${((liveLocation.lng + 118.2437) / 6) * 100}%`,
                      top: `${((34.0522 - liveLocation.lat) / 6) * 100}%`
                    }}
                  >
                    <div className="relative">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute"></div>
                      <div className="w-4 h-4 bg-red-600 rounded-full relative flex items-center justify-center">
                        <Truck className="h-2 w-2 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Location Info Popup */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {shipmentData.currentLocation.city}, {shipmentData.currentLocation.state}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {shipmentData.currentLocation.facility}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {shipmentData.vehicle.speed} mph
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {shipmentData.route.estimatedTimeRemaining} remaining
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Dashboard */}
              {analytics && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Analytics</h3>
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">Delivery Probability</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {analytics.deliveryProbability}%
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">On-Time Performance</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {analytics.onTimePerformance}%
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 dark:text-orange-400">Fuel Efficiency</p>
                          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {analytics.fuelEfficiency} MPG
                          </p>
                        </div>
                        <Zap className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400">CO₂ Emissions</p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {analytics.co2Emissions} kg
                          </p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analytics.metrics.map((metric: any, index: number) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{metric.label}</h4>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            metric.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            metric.trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {metric.trend}
                          </span>
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {metric.value}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {metric.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Environmental Impact */}
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Environmental Impact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-600 dark:text-green-400">Weather Impact:</span>
                        <span className="ml-2 font-medium text-green-800 dark:text-green-300">
                          {analytics.weatherImpact}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-600 dark:text-green-400">Traffic Conditions:</span>
                        <span className="ml-2 font-medium text-green-800 dark:text-green-300">
                          {analytics.trafficConditions}
                        </span>
                      </div>
                      <div>
                        <span className="text-green-600 dark:text-green-400">Average Delay:</span>
                        <span className="ml-2 font-medium text-green-800 dark:text-green-300">
                          {analytics.averageDelay} hours
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
