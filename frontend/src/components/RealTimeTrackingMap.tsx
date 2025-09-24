import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Plane, 
  Ship, 
  Clock, 
  Activity, 
  Play, 
  Pause, 
  RefreshCw, 
  Zap, 
  Eye, 
  Bell, 
  Star,
  Maximize2,
  Minimize2,
  Layers,
  Filter
} from 'lucide-react';
import { AnimatedCounter, AnimatedProgressBar, PulsingDots } from './AnimatedElements';
import { useNotifications } from '../hooks/useNotifications';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TrackingMapProps {
  shipmentId?: string;
  className?: string;
}

interface VehicleLocation {
  id: string;
  type: 'truck' | 'plane' | 'ship';
  name: string;
  position: [number, number];
  status: 'moving' | 'stopped' | 'loading' | 'unloading';
  speed: number;
  heading: number;
  driver?: string;
  cargo: string[];
  lastUpdate: Date;
  route?: [number, number][];
  estimatedArrival?: Date;
  nextStop?: string;
}

interface TrackingEvent {
  id: string;
  timestamp: Date;
  location: [number, number];
  status: string;
  description: string;
  vehicleId: string;
}

// Custom vehicle icons
const createVehicleIcon = (type: 'truck' | 'plane' | 'ship', status: string) => {
  const colors = {
    moving: '#10B981', // green
    stopped: '#F59E0B', // yellow
    loading: '#3B82F6', // blue
    unloading: '#EF4444' // red
  };

  const symbols = {
    truck: '🚚',
    plane: '✈️',
    ship: '🚢'
  };

  return L.divIcon({
    html: `
      <div style="
        background-color: ${colors[status as keyof typeof colors]};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-size: 16px;
        position: relative;
      ">
        ${symbols[type]}
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 12px;
          height: 12px;
          background-color: ${colors[status as keyof typeof colors]};
          border-radius: 50%;
          border: 2px solid white;
          ${status === 'moving' ? 'animation: pulse 2s infinite;' : ''}
        "></div>
      </div>
    `,
    className: 'vehicle-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Map update component
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

export const RealTimeTrackingMap: React.FC<TrackingMapProps> = ({ 
  shipmentId, 
  className = "" 
}) => {
  const { createNotification } = useNotifications();
  const [vehicles, setVehicles] = useState<VehicleLocation[]>([]);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.0, -30.0]); // Atlantic Ocean view to show US-Ghana routes
  const [mapZoom, setMapZoom] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock vehicle data with Ghana routes
  const mockVehicles: VehicleLocation[] = [
    {
      id: 'truck-001',
      type: 'truck',
      name: 'Truck Alpha',
      position: [40.7128, -74.0060], // New York
      status: 'moving',
      speed: 65,
      heading: 270,
      driver: 'John Smith',
      cargo: ['Electronics', 'Furniture'],
      lastUpdate: new Date(),
      route: [
        [40.7128, -74.0060],
        [39.9526, -75.1652],
        [39.2904, -76.6122],
        [38.9072, -77.0369]
      ],
      estimatedArrival: new Date(Date.now() + 4 * 60 * 60 * 1000),
      nextStop: 'Washington DC'
    },
    {
      id: 'plane-ghana-001',
      type: 'plane',
      name: 'Ghana Express Cargo',
      position: [41.9028, -87.6317], // Chicago (departing)
      status: 'moving',
      speed: 550,
      heading: 90,
      driver: 'Captain Kwame Asante',
      cargo: ['Medical Equipment', 'Agricultural Machinery', 'Electronics'],
      lastUpdate: new Date(),
      route: [
        [41.9028, -87.6317], // Chicago
        [40.6413, -73.7781], // JFK New York
        [51.4700, -0.4543],   // London Heathrow
        [5.6037, -0.1870]     // Accra, Ghana
      ],
      estimatedArrival: new Date(Date.now() + 18 * 60 * 60 * 1000),
      nextStop: 'Kotoka International Airport, Accra'
    },
    {
      id: 'ship-ghana-001',
      type: 'ship',
      name: 'Atlantic Pioneer',
      position: [32.0835, -81.0998], // Savannah, GA (departing)
      status: 'moving',
      speed: 22,
      heading: 110,
      cargo: ['Containers', 'Vehicles', 'Cocoa Processing Equipment'],
      lastUpdate: new Date(),
      route: [
        [32.0835, -81.0998], // Savannah, GA
        [28.2916, -80.6076], // Cape Canaveral
        [25.7617, -80.1918], // Miami
        [18.4655, -69.9312], // Dominican Republic
        [12.1696, -61.2424], // Grenada
        [10.6918, -61.2225], // Trinidad
        [6.8013, -58.1551],  // Guyana
        [5.5557, -0.2059]    // Tema Port, Ghana
      ],
      estimatedArrival: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      nextStop: 'Tema Port, Ghana'
    },
    {
      id: 'truck-ghana-001',
      type: 'truck',
      name: 'Accra Distribution',
      position: [5.6037, -0.1870], // Accra, Ghana
      status: 'loading',
      speed: 0,
      heading: 0,
      driver: 'Kofi Mensah',
      cargo: ['Local Distribution', 'Consumer Goods'],
      lastUpdate: new Date(),
      route: [
        [5.6037, -0.1870],  // Accra
        [6.6885, -1.6244],  // Kumasi
        [9.4034, -0.8424],  // Tamale
        [10.7969, -0.8372]  // Bolgatanga
      ],
      estimatedArrival: new Date(Date.now() + 8 * 60 * 60 * 1000),
      nextStop: 'Kumasi Distribution Center'
    },
    {
      id: 'plane-001',
      type: 'plane',
      name: 'Air Cargo 747',
      position: [34.0522, -118.2437], // Los Angeles
      status: 'loading',
      speed: 0,
      heading: 90,
      cargo: ['Medical Supplies', 'Documents'],
      lastUpdate: new Date(),
      estimatedArrival: new Date(Date.now() + 5 * 60 * 60 * 1000),
      nextStop: 'Chicago'
    },
    {
      id: 'ship-return-001',
      type: 'ship',
      name: 'Gold Coast Express',
      position: [5.5557, -0.2059], // Tema Port, Ghana (returning)
      status: 'moving',
      speed: 20,
      heading: 290,
      cargo: ['Cocoa', 'Gold', 'Textiles', 'Shea Butter'],
      lastUpdate: new Date(),
      route: [
        [5.5557, -0.2059],   // Tema Port, Ghana
        [6.8013, -58.1551],  // Guyana
        [10.6918, -61.2225], // Trinidad
        [18.4655, -69.9312], // Dominican Republic
        [25.7617, -80.1918], // Miami
        [29.7604, -95.3698]  // Houston, TX
      ],
      estimatedArrival: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days
      nextStop: 'Port of Houston, Texas'
    }
  ];

  // Initialize vehicles
  useEffect(() => {
    setVehicles(mockVehicles);
  }, []);

  // Enhanced real-time updates simulation with better movement
  useEffect(() => {
    if (isLiveMode) {
      intervalRef.current = setInterval(() => {
        setVehicles(prevVehicles => 
          prevVehicles.map(vehicle => {
            // Simulate movement for moving vehicles
            if (vehicle.status === 'moving' && vehicle.route && vehicle.route.length > 1) {
              // Find closest route point to current position
              let closestIndex = 0;
              let minDistance = Infinity;
              
              vehicle.route.forEach((point, index) => {
                const distance = Math.sqrt(
                  Math.pow(point[0] - vehicle.position[0], 2) + 
                  Math.pow(point[1] - vehicle.position[1], 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  closestIndex = index;
                }
              });
              
              // Move towards next point if not at the end
              if (closestIndex < vehicle.route.length - 1) {
                const nextPoint = vehicle.route[closestIndex + 1];
                
                // Calculate movement speed based on vehicle type
                let moveSpeed = 0.002; // Base speed
                if (vehicle.type === 'plane') moveSpeed = 0.01; // Planes move faster
                if (vehicle.type === 'ship') moveSpeed = 0.001; // Ships move slower
                if (vehicle.type === 'truck') moveSpeed = 0.003; // Trucks moderate speed
                
                // Add some randomness to movement
                moveSpeed *= (0.8 + Math.random() * 0.4);
                
                const latDiff = nextPoint[0] - vehicle.position[0];
                const lngDiff = nextPoint[1] - vehicle.position[1];
                const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
                
                if (distance > moveSpeed) {
                  const newLat = vehicle.position[0] + (latDiff / distance) * moveSpeed;
                  const newLng = vehicle.position[1] + (lngDiff / distance) * moveSpeed;
                  
                  // Update next stop based on progress
                  let nextStop = vehicle.nextStop;
                  if (vehicle.id === 'plane-ghana-001') {
                    if (closestIndex === 0) nextStop = 'JFK New York';
                    else if (closestIndex === 1) nextStop = 'London Heathrow';
                    else if (closestIndex === 2) nextStop = 'Kotoka International Airport, Accra';
                  } else if (vehicle.id === 'ship-ghana-001') {
                    const stops = ['Cape Canaveral', 'Miami', 'Dominican Republic', 'Grenada', 'Trinidad', 'Guyana', 'Tema Port, Ghana'];
                    nextStop = stops[Math.min(closestIndex, stops.length - 1)];
                  } else if (vehicle.id === 'truck-ghana-001') {
                    const stops = ['Kumasi Distribution Center', 'Tamale Hub', 'Bolgatanga Terminal'];
                    nextStop = stops[Math.min(closestIndex, stops.length - 1)];
                  } else if (vehicle.id === 'ship-return-001') {
                    const stops = ['Guyana', 'Trinidad', 'Dominican Republic', 'Miami', 'Port of Houston, Texas'];
                    nextStop = stops[Math.min(closestIndex, stops.length - 1)];
                  }
                  
                  return {
                    ...vehicle,
                    position: [newLat, newLng],
                    lastUpdate: new Date(),
                    nextStop
                  };
                } else {
                  // Reached the waypoint, move to next one
                  return {
                    ...vehicle,
                    position: nextPoint,
                    lastUpdate: new Date()
                  };
                }
              }
            }
            
            // Random status changes (less frequent for international routes)
            const statusChangeChance = vehicle.id.includes('ghana') ? 0.02 : 0.05;
            if (Math.random() < statusChangeChance) {
              const statuses: VehicleLocation['status'][] = ['moving', 'stopped', 'loading', 'unloading'];
              const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
              
              if (newStatus !== vehicle.status) {
                // Create more specific notifications for Ghana routes
                let message = `${vehicle.name} is now ${newStatus}`;
                if (vehicle.id.includes('ghana')) {
                  if (newStatus === 'stopped') message = `${vehicle.name} has stopped for customs inspection`;
                  if (newStatus === 'loading') message = `${vehicle.name} is loading cargo for Ghana route`;
                  if (newStatus === 'unloading') message = `${vehicle.name} is unloading at destination`;
                }
                
                createNotification({
                  title: 'International Shipment Update',
                  message,
                  type: 'shipment_update'
                });
                
                return { ...vehicle, status: newStatus, lastUpdate: new Date() };
              }
            }
            
            return vehicle;
          })
        );
        
        setLastUpdate(new Date());
      }, 2000); // Update every 2 seconds for smoother movement
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLiveMode, createNotification]);

  const filteredVehicles = vehicles.filter(vehicle => 
    filterStatus === 'all' || vehicle.status === filterStatus
  );

  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setMapCenter(vehicle.position);
      setMapZoom(10);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'text-green-600 bg-green-100';
      case 'stopped': return 'text-yellow-600 bg-yellow-100';
      case 'loading': return 'text-blue-600 bg-blue-100';
      case 'unloading': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const containerClasses = `
    ${className} 
    ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'relative'}
    rounded-lg overflow-hidden shadow-lg
  `;

  return (
    <div className={containerClasses}>
      {/* Mobile-First Header Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Title and Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Live Tracking
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className={`w-4 h-4 ${isLiveMode ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredVehicles.length} vehicles
              </span>
            </div>
          </div>

          {/* Mobile-Responsive Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Mode Toggle */}
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              {isLiveMode ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span className="hidden sm:inline">{isLiveMode ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="moving">Moving</option>
              <option value="stopped">Stopped</option>
              <option value="loading">Loading</option>
              <option value="unloading">Unloading</option>
            </select>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Last Update Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          {isLiveMode && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
      </div>

      {/* Map Container - Mobile Responsive */}
      <div className="relative">
        <div className={`${isFullscreen ? 'h-screen' : 'h-64 sm:h-80 lg:h-96'}`}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapUpdater center={mapCenter} zoom={mapZoom} />
            
            {/* Vehicle Markers */}
            {filteredVehicles.map((vehicle) => (
              <Marker
                key={vehicle.id}
                position={vehicle.position}
                icon={createVehicleIcon(vehicle.type, vehicle.status)}
                eventHandlers={{
                  click: () => handleVehicleClick(vehicle.id)
                }}
              >
                <Popup className="vehicle-popup">
                  <div className="p-2 min-w-48">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span className="font-medium">{vehicle.speed} mph</span>
                      </div>
                      {vehicle.driver && (
                        <div className="flex justify-between">
                          <span>Driver:</span>
                          <span className="font-medium">{vehicle.driver}</span>
                        </div>
                      )}
                      {vehicle.nextStop && (
                        <div className="flex justify-between">
                          <span>Next Stop:</span>
                          <span className="font-medium">{vehicle.nextStop}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Cargo:</span>
                        <span className="font-medium">{vehicle.cargo.length} items</span>
                      </div>
                    </div>
                    
                    {vehicle.estimatedArrival && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          ETA: {vehicle.estimatedArrival.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {/* Route Lines */}
            {filteredVehicles.map((vehicle) => (
              vehicle.route && vehicle.route.length > 1 && (
                <Polyline
                  key={`route-${vehicle.id}`}
                  positions={vehicle.route}
                  color={vehicle.status === 'moving' ? '#10B981' : '#6B7280'}
                  weight={3}
                  opacity={0.7}
                  dashArray={vehicle.status === 'moving' ? undefined : '10, 10'}
                />
              )
            ))}
          </MapContainer>
        </div>

        {/* Mobile-Optimized Vehicle List Overlay */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs w-full sm:w-auto">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
            Active Vehicles
          </h4>
          <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => handleVehicleClick(vehicle.id)}
                className={`p-2 rounded-md cursor-pointer transition-colors text-sm ${
                  selectedVehicle === vehicle.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {vehicle.type === 'truck' && <Truck className="w-4 h-4 text-gray-600" />}
                    {vehicle.type === 'plane' && <Plane className="w-4 h-4 text-gray-600" />}
                    {vehicle.type === 'ship' && <Ship className="w-4 h-4 text-gray-600" />}
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {vehicle.name}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
                
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>{vehicle.speed} mph</span>
                    <span>{vehicle.cargo.length} items</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-Responsive Stats Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-green-600">
              <AnimatedCounter value={filteredVehicles.filter(v => v.status === 'moving').length} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Moving</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-yellow-600">
              <AnimatedCounter value={filteredVehicles.filter(v => v.status === 'stopped').length} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Stopped</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-blue-600">
              <AnimatedCounter value={filteredVehicles.filter(v => v.status === 'loading').length} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Loading</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-red-600">
              <AnimatedCounter value={filteredVehicles.filter(v => v.status === 'unloading').length} />
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Unloading</div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .vehicle-marker {
          z-index: 1000;
        }
        
        .vehicle-popup .leaflet-popup-content {
          margin: 8px 12px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};
