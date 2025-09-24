import React from 'react';
import { Construction, Settings, Globe, Shield, ArrowRight, CheckCircle } from 'lucide-react';

interface ProjectCargoProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const ProjectCargo: React.FC<ProjectCargoProps> = ({ onQuoteClick, onContactClick }) => {
  const services = [
    {
      icon: Construction,
      title: 'Heavy Lift Operations',
      description: 'Specialized equipment and expertise for oversized and overweight cargo transportation.'
    },
    {
      icon: Settings,
      title: 'Engineering Solutions',
      description: 'Custom transport solutions with detailed engineering analysis and route planning.'
    },
    {
      icon: Globe,
      title: 'Multimodal Transport',
      description: 'Seamless integration of ocean, air, and ground transportation for complex projects.'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Comprehensive insurance coverage and risk assessment for high-value project cargo.'
    }
  ];

  const industries = [
    { name: 'Oil & Gas', projects: 'Refineries, Pipelines, Offshore Platforms' },
    { name: 'Power Generation', projects: 'Wind Turbines, Transformers, Generators' },
    { name: 'Mining', projects: 'Heavy Machinery, Processing Equipment' },
    { name: 'Construction', projects: 'Cranes, Prefab Structures, Steel Components' },
    { name: 'Manufacturing', projects: 'Production Lines, Industrial Equipment' },
    { name: 'Infrastructure', projects: 'Bridge Components, Tunnel Segments' }
  ];

  const capabilities = [
    'Up to 1,000 tons capacity',
    'Dimensional cargo handling',
    'Route surveys and permits',
    'Custom packaging solutions',
    'Specialized lifting equipment',
    'Multi-modal coordination',
    'Project timeline management',
    'Regulatory compliance'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Project Cargo Solutions
              </h1>
              <p className="text-xl text-emerald-100 mb-8">
                Specialized transportation for oversized, overweight, and complex cargo. 
                From engineering to delivery, we handle your most challenging shipments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onQuoteClick}
                  className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
                >
                  Get Project Quote
                </button>
                <button 
                  onClick={onContactClick}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
                >
                  Consult Specialists
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop" 
                alt="Heavy machinery transport"
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
              Specialized Project Cargo Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complex cargo requires specialized expertise. Our project cargo team 
              provides end-to-end solutions for your most challenging shipments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <service.icon className="h-12 w-12 text-emerald-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industries Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industries We Serve
            </h2>
            <p className="text-xl text-gray-600">
              Specialized project cargo solutions across key industries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{industry.name}</h3>
                <p className="text-gray-600">{industry.projects}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Project Cargo Capabilities
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our specialized equipment and expertise enable us to handle the most 
                complex project cargo requirements with precision and safety.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop" 
                alt="Industrial equipment"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Project Cargo Process
            </h2>
            <p className="text-xl text-gray-600">
              Systematic approach to complex cargo transportation
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Assessment</h3>
              <p className="text-gray-600">Detailed cargo analysis, route survey, and feasibility study.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Planning</h3>
              <p className="text-gray-600">Custom transport solution design and permit acquisition.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Execution</h3>
              <p className="text-gray-600">Specialized equipment deployment and careful transportation.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Delivery</h3>
              <p className="text-gray-600">Safe installation and project completion support.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Project Cargo by the Numbers
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">500+</div>
              <div className="text-gray-300">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">1,000</div>
              <div className="text-gray-300">Max Tons Capacity</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">50+</div>
              <div className="text-gray-300">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">99.8%</div>
              <div className="text-gray-300">On-Time Delivery</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-emerald-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready for Your Next Project?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Let our project cargo specialists design a custom solution for your complex transportation needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors inline-flex items-center justify-center"
            >
              Get Project Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              Speak with Specialists
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
