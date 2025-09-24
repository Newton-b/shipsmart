import React, { useState, useEffect } from 'react';
import { Ship, Plane, Truck, Package, ShoppingCart, Plus, Minus, CreditCard, MapPin, Calendar, Clock, Star, Filter, Search, X, Building2, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'ocean' | 'air' | 'ground' | 'express' | 'specialized' | 'warehousing';
  icon: React.ComponentType<any>;
  features: string[];
  estimatedDays: string;
  maxWeight: string;
  coverage: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  popular?: boolean;
  specifications: {
    dimensions: string;
    temperature: string;
    insurance: string;
    tracking: string;
    packaging: string;
    documentation: string;
  };
  addOns: {
    name: string;
    price: number;
    description: string;
  }[];
  routes: {
    from: string;
    to: string;
    price: number;
    days: string;
  }[];
}

interface CartItem extends Product {
  quantity: number;
}

type PaymentMethod = 'card' | 'bank' | 'paypal' | 'apple_pay' | 'google_pay' | 'crypto';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  supportedCards?: string[];
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express, Discover',
    supportedCards: ['visa', 'mastercard', 'amex', 'discover']
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 6.430-7.958 6.430H10.15c-.524 0-.968.382-1.05.9L8.0 19.797h2.776c.458 0 .848-.334.922-.788l.038-.24.724-4.583.046-.253c.074-.454.464-.788.922-.788h.58c3.187 0 5.681-1.295 6.407-5.04.303-1.565.146-2.874-.673-3.832z"/>
      </svg>
    ),
    description: 'Pay with your PayPal account'
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: Smartphone,
    description: 'Quick payment with Touch ID or Face ID'
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: Smartphone,
    description: 'Fast and secure Google payment'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: Building2,
    description: 'Direct bank transfer (ACH, Wire, SEPA)'
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-1.135 2.784-2.806 3.092v1.745h-1.138v-1.745c-.287 0-.576-.014-.865-.042v1.787H11.62v-1.745l-.66-.042v1.787h-1.138v-1.745c-.306-.014-.612-.042-.918-.042v1.787H7.766v-1.745c-.322-.014-.644-.042-.966-.042H5.662v-1.138h1.138c.322 0 .644.014.966.042v-4.326c-.322.014-.644.042-.966.042H5.662V7.022H6.8c.322 0 .644.014.966.042.306 0 .612.014.918.042V5.361h1.138v1.745l.66.042V5.361h1.138v1.745c1.671.308 2.637 1.234 2.806 3.092z"/>
      </svg>
    ),
    description: 'Bitcoin, Ethereum, and other cryptocurrencies'
  }
];

