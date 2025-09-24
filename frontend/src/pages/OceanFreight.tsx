import React from 'react';
import { Ship, Globe, Clock, Shield, ArrowRight, CheckCircle } from 'lucide-react';

interface OceanFreightProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const OceanFreight: React.FC<OceanFreightProps> = ({ onQuoteClick, onContactClick }) => {
  const features = [
    {
      icon: Ship,
      title: 'Full Container Load (FCL)',
      description: 'Dedicated containers for your cargo with complete control over shipping schedules and security.'
    },
    {
      icon: Globe,
      title: 'Less than Container Load (LCL)',
      description: 'Cost-effective solution for smaller shipments by sharing container space with other cargo.'
    },
    {
      icon: Clock,
      title: 'Express Ocean Services',
      description: 'Faster transit times on major trade lanes with priority vessel space and expedited handling.'
    },
    {
      icon: Shield,
      title: 'Cargo Insurance',
      description: 'Comprehensive coverage options to protect your valuable cargo throughout the journey.'
    }
  ];

  const routes = [
    { from: 'Asia', to: 'North America', transit: '12-18 days', frequency: 'Daily' },
    { from: 'Europe', to: 'North America', transit: '8-12 days', frequency: 'Daily' },
    { from: 'Asia', to: 'Europe', transit: '20-25 days', frequency: '3x weekly' },
    { from: 'Middle East', to: 'North America', transit: '18-22 days', frequency: '2x weekly' }
  ];

  const benefits = [
    'Door-to-door delivery options',
    'Real-time cargo tracking',
    'Customs clearance assistance',
    'Flexible scheduling options',
    'Competitive pricing',
    'Expert logistics support'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Ocean Freight Services
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Reliable, cost-effective ocean shipping solutions connecting global markets. 
                From FCL to LCL, we handle your cargo with precision and care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onQuoteClick}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Get Ocean Freight Quote
                </button>
                <button 
                  onClick={onContactClick}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Speak with Expert
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop" 
                alt="Container ship at sea"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Ocean Freight Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From small parcels to oversized cargo, our ocean freight services provide 
              flexible, reliable shipping options tailored to your business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <feature.icon className="h-12 w-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Routes Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Major Trade Routes
            </h2>
            <p className="text-xl text-gray-600">
              Regular sailings on the world's busiest shipping lanes
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Origin</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Destination</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transit Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {routes.map((route, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{route.from}</td>
                      <td className="px-6 py-4 text-gray-900">{route.to}</td>
                      <td className="px-6 py-4 text-gray-600">{route.transit}</td>
                      <td className="px-6 py-4 text-gray-600">{route.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our Ocean Freight?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                With decades of experience and a global network of partners, 
                we deliver your cargo safely, on time, and within budget.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop" 
                alt="Port operations"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Ship Your Cargo?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get a customized ocean freight quote in minutes. Our experts are standing by to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              Get Instant Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Ocean Freight Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
