import React from 'react';
import { Truck, MapPin, Clock, Shield, ArrowRight, CheckCircle } from 'lucide-react';

interface GroundTransportationProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const GroundTransportation: React.FC<GroundTransportationProps> = ({ onQuoteClick, onContactClick }) => {
  const services = [
    {
      icon: Truck,
      title: 'Full Truckload (FTL)',
      description: 'Dedicated truck capacity for large shipments with direct delivery and maximum security.'
    },
    {
      icon: MapPin,
      title: 'Less Than Truckload (LTL)',
      description: 'Cost-effective solution for smaller shipments by sharing truck space with other cargo.'
    },
    {
      icon: Clock,
      title: 'Expedited Delivery',
      description: 'Time-critical ground transportation with guaranteed delivery windows and real-time tracking.'
    },
    {
      icon: Shield,
      title: 'Specialized Transport',
      description: 'Temperature-controlled, hazmat, and oversized cargo transportation with specialized equipment.'
    }
  ];

  const coverage = [
    { region: 'North America', routes: '48 States + Canada', transit: '1-5 days' },
    { region: 'Cross-Border', routes: 'US-Mexico-Canada', transit: '2-7 days' },
    { region: 'Regional Express', routes: 'Major Metro Areas', transit: 'Same/Next Day' },
    { region: 'Last Mile', routes: 'Urban & Rural', transit: 'Same Day' }
  ];

  const features = [
    'Real-time GPS tracking',
    'Temperature-controlled vehicles',
    'Hazmat certified drivers',
    'White glove delivery service',
    'Liftgate and inside delivery',
    'Appointment scheduling',
    'Proof of delivery with photos',
    '24/7 dispatch support'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Ground Transportation
              </h1>
              <p className="text-xl text-purple-100 mb-8">
                Reliable ground transportation across North America. From FTL to LTL, 
                we deliver your cargo safely and on time with our extensive network.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onQuoteClick}
                  className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
                >
                  Get Ground Quote
                </button>
                <button 
                  onClick={onContactClick}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
                >
                  Track Shipment
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&h=400&fit=crop" 
                alt="Truck on highway"
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
              Complete Ground Transportation Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From single pallets to full truckloads, our ground transportation 
              services provide flexible, reliable delivery options across North America.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <service.icon className="h-12 w-12 text-purple-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Extensive Coverage Network
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive ground transportation across North America
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Coverage Area</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Routes</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transit Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coverage.map((area, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">{area.region}</td>
                      <td className="px-6 py-4 text-gray-600">{area.routes}</td>
                      <td className="px-6 py-4 text-purple-600 font-semibold">{area.transit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Advanced Transportation Features
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our ground transportation services include advanced tracking, 
                specialized equipment, and professional drivers to ensure safe delivery.
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
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop" 
                alt="Truck loading dock"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Specialized Equipment Fleet
            </h2>
            <p className="text-xl text-gray-600">
              Modern fleet equipped for all cargo types and requirements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dry Van Trailers</h3>
              <p className="text-gray-600">Standard 53' trailers for general freight with up to 80,000 lbs capacity.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Refrigerated Units</h3>
              <p className="text-gray-600">Temperature-controlled trailers for perishable goods and pharmaceuticals.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Flatbed Trailers</h3>
              <p className="text-gray-600">Open deck trailers for oversized cargo, construction materials, and machinery.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Move Your Freight?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Get competitive ground transportation rates and reliable delivery across North America.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors inline-flex items-center justify-center"
            >
              Get Ground Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Contact Transportation Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
