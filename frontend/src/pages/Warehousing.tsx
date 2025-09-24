import React from 'react';
import { Warehouse, Package, Truck, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

interface WarehousingProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const Warehousing: React.FC<WarehousingProps> = ({ onQuoteClick, onContactClick }) => {
  const services = [
    {
      icon: Warehouse,
      title: 'Storage Solutions',
      description: 'Secure, climate-controlled warehousing facilities with flexible storage options for all cargo types.'
    },
    {
      icon: Package,
      title: 'Fulfillment Services',
      description: 'Complete order fulfillment including pick, pack, and ship services for e-commerce and retail.'
    },
    {
      icon: Truck,
      title: 'Distribution',
      description: 'Strategic distribution centers for efficient last-mile delivery and regional distribution.'
    },
    {
      icon: BarChart3,
      title: 'Inventory Management',
      description: 'Real-time inventory tracking and management with advanced WMS integration.'
    }
  ];

  const facilities = [
    { location: 'Los Angeles, CA', size: '500,000 sq ft', specialties: ['Import/Export', 'Cross-docking'] },
    { location: 'Chicago, IL', size: '750,000 sq ft', specialties: ['Food Grade', 'Temperature Control'] },
    { location: 'Atlanta, GA', size: '400,000 sq ft', specialties: ['E-commerce', 'Retail Distribution'] },
    { location: 'Newark, NJ', size: '300,000 sq ft', specialties: ['Port Services', 'Consolidation'] }
  ];

  const features = [
    'Climate-controlled environments',
    'Advanced security systems',
    'Real-time inventory tracking',
    'Cross-docking capabilities',
    'Pick and pack services',
    'Quality control inspections',
    'Customs bonded storage',
    'Hazmat certified facilities'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Warehousing & Distribution
              </h1>
              <p className="text-xl text-orange-100 mb-8">
                Strategic warehousing solutions across key markets. From storage to fulfillment, 
                we optimize your supply chain with state-of-the-art facilities and technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onQuoteClick}
                  className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Get Warehousing Quote
                </button>
                <button 
                  onClick={onContactClick}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                >
                  Tour Our Facilities
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&h=400&fit=crop" 
                alt="Modern warehouse facility"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Warehousing Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From simple storage to complex fulfillment operations, our warehousing 
              services are designed to scale with your business needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <service.icon className="h-12 w-12 text-orange-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Strategic Facility Locations
            </h2>
            <p className="text-xl text-gray-600">
              Strategically positioned warehouses across major logistics hubs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {facilities.map((facility, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{facility.location}</h3>
                <div className="text-orange-600 font-semibold mb-4">{facility.size}</div>
                <div className="space-y-2">
                  <div className="text-gray-700 font-medium">Specialties:</div>
                  <div className="flex flex-wrap gap-2">
                    {facility.specialties.map((specialty, idx) => (
                      <span key={idx} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Advanced Warehouse Features
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our facilities are equipped with the latest technology and security 
                systems to ensure your inventory is safe, secure, and accessible.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop" 
                alt="Warehouse operations"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Technology-Driven Operations
            </h2>
            <p className="text-xl text-gray-600">
              Advanced systems for maximum efficiency and visibility
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">WMS Integration</h3>
              <p className="text-gray-600">Advanced Warehouse Management System for real-time inventory control and optimization.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Automated Systems</h3>
              <p className="text-gray-600">Robotic picking systems and automated sorting for increased accuracy and speed.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fleet Management</h3>
              <p className="text-gray-600">Integrated transportation management for seamless distribution and delivery.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Storage?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Discover how our warehousing solutions can streamline your operations and reduce costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors inline-flex items-center justify-center"
            >
              Get Storage Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Schedule Facility Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
