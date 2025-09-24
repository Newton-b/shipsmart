import React from 'react';
import { Ship, Plane, FileCheck, Warehouse, Clock, Shield, Globe, TrendingUp } from 'lucide-react';

interface ServicesSectionProps {
  onQuoteClick: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onQuoteClick }) => {
  const services = [
    {
      icon: Ship,
      title: 'Ocean Freight',
      description: 'Cost-effective sea shipping with FCL and LCL options. Track your cargo with SKU-level visibility from origin to destination port.',
      features: ['FCL & LCL Services', 'Container Tracking', 'Port-to-Port Delivery', 'Competitive Rates'],
      color: 'blue'
    },
    {
      icon: Plane,
      title: 'Air Freight',
      description: 'Fast and reliable air cargo services for time-sensitive shipments. Charter services available for urgent deliveries.',
      features: ['Express Delivery', 'Charter Services', 'Temperature Control', 'Real-time Updates'],
      color: 'indigo'
    },
    {
      icon: FileCheck,
      title: 'Customs Clearance',
      description: 'Expert customs brokerage services to clear your goods quickly and minimize import duties with compliance expertise.',
      features: ['Duty Optimization', 'Documentation', 'Compliance Support', 'Fast Processing'],
      color: 'green'
    },
    {
      icon: Warehouse,
      title: 'Warehousing & Distribution',
      description: 'Secure storage and distribution services with inventory management and last-mile delivery solutions.',
      features: ['Inventory Management', 'Pick & Pack', 'Last-mile Delivery', 'Climate Control'],
      color: 'purple'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Real-time Visibility',
      description: 'Track every shipment with live updates and milestone notifications'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Insurance coverage and secure handling for all your valuable cargo'
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Extensive partner network covering 150+ countries worldwide'
    },
    {
      icon: TrendingUp,
      title: 'Cost Optimization',
      description: 'AI-powered route optimization to reduce costs and transit times'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Freight Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From factory floor to customer door, we provide end-to-end logistics solutions 
            with unparalleled visibility and control over your supply chain.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
              <div className={`w-12 h-12 rounded-lg ${getColorClasses(service.color)} flex items-center justify-center mb-4`}>
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={onQuoteClick}
                className="mt-4 text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Learn More →
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose ShipSmart?
            </h3>
            <p className="text-lg text-gray-600">
              Experience the difference with our technology-driven approach to freight forwarding
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Optimize Your Supply Chain?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get instant quotes, book shipments, and track your cargo with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onQuoteClick}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Free Quote
              </button>
              <button 
                onClick={onQuoteClick}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
