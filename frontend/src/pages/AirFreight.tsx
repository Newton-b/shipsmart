import React from 'react';
import { Plane, Zap, Shield, Globe, ArrowRight, CheckCircle } from 'lucide-react';

interface AirFreightProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const AirFreight: React.FC<AirFreightProps> = ({ onQuoteClick, onContactClick }) => {
  const features = [
    {
      icon: Zap,
      title: 'Express Air Freight',
      description: 'Fastest delivery times for urgent shipments with priority handling and expedited customs clearance.'
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Access to 500+ destinations worldwide through our extensive airline partnerships and cargo networks.'
    },
    {
      icon: Shield,
      title: 'Secure Handling',
      description: 'Temperature-controlled and secure cargo handling for sensitive, valuable, or perishable goods.'
    },
    {
      icon: Plane,
      title: 'Charter Services',
      description: 'Dedicated aircraft charter for oversized cargo, urgent deliveries, or specialized transport needs.'
    }
  ];

  const services = [
    { service: 'Standard Air Freight', transit: '3-5 days', description: 'Cost-effective air cargo for regular shipments' },
    { service: 'Express Air Freight', transit: '1-2 days', description: 'Premium service for urgent deliveries' },
    { service: 'Next Flight Out', transit: '24-48 hours', description: 'Emergency shipments on the next available flight' },
    { service: 'Charter Flights', transit: 'On-demand', description: 'Dedicated aircraft for special cargo requirements' }
  ];

  const industries = [
    'Automotive Parts',
    'Electronics & Technology',
    'Pharmaceuticals',
    'Fashion & Apparel',
    'Perishable Goods',
    'High-Value Cargo'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Air Freight Services
              </h1>
              <p className="text-xl text-indigo-100 mb-8">
                Fast, reliable air cargo solutions for time-sensitive shipments. 
                Connect your business to global markets with speed and precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onQuoteClick}
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                >
                  Get Air Freight Quote
                </button>
                <button 
                  onClick={onContactClick}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
                >
                  Speak with Expert
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop" 
                alt="Cargo aircraft loading"
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
              Comprehensive Air Freight Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From urgent documents to heavy machinery, our air freight services 
              deliver your cargo quickly and safely to destinations worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <feature.icon className="h-12 w-12 text-indigo-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Air Freight Service Options
            </h2>
            <p className="text-xl text-gray-600">
              Choose the right service level for your timeline and budget
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Service Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transit Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {services.map((service, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">{service.service}</td>
                      <td className="px-6 py-4 text-indigo-600 font-semibold">{service.transit}</td>
                      <td className="px-6 py-4 text-gray-600">{service.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Industries Section */}
      <div className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Industries We Serve
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our specialized air freight solutions cater to diverse industries 
                with unique shipping requirements and time-sensitive needs.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {industries.map((industry, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{industry}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop" 
                alt="Airport cargo operations"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Air Freight by the Numbers
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">500+</div>
              <div className="text-gray-300">Global Destinations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">24/7</div>
              <div className="text-gray-300">Operations Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">99.5%</div>
              <div className="text-gray-300">On-Time Performance</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">48hrs</div>
              <div className="text-gray-300">Average Transit Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Need It There Fast?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Get instant air freight quotes and book your shipment today. Our team is ready 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors inline-flex items-center justify-center"
            >
              Get Instant Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Contact Air Freight Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
