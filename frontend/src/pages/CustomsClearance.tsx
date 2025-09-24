import React from 'react';
import { FileText, Shield, Clock, Globe, ArrowRight, CheckCircle } from 'lucide-react';

interface CustomsClearanceProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const CustomsClearance: React.FC<CustomsClearanceProps> = ({ onQuoteClick, onContactClick }) => {
  const services = [
    {
      icon: FileText,
      title: 'Import/Export Documentation',
      description: 'Complete preparation and filing of all required customs documentation and declarations.'
    },
    {
      icon: Shield,
      title: 'Compliance Management',
      description: 'Ensure full compliance with international trade regulations and customs requirements.'
    },
    {
      icon: Clock,
      title: 'Expedited Processing',
      description: 'Fast-track customs clearance to minimize delays and reduce dwell time at ports.'
    },
    {
      icon: Globe,
      title: 'Global Expertise',
      description: 'Licensed customs brokers with expertise in regulations across 50+ countries.'
    }
  ];

  const documents = [
    'Commercial Invoice',
    'Packing List',
    'Bill of Lading/Airway Bill',
    'Certificate of Origin',
    'Import/Export Licenses',
    'Insurance Certificates',
    'Inspection Certificates',
    'Dangerous Goods Declarations'
  ];

  const benefits = [
    'Licensed customs brokers',
    'Real-time status updates',
    'Duty optimization strategies',
    'Risk assessment and mitigation',
    'Automated compliance checks',
    '24/7 customs support'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Customs Clearance Services
              </h1>
              <p className="text-xl text-green-100 mb-8">
                Navigate complex customs regulations with confidence. Our licensed brokers 
                ensure smooth, compliant clearance for all your international shipments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onQuoteClick}
                  className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Get Customs Quote
                </button>
                <button 
                  onClick={onContactClick}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                >
                  Speak with Broker
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop" 
                alt="Customs documentation"
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
              Complete Customs Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From documentation to duty optimization, we handle every aspect 
              of customs clearance to keep your cargo moving.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <service.icon className="h-12 w-12 text-green-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documentation Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Required Documentation
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our experts handle all necessary documentation to ensure 
                smooth customs clearance and regulatory compliance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop" 
                alt="Customs documentation process"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop" 
                alt="Customs broker at work"
                className="rounded-xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our Customs Services?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                With decades of experience and deep regulatory knowledge, 
                we ensure your shipments clear customs efficiently and cost-effectively.
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
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Customs Process
            </h2>
            <p className="text-xl text-gray-600">
              Streamlined workflow for efficient customs clearance
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Review</h3>
              <p className="text-gray-600">Comprehensive review of all shipping documents</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Classification</h3>
              <p className="text-gray-600">Accurate commodity classification and duty calculation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Filing</h3>
              <p className="text-gray-600">Electronic filing with customs authorities</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Release</h3>
              <p className="text-gray-600">Cargo release and delivery coordination</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Need Customs Clearance?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Let our licensed brokers handle your customs requirements. Fast, compliant, reliable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center justify-center"
            >
              Get Customs Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Contact Customs Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
