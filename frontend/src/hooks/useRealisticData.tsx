import { useState, useEffect, useCallback } from 'react';

interface ShipmentData {
  id: string;
  status: 'in_transit' | 'delivered' | 'pending' | 'delayed';
  origin: string;
  destination: string;
  type: 'ocean' | 'air' | 'ground';
  progress: number;
  estimatedDelivery: Date;
  value: number;
}

interface MetricData {
  totalShipments: number;
  revenue: number;
  onTimeDelivery: number;
  activeRoutes: number;
  customersServed: number;
  countriesReached: number;
}

export const useRealisticData = () => {
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [metrics, setMetrics] = useState<MetricData>({
    totalShipments: 1247,
    revenue: 2400000,
    onTimeDelivery: 98.5,
    activeRoutes: 156,
    customersServed: 2847,
    countriesReached: 150
  });
  const [isLoading, setIsLoading] = useState(false);

  // Generate realistic shipment data
  const generateShipments = useCallback(() => {
    const origins = ['Shanghai', 'Los Angeles', 'Hamburg', 'Singapore', 'Dubai', 'Rotterdam', 'Hong Kong', 'New York'];
    const destinations = ['London', 'Tokyo', 'Sydney', 'Mumbai', 'São Paulo', 'Lagos', 'Cairo', 'Vancouver'];
    const types: ('ocean' | 'air' | 'ground')[] = ['ocean', 'air', 'ground'];
    const statuses: ('in_transit' | 'delivered' | 'pending' | 'delayed')[] = ['in_transit', 'delivered', 'pending', 'delayed'];

    const newShipments: ShipmentData[] = Array.from({ length: 50 }, (_, index) => ({
      id: `RTS-2024-${String(index + 1).padStart(4, '0')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      origin: origins[Math.floor(Math.random() * origins.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      type: types[Math.floor(Math.random() * types.length)],
      progress: Math.floor(Math.random() * 100),
      estimatedDelivery: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      value: Math.floor(Math.random() * 100000) + 5000
    }));

    return newShipments;
  }, []);

  // Simulate real-time updates
  const simulateRealTimeUpdates = useCallback(() => {
    setShipments(prev => prev.map(shipment => {
      // Randomly update progress for in-transit shipments
      if (shipment.status === 'in_transit' && Math.random() > 0.8) {
        const newProgress = Math.min(shipment.progress + Math.floor(Math.random() * 5), 100);
        return {
          ...shipment,
          progress: newProgress,
          status: newProgress >= 100 ? 'delivered' : 'in_transit'
        };
      }
      return shipment;
    }));

    // Update metrics slightly
    setMetrics(prev => ({
      ...prev,
      totalShipments: prev.totalShipments + (Math.random() > 0.7 ? 1 : 0),
      revenue: prev.revenue + (Math.random() * 10000),
      onTimeDelivery: Math.max(95, Math.min(99.9, prev.onTimeDelivery + (Math.random() - 0.5) * 0.1))
    }));
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newShipments = generateShipments();
    setShipments(newShipments);
    
    // Update metrics with some variation
    setMetrics(prev => ({
      totalShipments: prev.totalShipments + Math.floor(Math.random() * 10),
      revenue: prev.revenue + Math.floor(Math.random() * 50000),
      onTimeDelivery: Math.max(95, Math.min(99.9, prev.onTimeDelivery + (Math.random() - 0.5) * 2)),
      activeRoutes: prev.activeRoutes + Math.floor((Math.random() - 0.5) * 10),
      customersServed: prev.customersServed + Math.floor(Math.random() * 20),
      countriesReached: Math.min(195, prev.countriesReached + (Math.random() > 0.9 ? 1 : 0))
    }));
    
    setIsLoading(false);
  }, [generateShipments]);

  // Initialize data
  useEffect(() => {
    const initialShipments = generateShipments();
    setShipments(initialShipments);
  }, [generateShipments]);

  // Set up real-time updates
  useEffect(() => {
    const interval = setInterval(simulateRealTimeUpdates, 5000);
    return () => clearInterval(interval);
  }, [simulateRealTimeUpdates]);

  // Get shipments by status
  const getShipmentsByStatus = useCallback((status: string) => {
    return shipments.filter(shipment => shipment.status === status);
  }, [shipments]);

  // Get shipments by type
  const getShipmentsByType = useCallback((type: string) => {
    return shipments.filter(shipment => shipment.type === type);
  }, [shipments]);

  // Calculate revenue by type
  const getRevenueByType = useCallback(() => {
    const revenueByType = shipments.reduce((acc, shipment) => {
      acc[shipment.type] = (acc[shipment.type] || 0) + shipment.value;
      return acc;
    }, {} as Record<string, number>);

    return revenueByType;
  }, [shipments]);

  // Get recent activities
  const getRecentActivities = useCallback(() => {
    const activities = [
      'New shipment created from Shanghai to London',
      'Delivery completed for RTS-2024-0123',
      'Customs clearance approved for air freight',
      'Route optimization completed for ground transport',
      'Customer notification sent for delayed shipment',
      'Invoice generated for completed delivery'
    ];

    return activities.slice(0, 5).map((activity, index) => ({
      id: index,
      message: activity,
      timestamp: new Date(Date.now() - index * 2 * 60 * 60 * 1000),
      type: Math.random() > 0.8 ? 'warning' : 'info'
    }));
  }, []);

  return {
    shipments,
    metrics,
    isLoading,
    refreshData,
    getShipmentsByStatus,
    getShipmentsByType,
    getRevenueByType,
    getRecentActivities
  };
};
