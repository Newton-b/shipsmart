import React, { useState, useEffect } from 'react';
import {
  Ship, Plane, Truck, Warehouse, FileText, Shield, Clock, 
  DollarSign, MapPin, Package, Calculator, Star, CheckCircle,
  ArrowRight, Globe, Zap, Users, BarChart3, Phone, Mail,
  Calendar, CreditCard, Download, Eye, Filter, Search
} from 'lucide-react';
import { MobileButton, MobileCard, MobileInput, MobileSelect } from '../components/MobileUILibrary';
import { PaymentSystem } from '../components/PaymentSystem';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'freight' | 'logistics' | 'technology' | 'support';
  pricing: {
    type: 'fixed' | 'variable' | 'quote';
    startingPrice?: number;
    currency: string;
    unit?: string;
  };
  features: string[];
  benefits: string[];
  transitTime: string;
  coverage: string[];
  rating: number;
  reviews: number;
  isPopular?: boolean;
  isNew?: boolean;
  gallery: string[];
  specifications: { [key: string]: string };
  addOns: ServiceAddOn[];
}

interface ServiceAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  required?: boolean;
}

interface QuoteRequest {
  serviceId: string;
  origin: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  destination: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  cargo: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    value: number;
    description: string;
    hazardous: boolean;
  };
  timeline: {
    pickupDate: Date;
    deliveryDate?: Date;
    flexible: boolean;
  };
  addOns: string[];
}

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showPaymentSystem, setShowPaymentSystem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, selectedCategory, searchQuery]);

  const loadServices = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockServices: Service[] = [
      {
        id: 'ocean-freight',
        name: 'Ocean Freight',
        description: 'Cost-effective shipping for large volumes across international waters',
        icon: Ship,
        category: 'freight',
        pricing: {
          type: 'variable',
          startingPrice: 1200,
          currency: 'USD',
          unit: 'per container'
        },
        features: [
          'Full Container Load (FCL)',
          'Less than Container Load (LCL)',
          'Door-to-door delivery',
          'Real-time tracking',
          'Insurance coverage',
          'Customs clearance'
        ],
        benefits: [
          'Most cost-effective for large shipments',
          'Environmentally friendly',
          'High capacity',
          'Global coverage'
        ],
        transitTime: '15-45 days',
        coverage: ['Global', '200+ ports worldwide'],
        rating: 4.8,
        reviews: 1247,
        isPopular: true,
        gallery: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
        specifications: {
          'Container Types': '20ft, 40ft, 40ft HC, 45ft',
          'Max Weight': '28,000 kg (20ft), 30,000 kg (40ft)',
          'Volume': '33 CBM (20ft), 67 CBM (40ft)',
          'Temperature Control': 'Available for reefer containers'
        },
        addOns: [
          {
            id: 'insurance',
            name: 'Cargo Insurance',
            description: 'Comprehensive coverage for your shipment',
            price: 150,
            currency: 'USD'
          },
          {
            id: 'priority',
            name: 'Priority Handling',
            description: 'Expedited processing at ports',
            price: 300,
            currency: 'USD'
          }
        ]
      },
      {
        id: 'air-freight',
        name: 'Air Freight',
        description: 'Fast and reliable shipping for time-sensitive cargo',
        icon: Plane,
        category: 'freight',
        pricing: {
          type: 'variable',
          startingPrice: 4.50,
          currency: 'USD',
          unit: 'per kg'
        },
        features: [
          'Express delivery',
          'Temperature-controlled options',
          'Dangerous goods handling',
          'Live tracking',
          'Airport-to-airport service',
          'Door-to-door available'
        ],
        benefits: [
          'Fastest transit times',
          'High security',
          'Reliable schedules',
          'Global network'
        ],
        transitTime: '1-7 days',
        coverage: ['Global', '500+ airports'],
        rating: 4.9,
        reviews: 892,
        gallery: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        specifications: {
          'Max Dimensions': '318cm x 224cm x 160cm',
          'Max Weight': '150 kg per piece',
          'Volume Weight': '6000 CBM/kg',
          'Temperature Range': '-20°C to +20°C'
        },
        addOns: [
          {
            id: 'express',
            name: 'Express Service',
            description: 'Next-day delivery available',
            price: 200,
            currency: 'USD'
          },
          {
            id: 'white-glove',
            name: 'White Glove Service',
            description: 'Premium handling and delivery',
            price: 500,
            currency: 'USD'
          }
        ]
      },
      {
        id: 'ground-transport',
        name: 'Ground Transportation',
        description: 'Flexible trucking solutions for domestic and regional shipping',
        icon: Truck,
        category: 'freight',
        pricing: {
          type: 'variable',
          startingPrice: 2.50,
          currency: 'USD',
          unit: 'per mile'
        },
        features: [
          'Full Truckload (FTL)',
          'Less than Truckload (LTL)',
          'Expedited service',
          'Temperature control',
          'Hazmat certified',
          'Real-time GPS tracking'
        ],
        benefits: [
          'Flexible scheduling',
          'Direct delivery',
          'Cost-effective for regional shipping',
          'Reliable transit times'
        ],
        transitTime: '1-5 days',
        coverage: ['North America', 'Mexico', 'Canada'],
        rating: 4.7,
        reviews: 2156,
        gallery: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
        specifications: {
          'Truck Types': 'Dry van, Flatbed, Refrigerated, Step deck',
          'Max Weight': '80,000 lbs gross',
          'Max Length': '53 feet',
          'Temperature Range': '-10°F to 70°F'
        },
        addOns: [
          {
            id: 'liftgate',
            name: 'Liftgate Service',
            description: 'Hydraulic lift for heavy items',
            price: 75,
            currency: 'USD'
          },
          {
            id: 'inside-delivery',
            name: 'Inside Delivery',
            description: 'Delivery inside building',
            price: 125,
            currency: 'USD'
          }
        ]
      },
      {
        id: 'warehousing',
        name: 'Warehousing & Distribution',
        description: 'Secure storage and fulfillment services',
        icon: Warehouse,
        category: 'logistics',
        pricing: {
          type: 'variable',
          startingPrice: 15,
          currency: 'USD',
          unit: 'per pallet/month'
        },
        features: [
          'Climate-controlled storage',
          'Inventory management',
          'Pick and pack services',
          'Cross-docking',
          'Returns processing',
          'WMS integration'
        ],
        benefits: [
          'Reduce overhead costs',
          'Scalable storage',
          'Professional handling',
          'Strategic locations'
        ],
        transitTime: 'Same day processing',
        coverage: ['50+ locations', 'Major metro areas'],
        rating: 4.6,
        reviews: 743,
        isNew: true,
        gallery: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        specifications: {
          'Storage Types': 'Ambient, Refrigerated, Frozen, Hazmat',
          'Ceiling Height': '24-32 feet',
          'Security': '24/7 monitoring, Access control',
          'Technology': 'WMS, RFID, Barcode scanning'
        },
        addOns: [
          {
            id: 'kitting',
            name: 'Kitting Services',
            description: 'Product assembly and packaging',
            price: 2.50,
            currency: 'USD'
          },
          {
            id: 'labeling',
            name: 'Custom Labeling',
            description: 'Product labeling and branding',
            price: 0.50,
            currency: 'USD'
          }
        ]
      },
      {
        id: 'customs-clearance',
        name: 'Customs Clearance',
        description: 'Expert customs brokerage and trade compliance',
        icon: FileText,
        category: 'logistics',
        pricing: {
          type: 'fixed',
          startingPrice: 125,
          currency: 'USD',
          unit: 'per shipment'
        },
        features: [
          'Import/Export documentation',
          'Duty and tax calculation',
          'Trade compliance',
          'AES filing',
          'ISF filing',
          'Drawback services'
        ],
        benefits: [
          'Avoid delays and penalties',
          'Expert knowledge',
          'Compliance assurance',
          'Cost optimization'
        ],
        transitTime: '1-3 business days',
        coverage: ['All major ports', 'Global trade lanes'],
        rating: 4.9,
        reviews: 567,
        gallery: ['/api/placeholder/400/300'],
        specifications: {
          'Licenses': 'Licensed customs broker',
          'Coverage': 'All US ports and borders',
          'Systems': 'ACE, ABI, AES certified',
          'Languages': 'English, Spanish, Mandarin'
        },
        addOns: [
          {
            id: 'consultation',
            name: 'Trade Consultation',
            description: 'Expert trade advice and planning',
            price: 200,
            currency: 'USD'
          }
        ]
      },
      {
        id: 'supply-chain-analytics',
        name: 'Supply Chain Analytics',
        description: 'Advanced analytics and optimization tools',
        icon: BarChart3,
        category: 'technology',
        pricing: {
          type: 'fixed',
          startingPrice: 299,
          currency: 'USD',
          unit: 'per month'
        },
        features: [
          'Real-time dashboards',
          'Predictive analytics',
          'Cost optimization',
          'Performance metrics',
          'Custom reporting',
          'API integration'
        ],
        benefits: [
          'Data-driven decisions',
          'Cost savings identification',
          'Performance improvement',
          'Risk mitigation'
        ],
        transitTime: 'Real-time insights',
        coverage: ['Cloud-based', 'Global access'],
        rating: 4.8,
        reviews: 234,
        isNew: true,
        gallery: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        specifications: {
          'Data Sources': '50+ integrations',
          'Updates': 'Real-time',
          'Storage': 'Unlimited historical data',
          'Access': 'Web, mobile, API'
        },
        addOns: [
          {
            id: 'custom-dashboard',
            name: 'Custom Dashboard',
            description: 'Tailored analytics dashboard',
            price: 500,
            currency: 'USD'
          }
        ]
      }
    ];

    setServices(mockServices);
    setIsLoading(false);
  };

  const filterServices = () => {
    let filtered = services;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.features.some(feature => 
          feature.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredServices(filtered);
  };

  const formatPrice = (service: Service) => {
    if (service.pricing.type === 'quote') {
      return 'Request Quote';
    }
    
    const price = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: service.pricing.currency
    }).format(service.pricing.startingPrice || 0);

    return `From ${price}${service.pricing.unit ? ` ${service.pricing.unit}` : ''}`;
  };

  const handleRequestQuote = (service: Service) => {
    setSelectedService(service);
    setShowQuoteForm(true);
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowPaymentSystem(true);
  };

  const categories = [
    { id: 'all', name: 'All Services', icon: Globe },
    { id: 'freight', name: 'Freight', icon: Package },
    { id: 'logistics', name: 'Logistics', icon: Warehouse },
    { id: 'technology', name: 'Technology', icon: Zap },
    { id: 'support', name: 'Support', icon: Users }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Our Services</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Comprehensive logistics solutions tailored to your business needs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <MobileInput
                placeholder="Search services..."
                value={searchQuery}
                onChange={setSearchQuery}
                icon={Search}
              />
            </div>
            <MobileSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categories.map(cat => ({
                value: cat.id,
                label: cat.name
              }))}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredServices.map((service) => (
            <MobileCard key={service.id} className="relative overflow-hidden">
              {service.isPopular && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                  Popular
                </div>
              )}
              {service.isNew && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                  New
                </div>
              )}

              <div className="p-6">
                {/* Service Icon and Title */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <service.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{service.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({service.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                {/* Key Features */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                  <div className="space-y-1">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <div className="text-sm text-blue-600">
                        +{service.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>

                {/* Transit Time and Coverage */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="flex items-center space-x-1 text-gray-500 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>Transit Time</span>
                    </div>
                    <div className="font-medium">{service.transitTime}</div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1 text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>Coverage</span>
                    </div>
                    <div className="font-medium">{service.coverage[0]}</div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatPrice(service)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <MobileButton
                    onClick={() => handleRequestQuote(service)}
                    variant="primary"
                    fullWidth
                    icon={Calculator}
                  >
                    Get Quote
                  </MobileButton>
                  <MobileButton
                    onClick={() => setSelectedService(service)}
                    variant="outline"
                    fullWidth
                    icon={Eye}
                  >
                    View Details
                  </MobileButton>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>

        {/* Service Details Modal */}
        {selectedService && !showQuoteForm && !showPaymentSystem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <selectedService.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedService.name}</h2>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{selectedService.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({selectedService.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600">{selectedService.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                      <div className="space-y-2">
                        {selectedService.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                      <div className="space-y-2">
                        {selectedService.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                      <div className="space-y-3">
                        {Object.entries(selectedService.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Add-On Services</h3>
                      <div className="space-y-3">
                        {selectedService.addOns.map((addOn) => (
                          <div key={addOn.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium text-gray-900">{addOn.name}</h4>
                              <span className="font-semibold text-blue-600">
                                ${addOn.price}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{addOn.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900 mb-2">
                          {formatPrice(selectedService)}
                        </div>
                        <div className="space-y-2">
                          <MobileButton
                            onClick={() => handleRequestQuote(selectedService)}
                            variant="primary"
                            fullWidth
                            icon={Calculator}
                          >
                            Get Custom Quote
                          </MobileButton>
                          <MobileButton
                            onClick={() => handleBookService(selectedService)}
                            variant="outline"
                            fullWidth
                            icon={CreditCard}
                          >
                            Book Now
                          </MobileButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment System Modal */}
        {showPaymentSystem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Payment & Booking</h2>
                  <button
                    onClick={() => setShowPaymentSystem(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                <PaymentSystem
                  customerId="demo-customer-123"
                  onPaymentSuccess={(paymentId) => {
                    console.log('Payment successful:', paymentId);
                    setShowPaymentSystem(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our logistics experts are ready to design a tailored solution for your unique requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MobileButton
              onClick={() => window.open('tel:+1-800-RAPHTRACK')}
              variant="secondary"
              icon={Phone}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Call Us Now
            </MobileButton>
            <MobileButton
              onClick={() => window.open('mailto:sales@raphtrack.com')}
              variant="outline"
              icon={Mail}
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Email Sales Team
            </MobileButton>
          </div>
        </div>
      </div>
    </div>
  );
};
