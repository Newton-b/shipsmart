import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Package, Truck, Plane, Ship, Clock, ArrowRight, Info, CheckCircle, MapPin, AlertCircle, DollarSign, RefreshCw, TrendingUp, CreditCard, Shield, Zap, Activity, Play, Pause, Bell, Star, Award } from 'lucide-react';
import { AnimatedCounter, AnimatedProgressBar, PulsingDots, NotificationToast } from '../components/AnimatedElements';

interface ShippingCalculatorProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({ onQuoteClick, onContactClick }) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    serviceType: 'all',
    packageType: 'package',
    commodity: '',
    value: '',
    insurance: false,
    urgency: 'standard',
    incoterms: 'EXW'
  });

  const [results, setResults] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [priceChanges, setPriceChanges] = useState<{[key: string]: 'up' | 'down' | 'same'}>({});
  
  // Real-time features
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [livePricing, setLivePricing] = useState(true);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState<'quote' | 'details' | 'payment' | 'confirmation'>('quote');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const serviceTypes = [
    { value: 'all', label: 'All Services', icon: Package },
    { value: 'ocean', label: 'Ocean Freight', icon: Ship },
    { value: 'air', label: 'Air Freight', icon: Plane },
    { value: 'ground', label: 'Ground Transportation', icon: Truck }
  ];

  const packageTypes = [
    { value: 'package', label: 'Package', description: 'Small parcels up to 150 lbs' },
    { value: 'pallet', label: 'Pallet', description: 'Palletized freight up to 2,500 lbs' },
    { value: 'container', label: 'Container', description: '20ft/40ft container loads' },
    { value: 'bulk', label: 'Bulk Cargo', description: 'Loose cargo, liquids, grains' },
    { value: 'hazmat', label: 'Hazardous Materials', description: 'Dangerous goods requiring special handling' },
    { value: 'refrigerated', label: 'Refrigerated', description: 'Temperature-controlled cargo' }
  ];

  const urgencyOptions = [
    { value: 'standard', label: 'Standard', description: 'Regular delivery timeline' },
    { value: 'express', label: 'Express', description: '2-3 days faster, +25% cost' },
    { value: 'urgent', label: 'Urgent', description: 'Next available flight/vessel, +50% cost' },
    { value: 'critical', label: 'Critical', description: 'Dedicated transport, +100% cost' }
  ];

  const incotermsOptions = [
    { value: 'EXW', label: 'EXW - Ex Works', description: 'Buyer arranges all transport' },
    { value: 'FOB', label: 'FOB - Free on Board', description: 'Seller delivers to port' },
    { value: 'CIF', label: 'CIF - Cost, Insurance, Freight', description: 'Seller pays all costs to destination' },
    { value: 'DDP', label: 'DDP - Delivered Duty Paid', description: 'Door-to-door with all duties paid' }
  ];

  // Major ports and cities for autocomplete
  const majorLocations = [
    'Los Angeles, CA', 'Long Beach, CA', 'New York, NY', 'Savannah, GA', 'Seattle, WA',
    'Oakland, CA', 'Norfolk, VA', 'Charleston, SC', 'Houston, TX', 'Tacoma, WA',
    'Shanghai, China', 'Shenzhen, China', 'Singapore', 'Rotterdam, Netherlands',
    'Hamburg, Germany', 'Antwerp, Belgium', 'Dubai, UAE', 'Hong Kong',
    'Tokyo, Japan', 'Busan, South Korea', 'Mumbai, India', 'Felixstowe, UK'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Handle location autocomplete
    if (field === 'origin' && value.length > 2) {
      const suggestions = majorLocations.filter(location => 
        location.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setOriginSuggestions(suggestions);
      setShowOriginSuggestions(true);
    } else if (field === 'origin') {
      setShowOriginSuggestions(false);
    }
    
    if (field === 'destination' && value.length > 2) {
      const suggestions = majorLocations.filter(location => 
        location.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setDestSuggestions(suggestions);
      setShowDestSuggestions(true);
    } else if (field === 'destination') {
      setShowDestSuggestions(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.origin.trim()) errors.origin = 'Origin is required';
    if (!formData.destination.trim()) errors.destination = 'Destination is required';
    if (!formData.weight || parseFloat(formData.weight) <= 0) errors.weight = 'Valid weight is required';
    if (!formData.length || parseFloat(formData.length) <= 0) errors.length = 'Valid length is required';
    if (!formData.width || parseFloat(formData.width) <= 0) errors.width = 'Valid width is required';
    if (!formData.height || parseFloat(formData.height) <= 0) errors.height = 'Valid height is required';
    if (!formData.commodity.trim()) errors.commodity = 'Commodity description is required';
    if (!formData.value || parseFloat(formData.value) <= 0) errors.value = 'Cargo value is required for insurance';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateDimensionalWeight = () => {
    const length = parseFloat(formData.length) || 0;
    const width = parseFloat(formData.width) || 0;
    const height = parseFloat(formData.height) || 0;
    const actualWeight = parseFloat(formData.weight) || 0;
    
    // Air freight dimensional weight factor (166 for inches)
    const dimWeight = (length * width * height) / 166;
    return Math.max(actualWeight, dimWeight);
  };

  const calculateDistance = (origin: string, destination: string) => {
    // Simplified distance calculation based on major routes
    const routes: {[key: string]: number} = {
      'domestic': 2500, // Average US domestic distance
      'transpacific': 6000, // US to Asia
      'transatlantic': 4000, // US to Europe
      'intra-asia': 2000, // Within Asia
      'intra-europe': 1500 // Within Europe
    };
    
    const isUS = (loc: string) => loc.includes('CA') || loc.includes('NY') || loc.includes('TX') || loc.includes('WA');
    const isAsia = (loc: string) => loc.includes('China') || loc.includes('Japan') || loc.includes('Korea') || loc.includes('Singapore');
    const isEurope = (loc: string) => loc.includes('Germany') || loc.includes('Netherlands') || loc.includes('UK');
    
    if (isUS(origin) && isUS(destination)) return routes.domestic;
    if ((isUS(origin) && isAsia(destination)) || (isAsia(origin) && isUS(destination))) return routes.transpacific;
    if ((isUS(origin) && isEurope(destination)) || (isEurope(origin) && isUS(destination))) return routes.transatlantic;
    if (isAsia(origin) && isAsia(destination)) return routes['intra-asia'];
    if (isEurope(origin) && isEurope(destination)) return routes['intra-europe'];
    
    return routes.transpacific; // Default
  };

  // Auto-refresh rates every 2 minutes when results are visible
  useEffect(() => {
    if (results.length > 0) {
      const interval = setInterval(() => {
        refreshRates();
      }, 120000); // 2 minutes
      
      return () => clearInterval(interval);
    }
  }, [results.length]);

  const refreshRates = async () => {
    if (results.length === 0) return;
    
    setIsRefreshing(true);
    const oldResults = [...results];
    
    setTimeout(() => {
      // Simulate market fluctuations (±5% price changes)
      const updatedResults = results.map(result => {
        const fluctuation = (Math.random() - 0.5) * 0.1; // ±5%
        const newCost = result.cost * (1 + fluctuation);
        const change = newCost > result.cost ? 'up' : newCost < result.cost ? 'down' : 'same';
        
        return {
          ...result,
          cost: Math.round(newCost * 100) / 100,
          breakdown: {
            ...result.breakdown,
            baseCost: result.breakdown.baseCost * (1 + fluctuation)
          }
        };
      });
      
      // Track price changes for animations
      const changes: {[key: string]: 'up' | 'down' | 'same'} = {};
      updatedResults.forEach((result, index) => {
        changes[result.id] = result.cost > oldResults[index].cost ? 'up' : 
                            result.cost < oldResults[index].cost ? 'down' : 'same';
      });
      
      setResults(updatedResults);
      setPriceChanges(changes);
      setLastUpdated(new Date());
      setIsRefreshing(false);
      
      // Clear price change indicators after 3 seconds
      setTimeout(() => {
        setPriceChanges({});
      }, 3000);
    }, 1500);
  };

  const calculateRates = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsCalculating(true);
    
    // Simulate realistic API call with actual calculations
    setTimeout(() => {
      const weight = calculateDimensionalWeight();
      const distance = calculateDistance(formData.origin, formData.destination);
      const cargoValue = parseFloat(formData.value) || 0;
      const urgencyMultiplier = formData.urgency === 'express' ? 1.25 : formData.urgency === 'urgent' ? 1.5 : formData.urgency === 'critical' ? 2.0 : 1.0;
      const insuranceCost = formData.insurance ? cargoValue * 0.002 : 0; // 0.2% of cargo value
      
      const baseRates = {
        ocean: 2.5, // per kg per 1000km
        air: 8.5,   // per kg per 1000km  
        ground: 1.8 // per kg per 1000km
      };
      
      const fuelSurcharge = 0.15; // 15% fuel surcharge
      const securityFee = weight > 100 ? 75 : 35;
      const customsFee = distance > 3000 ? 150 : 0; // International shipments
      
      const calculateServiceCost = (baseRate: number, transitDays: number) => {
        const baseCost = (weight * 0.453592) * (distance / 1000) * baseRate; // Convert lbs to kg
        const fuelCost = baseCost * fuelSurcharge;
        const totalBeforeExtras = (baseCost + fuelCost) * urgencyMultiplier;
        return totalBeforeExtras + securityFee + customsFee + insuranceCost;
      };
      
      const results = [];
      
      // Ocean Freight
      if (formData.serviceType === 'all' || formData.serviceType === 'ocean') {
        const oceanCost = calculateServiceCost(baseRates.ocean, 25);
        const oceanTransit = Math.max(15, Math.round(distance / 500)); // Realistic ocean transit
        
        results.push({
          id: 1,
          service: 'Ocean Freight (FCL/LCL)',
          carrier: 'ShipSmart Ocean Lines',
          transitDays: oceanTransit,
          cost: oceanCost,
          currency: 'USD',
          icon: Ship,
          features: [
            'Door-to-door service',
            'Customs clearance included',
            'Container tracking',
            'Cargo insurance available',
            'Consolidation services'
          ],
          co2Savings: '85% less CO2 vs air freight',
          breakdown: {
            baseCost: oceanCost * 0.6,
            fuelSurcharge: oceanCost * 0.15,
            securityFee,
            customsFee,
            insurance: insuranceCost
          },
          reliability: 92,
          carbonFootprint: weight * 0.02 // kg CO2 per kg cargo
        });
      }
      
      // Air Freight
      if (formData.serviceType === 'all' || formData.serviceType === 'air') {
        const airCost = calculateServiceCost(baseRates.air, 3);
        const airTransit = Math.max(2, Math.round(distance / 2000)); // Realistic air transit
        
        results.push({
          id: 2,
          service: 'Air Freight Express',
          carrier: 'ShipSmart Air Cargo',
          transitDays: airTransit,
          cost: airCost,
          currency: 'USD',
          icon: Plane,
          features: [
            'Express delivery',
            'Real-time tracking',
            'Priority handling',
            'Temperature control available',
            '24/7 customer support'
          ],
          co2Savings: 'Carbon offset program available',
          breakdown: {
            baseCost: airCost * 0.65,
            fuelSurcharge: airCost * 0.2,
            securityFee,
            customsFee,
            insurance: insuranceCost
          },
          reliability: 98,
          carbonFootprint: weight * 0.5 // kg CO2 per kg cargo
        });
      }
      
      // Ground Transportation (domestic only)
      if ((formData.serviceType === 'all' || formData.serviceType === 'ground') && distance < 4000) {
        const groundCost = calculateServiceCost(baseRates.ground, 7);
        const groundTransit = Math.max(1, Math.round(distance / 800)); // Realistic ground transit
        
        results.push({
          id: 3,
          service: 'Ground Transportation',
          carrier: 'ShipSmart Logistics',
          transitDays: groundTransit,
          cost: groundCost,
          currency: 'USD',
          icon: Truck,
          features: [
            'Domestic delivery',
            'Flexible pickup times',
            'Signature required',
            'White glove service',
            'Liftgate service available'
          ],
          co2Savings: '60% less CO2 vs air freight',
          breakdown: {
            baseCost: groundCost * 0.7,
            fuelSurcharge: groundCost * 0.15,
            securityFee: 25,
            customsFee: 0,
            insurance: insuranceCost
          },
          reliability: 95,
          carbonFootprint: weight * 0.15 // kg CO2 per kg cargo
        });
      }
      
      // Sort by cost
      results.sort((a, b) => a.cost - b.cost);
      
      setResults(results);
      setIsCalculating(false);
    }, 2500);
  };

  const features = [
    {
      icon: Calculator,
      title: 'Instant Rate Comparison',
      description: 'Compare rates across ocean, air, and ground transportation in real-time.'
    },
    {
      icon: Clock,
      title: 'Transit Time Estimates',
      description: 'Get accurate delivery timeframes for all shipping methods.'
    },
    {
      icon: DollarSign,
      title: 'All-Inclusive Pricing',
      description: 'Transparent pricing with no hidden fees or surprise charges.'
    },
    {
      icon: Package,
      title: 'Multiple Package Types',
      description: 'Support for packages, pallets, containers, and bulk cargo.'
    }
  ];

  const tips = [
    'Consolidate shipments to reduce per-unit costs',
    'Ocean freight offers significant savings for non-urgent shipments',
    'Consider transit time vs cost trade-offs for your business needs',
    'Bulk shipping discounts available for regular customers'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Shipping Calculator
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
              Get instant shipping rates and transit times for your cargo. 
              Compare ocean, air, and ground transportation options in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator Form */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Calculate Shipping Rates</h2>
                
                <div className="space-y-6">
                  {/* Origin and Destination */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Origin *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          value={formData.origin}
                          onChange={(e) => handleInputChange('origin', e.target.value)}
                          placeholder="Enter origin city or port"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            validationErrors.origin ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {showOriginSuggestions && originSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                            {originSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  handleInputChange('origin', suggestion);
                                  setShowOriginSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {validationErrors.origin && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.origin}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          value={formData.destination}
                          onChange={(e) => handleInputChange('destination', e.target.value)}
                          placeholder="Enter destination city or port"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            validationErrors.destination ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {showDestSuggestions && destSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                            {destSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  handleInputChange('destination', suggestion);
                                  setShowDestSuggestions(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {validationErrors.destination && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.destination}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Commodity and Value */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commodity Description *
                      </label>
                      <input
                        type="text"
                        value={formData.commodity}
                        onChange={(e) => handleInputChange('commodity', e.target.value)}
                        placeholder="e.g., Electronics, Textiles, Machinery"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          validationErrors.commodity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.commodity && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.commodity}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cargo Value (USD) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="number"
                          value={formData.value}
                          onChange={(e) => handleInputChange('value', e.target.value)}
                          placeholder="Enter cargo value"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            validationErrors.value ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {validationErrors.value && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.value}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package Type
                      </label>
                      <select
                        value={formData.packageType}
                        onChange={(e) => handleInputChange('packageType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {packageTypes.map((type) => (
                          <option key={type.value} value={type.value} title={type.description}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {packageTypes.find(t => t.value === formData.packageType)?.description}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (lbs) *
                      </label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder="Enter weight"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          validationErrors.weight ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.weight && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.weight}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Length (in) *
                      </label>
                      <input
                        type="number"
                        value={formData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        placeholder="Length"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          validationErrors.length ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.length && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.length}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (in) *
                      </label>
                      <input
                        type="number"
                        value={formData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                        placeholder="Width"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          validationErrors.width ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.width && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.width}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (in) *
                      </label>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        placeholder="Height"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          validationErrors.height ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.height && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.height}</p>
                      )}
                    </div>
                  </div>

                  {/* Urgency and Insurance */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {urgencyOptions.map((option) => (
                          <option key={option.value} value={option.value} title={option.description}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {urgencyOptions.find(o => o.value === formData.urgency)?.description}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incoterms
                      </label>
                      <select
                        value={formData.incoterms}
                        onChange={(e) => handleInputChange('incoterms', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {incotermsOptions.map((option) => (
                          <option key={option.value} value={option.value} title={option.description}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {incotermsOptions.find(o => o.value === formData.incoterms)?.description}
                      </p>
                    </div>
                  </div>

                  {/* Insurance Option */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.insurance}
                        onChange={(e) => handleInputChange('insurance', e.target.checked.toString())}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Add Cargo Insurance</span>
                        <p className="text-sm text-gray-600">
                          Protect your shipment with comprehensive cargo insurance (0.2% of cargo value)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Preferred Service Type
                    </label>
                    <div className="grid md:grid-cols-4 gap-4">
                      {serviceTypes.map((service) => (
                        <button
                          key={service.value}
                          onClick={() => handleInputChange('serviceType', service.value)}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            formData.serviceType === service.value
                              ? 'border-green-600 bg-green-50 text-green-900'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <service.icon className="h-6 w-6 mx-auto mb-2" />
                          <div className="text-sm font-medium">{service.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <button
                    onClick={calculateRates}
                    disabled={isCalculating}
                    className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Calculating Real-Time Rates...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-5 w-5 mr-2" />
                        Get Instant Shipping Quotes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tips Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 text-green-600 mr-2" />
                  Shipping Tips
                </h3>
                <ul className="space-y-3">
                  {tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Our shipping experts are here to help you find the best solution for your needs.
                </p>
                <button 
                  onClick={onContactClick}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Contact Expert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  Live Shipping Rates
                </h2>
                <button
                  onClick={refreshRates}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Updating...' : 'Refresh Rates'}
                </button>
              </div>
              <p className="text-xl text-gray-600">
                Real-time rates updated every 2 minutes
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-2">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {results.map((result) => (
                <div key={result.id} className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-l-4 ${
                  priceChanges[result.id] === 'up' ? 'border-l-red-500 bg-red-50' :
                  priceChanges[result.id] === 'down' ? 'border-l-green-500 bg-green-50' :
                  'border-l-blue-500'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <result.icon className="h-12 w-12 text-green-600" />
                    <div className="text-right">
                      <div className={`text-3xl font-bold transition-all duration-500 ${
                        priceChanges[result.id] === 'up' ? 'text-red-600 animate-pulse' :
                        priceChanges[result.id] === 'down' ? 'text-green-600 animate-pulse' :
                        'text-gray-900'
                      }`}>
                        ${result.cost.toLocaleString()}
                        {priceChanges[result.id] === 'up' && (
                          <TrendingUp className="inline h-6 w-6 ml-2 text-red-500" />
                        )}
                        {priceChanges[result.id] === 'down' && (
                          <TrendingUp className="inline h-6 w-6 ml-2 text-green-500 rotate-180" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{result.currency}</div>
                      {priceChanges[result.id] && (
                        <div className={`text-xs font-medium ${
                          priceChanges[result.id] === 'up' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {priceChanges[result.id] === 'up' ? '↗ Price increased' : '↘ Price decreased'}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{result.service}</h3>
                  <p className="text-gray-600 mb-4">{result.carrier}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-700">{result.transitDays} days</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-700">{result.reliability}% reliable</span>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Cost:</span>
                        <span className="text-gray-900">${result.breakdown.baseCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuel Surcharge:</span>
                        <span className="text-gray-900">${result.breakdown.fuelSurcharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Security Fee:</span>
                        <span className="text-gray-900">${result.breakdown.securityFee.toFixed(2)}</span>
                      </div>
                      {result.breakdown.customsFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customs Fee:</span>
                          <span className="text-gray-900">${result.breakdown.customsFee.toFixed(2)}</span>
                        </div>
                      )}
                      {result.breakdown.insurance > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Insurance:</span>
                          <span className="text-gray-900">${result.breakdown.insurance.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-1 flex justify-between font-medium">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-gray-900">${result.cost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {result.features.slice(0, 3).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-green-800 font-medium">{result.co2Savings}</div>
                      <div className="text-xs text-green-600">
                        {result.carbonFootprint.toFixed(1)} kg CO₂
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={onQuoteClick}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center"
                    >
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                    <button className="px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-green-900 to-teal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Ship?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Get personalized shipping solutions and dedicated support for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-green-900 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center justify-center"
            >
              Get Custom Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-900 transition-colors"
            >
              Speak with Expert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
