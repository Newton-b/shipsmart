import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Zap,
  AlertTriangle,
  Navigation,
  MapPin,
  Clock,
  TrendingUp,
  Shield,
  RefreshCw,
  Thermometer,
  Eye,
  Waves
} from 'lucide-react';

interface WeatherAlert {
  id: string;
  type: 'storm' | 'fog' | 'high-winds' | 'ice' | 'heat' | 'flooding';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  coordinates: { lat: number; lng: number };
  description: string;
  impact: string;
  startTime: Date;
  endTime: Date;
  affectedRoutes: string[];
  recommendedAction: string;
  isActive: boolean;
}

interface RouteOptimization {
  routeId: string;
  originalRoute: string;
  optimizedRoute: string;
  timeSaved: number;
  costSaved: number;
  fuelSaved: number;
  reason: string;
  confidence: number;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  visibility: number;
  humidity: number;
  pressure: number;
  icon: string;
}

export const WeatherAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [optimizations, setOptimizations] = useState<RouteOptimization[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock weather alerts
  const mockAlerts: WeatherAlert[] = [
    {
      id: 'alert-1',
      type: 'storm',
      severity: 'high',
      location: 'North Atlantic',
      coordinates: { lat: 45.0, lng: -30.0 },
      description: 'Severe thunderstorm with winds up to 65 mph',
      impact: 'Potential delays of 6-12 hours for ocean freight',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endTime: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
      affectedRoutes: ['NYC-LON', 'NYC-HAM', 'BOS-LIV'],
      recommendedAction: 'Consider delaying departure or rerouting via southern route',
      isActive: true
    },
    {
      id: 'alert-2',
      type: 'fog',
      severity: 'medium',
      location: 'San Francisco Bay',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      description: 'Dense fog reducing visibility to less than 0.5 miles',
      impact: 'Port operations may be suspended for 4-6 hours',
      startTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      affectedRoutes: ['SFO-SHA', 'SFO-YOK', 'LAX-SFO'],
      recommendedAction: 'Monitor port conditions and prepare for potential delays',
      isActive: true
    },
    {
      id: 'alert-3',
      type: 'high-winds',
      severity: 'critical',
      location: 'Suez Canal',
      coordinates: { lat: 30.0444, lng: 32.3486 },
      description: 'Sustained winds of 45+ mph with gusts up to 70 mph',
      impact: 'Canal traffic suspended, major delays expected',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      affectedRoutes: ['MED-RED', 'EUR-ASIA', 'AFR-ASIA'],
      recommendedAction: 'Immediate rerouting via Cape of Good Hope recommended',
      isActive: true
    }
  ];

  // Mock route optimizations
  const mockOptimizations: RouteOptimization[] = [
    {
      routeId: 'OPT-001',
      originalRoute: 'Shanghai → Suez Canal → Rotterdam',
      optimizedRoute: 'Shanghai → Cape of Good Hope → Rotterdam',
      timeSaved: -72, // negative means longer time but safer
      costSaved: -15000,
      fuelSaved: -2500,
      reason: 'Avoiding Suez Canal high winds',
      confidence: 95
    },
    {
      routeId: 'OPT-002',
      originalRoute: 'Los Angeles → Panama Canal → New York',
      optimizedRoute: 'Los Angeles → Long Beach → Rail → New York',
      timeSaved: 48,
      costSaved: 8500,
      fuelSaved: 1200,
      reason: 'Weather-optimized intermodal route',
      confidence: 87
    },
    {
      routeId: 'OPT-003',
      originalRoute: 'Hamburg → North Sea → Felixstowe',
      optimizedRoute: 'Hamburg → Overland → Calais → Dover',
      timeSaved: 24,
      costSaved: 3200,
      fuelSaved: 800,
      reason: 'Avoiding North Sea storm system',
      confidence: 92
    }
  ];

  // Mock weather data for major ports
  const mockWeatherData: WeatherData[] = [
    {
      location: 'New York',
      temperature: 22,
      condition: 'Partly Cloudy',
      windSpeed: 15,
      visibility: 10,
      humidity: 65,
      pressure: 1013,
      icon: 'partly-cloudy'
    },
    {
      location: 'Shanghai',
      temperature: 28,
      condition: 'Clear',
      windSpeed: 8,
      visibility: 15,
      humidity: 72,
      pressure: 1018,
      icon: 'sunny'
    },
    {
      location: 'Rotterdam',
      temperature: 18,
      condition: 'Light Rain',
      windSpeed: 22,
      visibility: 8,
      humidity: 85,
      pressure: 1008,
      icon: 'rainy'
    },
    {
      location: 'Singapore',
      temperature: 32,
      condition: 'Thunderstorms',
      windSpeed: 12,
      visibility: 5,
      humidity: 88,
      pressure: 1005,
      icon: 'stormy'
    }
  ];

  // Initialize data
  useEffect(() => {
    setAlerts(mockAlerts);
    setOptimizations(mockOptimizations);
    setWeatherData(mockWeatherData);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update alert status
      setAlerts(prev => prev.map(alert => ({
        ...alert,
        isActive: alert.endTime > new Date()
      })));

      // Occasionally add new alerts
      if (Math.random() > 0.95) {
        const newAlert: WeatherAlert = {
          id: `alert-${Date.now()}`,
          type: ['fog', 'high-winds', 'storm'][Math.floor(Math.random() * 3)] as any,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          location: ['Pacific Ocean', 'Mediterranean Sea', 'English Channel'][Math.floor(Math.random() * 3)],
          coordinates: { lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 },
          description: 'New weather condition detected',
          impact: 'Monitoring for potential route impacts',
          startTime: new Date(),
          endTime: new Date(Date.now() + Math.random() * 12 * 60 * 60 * 1000),
          affectedRoutes: ['Route-A', 'Route-B'],
          recommendedAction: 'Continue monitoring conditions',
          isActive: true
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      }

      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400';
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'partly-cloudy':
        return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy':
      case 'light rain':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'stormy':
      case 'thunderstorms':
        return <Zap className="w-6 h-6 text-purple-500" />;
      case 'snowy':
        return <CloudSnow className="w-6 h-6 text-blue-300" />;
      default:
        return <Cloud className="w-6 h-6 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'storm': return <Zap className="w-5 h-5" />;
      case 'fog': return <Eye className="w-5 h-5" />;
      case 'high-winds': return <Wind className="w-5 h-5" />;
      case 'ice': return <CloudSnow className="w-5 h-5" />;
      case 'heat': return <Thermometer className="w-5 h-5" />;
      case 'flooding': return <Waves className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Weather & Route Intelligence</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time weather monitoring and route optimization
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Weather Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {weatherData.map((weather, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{weather.location}</h3>
              {getWeatherIcon(weather.condition)}
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{weather.temperature}°C</p>
              <p className="text-gray-600 dark:text-gray-400">{weather.condition}</p>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Wind: {weather.windSpeed} mph</span>
                <span>Visibility: {weather.visibility} mi</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span>Active Weather Alerts</span>
            </h3>
            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
              {alerts.filter(a => a.isActive).length} Active
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.filter(alert => alert.isActive).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedAlert?.id === alert.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {alert.type.replace('-', ' ')} - {alert.location}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Until {alert.endTime.toLocaleTimeString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Navigation className="w-3 h-3" />
                        <span>{alert.affectedRoutes.length} routes affected</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Optimizations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span>Route Optimizations</span>
            </h3>
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
              {optimizations.length} Available
            </span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {optimizations.map((optimization) => (
              <div
                key={optimization.routeId}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {optimization.routeId}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      optimization.confidence >= 90 ? 'bg-green-500' :
                      optimization.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {optimization.confidence}% confidence
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Original:</p>
                    <p className="text-gray-900 dark:text-white">{optimization.originalRoute}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Optimized:</p>
                    <p className="text-green-600 dark:text-green-400">{optimization.optimizedRoute}</p>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={optimization.timeSaved >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      Time: {optimization.timeSaved >= 0 ? '+' : ''}{optimization.timeSaved}h
                    </span>
                    <span className={optimization.costSaved >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      Cost: ${optimization.costSaved >= 0 ? '+' : ''}{optimization.costSaved.toLocaleString()}
                    </span>
                    <span className={optimization.fuelSaved >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      Fuel: {optimization.fuelSaved >= 0 ? '+' : ''}{optimization.fuelSaved}L
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {optimization.reason}
                  </p>
                </div>

                <div className="flex space-x-2 mt-3">
                  <button className="flex-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                    Apply Route
                  </button>
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Alert Details */}
      {selectedAlert && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alert Details - {selectedAlert.location}
            </h3>
            <button
              onClick={() => setSelectedAlert(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Impact Assessment</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAlert.impact}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recommended Action</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAlert.recommendedAction}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>Start: {selectedAlert.startTime.toLocaleString()}</p>
                  <p>End: {selectedAlert.endTime.toLocaleString()}</p>
                  <p>Duration: {Math.round((selectedAlert.endTime.getTime() - selectedAlert.startTime.getTime()) / (1000 * 60 * 60))} hours</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Affected Routes</h4>
              <div className="space-y-2">
                {selectedAlert.affectedRoutes.map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-900 dark:text-white">{route}</span>
                    <span className="text-xs text-red-600 dark:text-red-400">Affected</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
