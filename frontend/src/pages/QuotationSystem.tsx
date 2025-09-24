import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Search, 
  Plus, 
  Edit, 
  Send, 
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  Package,
  Truck,
  Ship,
  Plane,
  MapPin,
  Calendar,
  User,
  Building
} from 'lucide-react';

interface QuoteRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  company: string;
  origin: string;
  destination: string;
  serviceType: 'ocean' | 'air' | 'ground';
  cargoType: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  urgency: 'standard' | 'express' | 'urgent';
  status: 'pending' | 'quoted' | 'approved' | 'rejected';
  requestDate: Date;
  quotedPrice: number | null;
  validUntil: Date | null;
  notes: string;
}

interface PricingRule {
  id: string;
  serviceType: 'ocean' | 'air' | 'ground';
  route: string;
  baseRate: number;
  weightMultiplier: number;
  volumeMultiplier: number;
  fuelSurcharge: number;
  securityFee: number;
  handlingFee: number;
  insuranceRate: number;
}

export const QuotationSystem: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'pricing' | 'calculator'>('requests');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'quoted' | 'approved' | 'rejected'>('all');

  // Calculator state
  const [calculatorData, setCalculatorData] = useState({
    origin: '',
    destination: '',
    serviceType: 'ocean' as 'ocean' | 'air' | 'ground',
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    cargoValue: 0,
    urgency: 'standard' as 'standard' | 'express' | 'urgent'
  });
  const [calculatedQuote, setCalculatedQuote] = useState<number | null>(null);

  useEffect(() => {
    // Mock data
    const mockQuotes: QuoteRequest[] = [
      {
        id: '1',
        customerName: 'John Smith',
        customerEmail: 'john@globaltrade.com',
        company: 'Global Trade Corp',
        origin: 'New York, NY',
        destination: 'Shanghai, China',
        serviceType: 'ocean',
        cargoType: 'Electronics',
        weight: 2500,
        dimensions: { length: 240, width: 120, height: 100 },
        value: 150000,
        urgency: 'standard',
        status: 'pending',
        requestDate: new Date('2024-01-15'),
        quotedPrice: null,
        validUntil: null,
        notes: 'Temperature controlled shipping required'
      },
      {
        id: '2',
        customerName: 'Maria Garcia',
        customerEmail: 'maria@importsolutions.com',
        company: 'Import Solutions Ltd',
        origin: 'Los Angeles, CA',
        destination: 'Hamburg, Germany',
        serviceType: 'air',
        cargoType: 'Pharmaceuticals',
        weight: 500,
        dimensions: { length: 100, width: 80, height: 60 },
        value: 75000,
        urgency: 'express',
        status: 'quoted',
        requestDate: new Date('2024-01-14'),
        quotedPrice: 8500,
        validUntil: new Date('2024-02-14'),
        notes: 'Requires special handling and documentation'
      }
    ];

    const mockPricingRules: PricingRule[] = [
      {
        id: '1',
        serviceType: 'ocean',
        route: 'US-Asia',
        baseRate: 1200,
        weightMultiplier: 0.8,
        volumeMultiplier: 150,
        fuelSurcharge: 0.15,
        securityFee: 50,
        handlingFee: 100,
        insuranceRate: 0.002
      },
      {
        id: '2',
        serviceType: 'air',
        route: 'US-Europe',
        baseRate: 2500,
        weightMultiplier: 4.5,
        volumeMultiplier: 300,
        fuelSurcharge: 0.25,
        securityFee: 75,
        handlingFee: 150,
        insuranceRate: 0.003
      }
    ];

    setQuotes(mockQuotes);
    setPricingRules(mockPricingRules);
  }, []);

  const calculateQuote = () => {
    const volume = (calculatorData.length * calculatorData.width * calculatorData.height) / 1000000; // m³
    const rule = pricingRules.find(r => r.serviceType === calculatorData.serviceType);
    
    if (!rule) {
      setCalculatedQuote(null);
      return;
    }

    const basePrice = rule.baseRate;
    const weightCost = calculatorData.weight * rule.weightMultiplier;
    const volumeCost = volume * rule.volumeMultiplier;
    const fuelSurcharge = (basePrice + weightCost + volumeCost) * rule.fuelSurcharge;
    const insurance = calculatorData.cargoValue * rule.insuranceRate;
    const urgencyMultiplier = calculatorData.urgency === 'express' ? 1.5 : calculatorData.urgency === 'urgent' ? 2.0 : 1.0;

    const total = (basePrice + weightCost + volumeCost + fuelSurcharge + rule.securityFee + rule.handlingFee + insurance) * urgencyMultiplier;
    
    setCalculatedQuote(Math.round(total));
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'ocean': return <Ship className="w-4 h-4" />;
      case 'air': return <Plane className="w-4 h-4" />;
      case 'ground': return <Truck className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'quoted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const QuoteModal = () => (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Quote Details - {selectedQuote?.id}
          </h3>
          <button 
            onClick={() => setShowQuoteModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        
        {selectedQuote && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedQuote.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Company:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedQuote.company}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Shipment Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Route:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedQuote.origin} → {selectedQuote.destination}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(selectedQuote.serviceType)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">Service:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {selectedQuote.serviceType} Freight
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Quoted Price:</span>
                  <div className="text-right">
                    {selectedQuote.quotedPrice ? (
                      <>
                        <div className="text-2xl font-bold text-green-600">${selectedQuote.quotedPrice.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Valid until {selectedQuote.validUntil?.toLocaleDateString()}</div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Enter quote amount"
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                        />
                        <button className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Generate Quote
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Send Quote</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              <span>Quotation System</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Automated pricing and quote management
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'requests', label: 'Quote Requests', icon: FileText },
            { id: 'calculator', label: 'Price Calculator', icon: Calculator },
            { id: 'pricing', label: 'Pricing Rules', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'requests' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search quotes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="quoted">Quoted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Quotes Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quote
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredQuotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {quote.customerName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {quote.company}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {quote.origin}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            → {quote.destination}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getServiceIcon(quote.serviceType)}
                            <span className="text-sm text-gray-900 dark:text-white capitalize">
                              {quote.serviceType}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                            {quote.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {quote.quotedPrice ? `$${quote.quotedPrice.toLocaleString()}` : 'Pending'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedQuote(quote);
                              setShowQuoteModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'calculator' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Price Calculator</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Origin
                    </label>
                    <input
                      type="text"
                      value={calculatorData.origin}
                      onChange={(e) => setCalculatorData({...calculatorData, origin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Destination
                    </label>
                    <input
                      type="text"
                      value={calculatorData.destination}
                      onChange={(e) => setCalculatorData({...calculatorData, destination: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service Type
                    </label>
                    <select
                      value={calculatorData.serviceType}
                      onChange={(e) => setCalculatorData({...calculatorData, serviceType: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="ocean">Ocean Freight</option>
                      <option value="air">Air Freight</option>
                      <option value="ground">Ground Transport</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={calculatorData.weight}
                      onChange={(e) => setCalculatorData({...calculatorData, weight: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Length (cm)
                    </label>
                    <input
                      type="number"
                      value={calculatorData.length}
                      onChange={(e) => setCalculatorData({...calculatorData, length: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      value={calculatorData.width}
                      onChange={(e) => setCalculatorData({...calculatorData, width: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={calculatorData.height}
                      onChange={(e) => setCalculatorData({...calculatorData, height: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateQuote}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculate Quote</span>
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quote Result</h4>
                {calculatedQuote ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${calculatedQuote.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Estimated shipping cost
                    </div>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Create Quote Request
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    Fill in the details and click calculate to get a quote
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showQuoteModal && <QuoteModal />}
      </div>
    </div>
  );
};