const products: Product[] = [
  {
    id: '1',
    name: 'Ocean Freight Standard',
    description: 'Cost-effective ocean shipping for large volumes and non-urgent deliveries',
    price: 1200,
    originalPrice: 1450,
    category: 'ocean',
    icon: Ship,
    features: ['Full container load (FCL)', 'Less than container load (LCL)', 'Door-to-door service', 'Customs clearance', 'Port-to-port service', 'Consolidation services'],
    estimatedDays: '25-35 days',
    maxWeight: '28,000 kg',
    coverage: 'Global ports',
    rating: 4.5,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    badge: '17% OFF',
    specifications: {
      dimensions: 'Up to 40ft container (12.2m x 2.4m x 2.6m)',
      temperature: 'Ambient, Refrigerated (-25°C to +25°C)',
      insurance: 'Up to $100,000 coverage',
      tracking: 'Real-time GPS + milestone updates',
      packaging: 'Industrial packaging, palletizing',
      documentation: 'Bill of Lading, Commercial Invoice, Packing List'
    },
    addOns: [
      { name: 'White Glove Service', price: 250, description: 'Premium handling and setup' },
      { name: 'Expedited Customs', price: 150, description: 'Priority customs clearance' },
      { name: 'Additional Insurance', price: 75, description: 'Extended coverage up to $500k' },
      { name: 'Warehouse Storage', price: 45, description: 'Per day storage at destination' }
    ],
    routes: [
      { from: 'Shanghai', to: 'Los Angeles', price: 1200, days: '18-22' },
      { from: 'Hamburg', to: 'New York', price: 1350, days: '12-16' },
      { from: 'Singapore', to: 'Rotterdam', price: 1450, days: '25-30' },
      { from: 'Hong Kong', to: 'Long Beach', price: 1180, days: '16-20' }
    ]
  },
  {
    id: '2',
    name: 'Air Freight Express',
    description: 'Fast and reliable air shipping for time-sensitive cargo',
    price: 2800,
    category: 'air',
    icon: Plane,
    popular: true,
    features: ['Express delivery', 'Temperature controlled', 'Real-time tracking', 'Insurance included', 'Priority handling', 'Dangerous goods certified'],
    estimatedDays: '2-5 days',
    maxWeight: '500 kg',
    coverage: '200+ airports',
    rating: 4.8,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=250&fit=crop',
    badge: 'POPULAR',
    specifications: {
      dimensions: 'Up to 2.44m x 3.18m x 2.44m (LxWxH)',
      temperature: 'Controlled -20°C to +20°C, Pharma grade',
      insurance: 'Up to $50,000 coverage included',
      tracking: 'Live GPS tracking + photo proof',
      packaging: 'Air-certified packaging, shock protection',
      documentation: 'Air Waybill, MSDS, Export permits'
    },
    addOns: [
      { name: 'Same Day Delivery', price: 850, description: 'Guaranteed same-day delivery' },
      { name: 'Pharma Certification', price: 450, description: 'GDP-compliant pharmaceutical transport' },
      { name: 'Dangerous Goods', price: 320, description: 'IATA certified hazmat shipping' },
      { name: 'Hand Carry Service', price: 1200, description: 'Personal courier accompanies shipment' }
    ],
    routes: [
      { from: 'New York', to: 'London', price: 2800, days: '1-2' },
      { from: 'Los Angeles', to: 'Tokyo', price: 3200, days: '2-3' },
      { from: 'Frankfurt', to: 'Dubai', price: 2650, days: '1-2' },
      { from: 'Miami', to: 'São Paulo', price: 2950, days: '2-4' }
    ]
  },
  {
    id: '3',
    name: 'Ground Transportation',
    description: 'Reliable overland shipping for regional and domestic deliveries',
    price: 450,
    originalPrice: 520,
    category: 'ground',
    icon: Truck,
    features: ['Full truckload (FTL)', 'Less than truckload (LTL)', 'Last-mile delivery', 'Flexible scheduling', 'Cross-docking', 'Multi-stop delivery'],
    estimatedDays: '3-7 days',
    maxWeight: '26,000 kg',
    coverage: 'Continental routes',
    rating: 4.3,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&h=250&fit=crop',
    badge: '13% OFF',
    specifications: {
      dimensions: 'Up to 16.15m x 2.6m x 4m (53ft trailer)',
      temperature: 'Ambient, Refrigerated (-18°C to +2°C)',
      insurance: 'Up to $25,000 coverage',
      tracking: 'Real-time GPS + ETA updates',
      packaging: 'Standard pallets, shrink wrap',
      documentation: 'BOL, Delivery receipt, POD'
    },
    addOns: [
      { name: 'Liftgate Service', price: 85, description: 'Hydraulic liftgate for heavy items' },
      { name: 'Inside Delivery', price: 125, description: 'Delivery inside building/room' },
      { name: 'Appointment Delivery', price: 65, description: 'Scheduled delivery window' },
      { name: 'Residential Delivery', price: 95, description: 'Home delivery service' }
    ],
    routes: [
      { from: 'Chicago', to: 'Dallas', price: 450, days: '2-3' },
      { from: 'Atlanta', to: 'Miami', price: 380, days: '1-2' },
      { from: 'Los Angeles', to: 'Phoenix', price: 320, days: '1-2' },
      { from: 'New York', to: 'Boston', price: 280, days: '1' }
    ]
  },
  {
    id: '4',
    name: 'Express Courier',
    description: 'Premium express service for urgent small packages and documents',
    price: 85,
    category: 'express',
    icon: Package,
    features: ['Same-day delivery', 'Signature required', 'Live tracking', 'Insurance up to $5000', 'Photo proof', 'Time-definite delivery'],
    estimatedDays: 'Same day - 2 days',
    maxWeight: '30 kg',
    coverage: 'Major cities',
    rating: 4.9,
    reviews: 412,
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=250&fit=crop',
    specifications: {
      dimensions: 'Up to 61cm x 46cm x 46cm',
      temperature: 'Ambient, insulated bags available',
      insurance: 'Up to $5,000 included',
      tracking: 'Live GPS + SMS notifications',
      packaging: 'Secure envelopes, boxes, tubes',
      documentation: 'Delivery receipt, signature capture'
    },
    addOns: [
      { name: 'Saturday Delivery', price: 25, description: 'Weekend delivery service' },
      { name: 'Early AM Delivery', price: 35, description: 'Before 9 AM delivery' },
      { name: 'Direct Signature', price: 15, description: 'Recipient signature required' },
      { name: 'Chain of Custody', price: 45, description: 'Legal document tracking' }
    ],
    routes: [
      { from: 'Manhattan', to: 'Brooklyn', price: 85, days: 'Same day' },
      { from: 'Downtown LA', to: 'Beverly Hills', price: 75, days: 'Same day' },
      { from: 'Chicago Loop', to: 'O\'Hare Airport', price: 95, days: 'Same day' },
      { from: 'San Francisco', to: 'San Jose', price: 120, days: 'Same day' }
    ]
  },
  {
    id: '5',
    name: 'Specialized Cargo',
    description: 'Expert handling for oversized, hazardous, and high-value cargo',
    price: 3500,
    category: 'specialized',
    icon: Building2,
    features: ['Project cargo', 'Heavy lift', 'Oversized transport', 'Hazmat certified', 'High-value security', 'Custom solutions'],
    estimatedDays: '5-14 days',
    maxWeight: 'No limit',
    coverage: 'Global specialized',
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop',
    badge: 'EXPERT',
    specifications: {
      dimensions: 'Custom solutions for any size',
      temperature: 'Any required temperature range',
      insurance: 'Up to $10M coverage available',
      tracking: '24/7 dedicated monitoring',
      packaging: 'Custom engineered solutions',
      documentation: 'Full regulatory compliance'
    },
    addOns: [
      { name: 'Route Survey', price: 850, description: 'Pre-transport route analysis' },
      { name: 'Escort Vehicles', price: 1200, description: 'Police/pilot car escort' },
      { name: 'Crane Service', price: 2500, description: 'Loading/unloading equipment' },
      { name: 'Permit Handling', price: 450, description: 'All required permits and licenses' }
    ],
    routes: [
      { from: 'Houston', to: 'Offshore Platform', price: 3500, days: '3-5' },
      { from: 'Detroit', to: 'Assembly Plant', price: 4200, days: '5-7' },
      { from: 'Port of Long Beach', to: 'Las Vegas', price: 2800, days: '2-3' },
      { from: 'New Orleans', to: 'Refinery TX', price: 3200, days: '3-4' }
    ]
  },
  {
    id: '6',
    name: 'Warehousing & Distribution',
    description: 'Complete fulfillment solutions with storage, pick & pack, and distribution',
    price: 125,
    category: 'warehousing',
    icon: Building2,
    features: ['Climate controlled storage', 'Pick & pack services', 'Inventory management', 'Order fulfillment', 'Cross-docking', 'Returns processing'],
    estimatedDays: 'On-demand',
    maxWeight: 'Unlimited',
    coverage: '50+ facilities',
    rating: 4.6,
    reviews: 267,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop',
    specifications: {
      dimensions: 'Scalable storage solutions',
      temperature: 'Ambient, refrigerated, frozen',
      insurance: 'Full warehouse coverage',
      tracking: 'WMS integration + API access',
      packaging: 'Custom packaging solutions',
      documentation: 'Full inventory reporting'
    },
    addOns: [
      { name: 'Kitting Services', price: 35, description: 'Product assembly and kitting' },
      { name: 'Quality Control', price: 25, description: 'Incoming inspection services' },
      { name: 'Returns Processing', price: 45, description: 'Return merchandise handling' },
      { name: 'Custom Packaging', price: 55, description: 'Branded packaging solutions' }
    ],
    routes: [
      { from: 'West Coast Hub', to: 'Customer', price: 125, days: '1-2' },
      { from: 'East Coast Hub', to: 'Customer', price: 125, days: '1-2' },
      { from: 'Central Hub', to: 'Customer', price: 115, days: '1-3' },
      { from: 'International Hub', to: 'Customer', price: 145, days: '2-5' }
    ]
  }
];

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');

  // Checkout form state
  const [shippingForm, setShippingForm] = useState({
    name: user?.firstName + ' ' + user?.lastName || '',
    address: '',
    city: '',
    country: '',
    zipCode: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: user?.firstName + ' ' + user?.lastName || '',
    // Bank transfer fields
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    // Crypto fields
    walletAddress: '',
    cryptoType: 'bitcoin'
  });

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    setShowCheckout(true);
  };

  const processPayment = () => {
    // Simulate payment processing
    setCart([]);
    setShowCheckout(false);
    setOrderSuccess(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => setOrderSuccess(false), 5000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ocean': return Ship;
      case 'air': return Plane;
      case 'ground': return Truck;
      case 'express': return Package;
      default: return Package;
    }
  };

  const detectCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    return '';
  };

  const renderPaymentForm = () => {
    switch (selectedPaymentMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Cardholder Name"
              value={paymentForm.cardholderName}
              onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Card Number"
                value={paymentForm.cardNumber}
                onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {detectCardType(paymentForm.cardNumber) === 'visa' && (
                  <div className="text-blue-600 font-bold text-xs">VISA</div>
                )}
                {detectCardType(paymentForm.cardNumber) === 'mastercard' && (
                  <div className="text-red-600 font-bold text-xs">MC</div>
                )}
                {detectCardType(paymentForm.cardNumber) === 'amex' && (
                  <div className="text-green-600 font-bold text-xs">AMEX</div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM/YY"
                value={paymentForm.expiryDate}
                onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="CVV"
                value={paymentForm.cvv}
                onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Accepted:</span>
              <span className="text-blue-600 font-semibold">VISA</span>
              <span className="text-red-600 font-semibold">Mastercard</span>
              <span className="text-green-600 font-semibold">AMEX</span>
              <span className="text-orange-600 font-semibold">Discover</span>
            </div>
          </div>
        );
      
      case 'bank':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Bank Name"
              value={paymentForm.bankName}
              onChange={(e) => setPaymentForm({...paymentForm, bankName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={paymentForm.accountNumber}
              onChange={(e) => setPaymentForm({...paymentForm, accountNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Routing Number"
                value={paymentForm.routingNumber}
                onChange={(e) => setPaymentForm({...paymentForm, routingNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="SWIFT Code (International)"
                value={paymentForm.swiftCode}
                onChange={(e) => setPaymentForm({...paymentForm, swiftCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Bank transfers may take 1-3 business days to process. You will receive payment instructions after placing your order.
              </p>
            </div>
          </div>
        );
      
      case 'crypto':
        return (
          <div className="space-y-4">
            <select
              value={paymentForm.cryptoType}
              onChange={(e) => setPaymentForm({...paymentForm, cryptoType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="usdc">USD Coin (USDC)</option>
              <option value="usdt">Tether (USDT)</option>
            </select>
            <input
              type="text"
              placeholder="Your Wallet Address"
              value={paymentForm.walletAddress}
              onChange={(e) => setPaymentForm({...paymentForm, walletAddress: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Cryptocurrency payments are processed through our secure blockchain payment gateway. Transaction fees may apply.
              </p>
            </div>
          </div>
        );
      
      case 'paypal':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 6.430-7.958 6.430H10.15c-.524 0-.968.382-1.05.9L8.0 19.797h2.776c.458 0 .848-.334.922-.788l.038-.24.724-4.583.046-.253c.074-.454.464-.788.922-.788h.58c3.187 0 5.681-1.295 6.407-5.04.303-1.565.146-2.874-.673-3.832z"/>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You will be redirected to PayPal to complete your payment securely.
            </p>
          </div>
        );
      
      case 'apple_pay':
      case 'google_pay':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedPaymentMethod === 'apple_pay' ? 'Touch ID or Face ID' : 'Google Pay'} will be used to complete your payment.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Freight Services & Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose from our comprehensive range of shipping solutions for your cargo needs
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {['all', 'ocean', 'air', 'ground', 'express'].map(category => {
                const Icon = category === 'all' ? Filter : getCategoryIcon(category);
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map(product => {
            const Icon = product.icon;
            return (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {product.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      {product.estimatedDays}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Package className="w-4 h-4 mr-2" />
                      Max: {product.maxWeight}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {product.coverage}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">
                          per shipment
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 2).map((feature, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {product.features.length > 2 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                          +{product.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No services found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Shopping Cart ({getCartItemCount()} items)
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <Icon className="w-8 h-8 text-blue-600" />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ${item.price.toLocaleString()} per shipment
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total: ${getCartTotal().toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Checkout
                </h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2">
                      <span className="text-gray-900 dark:text-white">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${getCartTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Shipping Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingForm.name}
                    onChange={(e) => setShippingForm({...shippingForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={shippingForm.address}
                    onChange={(e) => setShippingForm({...shippingForm, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({...shippingForm, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={shippingForm.country}
                    onChange={(e) => setShippingForm({...shippingForm, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shippingForm.zipCode}
                    onChange={(e) => setShippingForm({...shippingForm, zipCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Payment Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                          selectedPaymentMethod === method.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <method.icon className="w-5 h-5" />
                        <span className="text-sm">{method.name}</span>
                      </button>
                    ))}
                  </div>
                  {renderPaymentForm()}
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={processPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Place Order - ${getCartTotal().toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Thank you for your order. You will receive a confirmation email shortly.
            </p>
            <button
              onClick={() => setOrderSuccess(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
