import React, { useState, useEffect, useRef } from 'react';
import { Package, Truck, Plane, Ship, Clock, DollarSign, Shield, Zap, Star, Award, Bell, Activity, Play, Pause, RefreshCw, Calculator, TrendingUp, Eye } from 'lucide-react';
import { AnimatedCounter, AnimatedProgressBar, PulsingDots, NotificationToast } from './AnimatedElements';

interface ProductSelectorProps {
  onProductSelect: (product: ShippingProduct) => void;
  onPriceUpdate: (price: number) => void;
}

interface ShippingProduct {
  id: string;
  name: string;
  type: 'air' | 'ocean' | 'ground';
  icon: React.ComponentType;
  basePrice: number;
  transitTime: string;
  reliability: number;
  features: string[];
  description: string;
  popular: boolean;
  discount?: number;
}

interface PricingFactors {
  weight: number;
  dimensions: { length: number; width: number; height: number };
  distance: number;
  urgency: 'standard' | 'express' | 'overnight';
  insurance: boolean;
  fragile: boolean;
}

export const InteractiveProductSelector: React.FC<ProductSelectorProps> = ({
  onProductSelect,
  onPriceUpdate
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [pricingFactors, setPricingFactors] = useState<PricingFactors>({
    weight: 10,
    dimensions: { length: 12, width: 8, height: 6 },
    distance: 500,
    urgency: 'standard',
    insurance: false,
    fragile: false
  });
  const [livePricing, setLivePricing] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'same'>('same');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const shippingProducts: ShippingProduct[] = [
    {
      id: 'air_express',
      name: 'Air Express',
      type: 'air',
      icon: Plane,
      basePrice: 45.99,
      transitTime: '1-2 days',
      reliability: 98,
      features: ['Real-time tracking', 'Insurance included', 'Priority handling', '24/7 support'],
      description: 'Fastest delivery option with premium service',
      popular: true,
      discount: 15
    },
    {
      id: 'ground_standard',
      name: 'Ground Standard',
      type: 'ground',
      icon: Truck,
      basePrice: 12.99,
      transitTime: '3-5 days',
      reliability: 95,
      features: ['Standard tracking', 'Reliable delivery', 'Cost-effective'],
      description: 'Reliable and affordable ground transportation',
      popular: false
    },
    {
      id: 'ocean_freight',
      name: 'Ocean Freight',
      type: 'ocean',
      icon: Ship,
      basePrice: 8.99,
      transitTime: '15-30 days',
      reliability: 92,
      features: ['Bulk shipping', 'Eco-friendly', 'Large capacity', 'Port-to-port'],
      description: 'Economical option for large shipments',
      popular: false
    },
    {
      id: 'air_standard',
      name: 'Air Standard',
      type: 'air',
      icon: Plane,
      basePrice: 28.99,
      transitTime: '2-4 days',
      reliability: 96,
      features: ['Fast delivery', 'Standard tracking', 'Reliable service'],
      description: 'Balanced speed and cost for air shipping',
      popular: true
    }
  ];

  const calculatePrice = (product: ShippingProduct, factors: PricingFactors): number => {
    let price = product.basePrice;
    
    // Weight factor
    price += factors.weight * 0.5;
    
    // Dimensions factor (volumetric weight)
    const volumetricWeight = (factors.dimensions.length * factors.dimensions.width * factors.dimensions.height) / 166;
    price += Math.max(volumetricWeight, factors.weight) * 0.3;
    
    // Distance factor
    price += factors.distance * 0.02;
    
    // Urgency multiplier
    switch (factors.urgency) {
      case 'overnight':
        price *= 2.5;
        break;
      case 'express':
        price *= 1.8;
        break;
      default:
        price *= 1.0;
    }
    
    // Insurance
    if (factors.insurance) {
      price += price * 0.02; // 2% insurance fee
    }
    
    // Fragile handling
    if (factors.fragile) {
      price += 15.00; // Fragile handling fee
    }
    
    // Apply discount
    if (product.discount) {
      price *= (1 - product.discount / 100);
    }
    
    return Math.round(price * 100) / 100;
  };

  const updatePricing = () => {
    if (!selectedProduct) return;
    
    const product = shippingProducts.find(p => p.id === selectedProduct);
    if (!product) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const newPrice = calculatePrice(product, pricingFactors);
      const previousPrice = currentPrice;
      
      setCurrentPrice(newPrice);
      setPriceHistory(prev => [...prev.slice(-9), newPrice]);
      
      if (previousPrice > 0) {
        if (newPrice > previousPrice) {
          setPriceChange('up');
        } else if (newPrice < previousPrice) {
          setPriceChange('down');
        } else {
          setPriceChange('same');
        }
      }
      
      setLastUpdate(new Date());
      onPriceUpdate(newPrice);
      setIsCalculating(false);
    }, 500);
  };

  // Real-time price updates
  useEffect(() => {
    if (livePricing && selectedProduct) {
      intervalRef.current = setInterval(() => {
        // Simulate small price fluctuations
        const fluctuation = (Math.random() - 0.5) * 2; // ±$1
        setPricingFactors(prev => ({
          ...prev,
          distance: Math.max(100, prev.distance + fluctuation * 10)
        }));
      }, 10000); // Update every 10 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [livePricing, selectedProduct]);

  // Update pricing when factors change
  useEffect(() => {
    updatePricing();
  }, [selectedProduct, pricingFactors]);

  const handleProductSelect = (product: ShippingProduct) => {
    setSelectedProduct(product.id);
    onProductSelect(product);
  };

  const handleFactorChange = (factor: keyof PricingFactors, value: any) => {
    setPricingFactors(prev => ({ ...prev, [factor]: value }));
  };

  const getPriceChangeIcon = () => {
    switch (priceChange) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-green-500 transform rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Header with Live Pricing Controls */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Select Shipping Service
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Choose the best option for your shipment
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className={`w-5 h-5 ${livePricing ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {livePricing ? 'Live Pricing' : 'Static Pricing'}
            </span>
          </div>
          <button
            onClick={() => setLivePricing(!livePricing)}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {livePricing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm">{livePricing ? 'Pause' : 'Enable'}</span>
          </button>
        </div>
      </div>

      {/* Pricing Factors */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Shipment Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (lbs)
            </label>
            <input
              type="number"
              value={pricingFactors.weight}
              onChange={(e) => handleFactorChange('weight', parseFloat(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0.1"
              step="0.1"
            />
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Distance (miles)
            </label>
            <input
              type="number"
              value={pricingFactors.distance}
              onChange={(e) => handleFactorChange('distance', parseFloat(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Urgency
            </label>
            <select
              value={pricingFactors.urgency}
              onChange={(e) => handleFactorChange('urgency', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="overnight">Overnight</option>
            </select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="flex items-center space-x-6 mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={pricingFactors.insurance}
              onChange={(e) => handleFactorChange('insurance', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Insurance</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={pricingFactors.fragile}
              onChange={(e) => handleFactorChange('fragile', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Fragile Handling</span>
          </label>
        </div>
      </div>

      {/* Product Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {shippingProducts.map((product) => {
          const Icon = product.icon;
          const isSelected = selectedProduct === product.id;
          const price = calculatePrice(product, pricingFactors);
          
          return (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {product.popular && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <Star className="w-3 h-3" />
                  <span>Popular</span>
                </div>
              )}

              {/* Discount Badge */}
              {product.discount && (
                <div className="absolute -top-2 -left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{product.discount}%
                </div>
              )}

              <div className="text-center mb-4">
                <Icon className={`w-12 h-12 mx-auto mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {product.description}
                </p>
              </div>

              {/* Price Display */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isCalculating ? (
                      <PulsingDots />
                    ) : (
                      <AnimatedCounter value={price} prefix="$" />
                    )}
                  </span>
                  {isSelected && getPriceChangeIcon()}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Transit: {product.transitTime}
                </p>
              </div>

              {/* Reliability */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Reliability</span>
                  <span>{product.reliability}%</span>
                </div>
                <AnimatedProgressBar 
                  progress={product.reliability} 
                  color={product.reliability >= 95 ? 'bg-green-500' : 'bg-yellow-500'}
                />
              </div>

              {/* Features */}
              <div className="space-y-2">
                {product.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              {isSelected && (
                <div className="mt-4 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Selected
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Price Summary */}
      {selectedProduct && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Quote
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-2">
                <AnimatedCounter value={currentPrice} prefix="$" />
                {livePricing && <RefreshCw className="w-5 h-5 animate-spin" />}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {livePricing ? 'Live pricing enabled' : 'Static quote'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
