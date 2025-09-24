import React from 'react';
import { Globe, Users, Award, ArrowRight, CheckCircle, Star, MapPin } from 'lucide-react';

interface PartnersProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const Partners: React.FC<PartnersProps> = ({ onQuoteClick, onContactClick }) => {
  const keyPartners = [
    {
      name: 'Global Logistics Alliance',
      type: 'Strategic Partner',
      region: 'Worldwide',
      services: 'Ocean & Air Freight',
      description: 'Premier global network providing comprehensive logistics solutions across 150+ countries.',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop',
      established: '2019'
    },
    {
      name: 'European Freight Network',
      type: 'Regional Partner',
      region: 'Europe',
      services: 'Ground Transportation',
      description: 'Leading European ground transportation network with extensive coverage across EU countries.',
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=100&fit=crop',
      established: '2020'
    },
    {
      name: 'Asia Pacific Logistics',
      type: 'Regional Partner',
      region: 'Asia Pacific',
      services: 'Warehousing & Distribution',
      description: 'Comprehensive warehousing and distribution services across major Asian markets.',
      logo: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=200&h=100&fit=crop',
      established: '2021'
    },
    {
      name: 'Americas Cargo Solutions',
      type: 'Regional Partner',
      region: 'Americas',
      services: 'Project Cargo',
      description: 'Specialized project cargo and heavy lift solutions throughout North and South America.',
      logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=100&fit=crop',
      established: '2018'
    }
  ];

  const partnerTypes = [
    {
      icon: Globe,
      title: 'Global Network Partners',
      count: '150+',
      description: 'Worldwide coverage through strategic partnerships with leading logistics providers.'
    },
    {
      icon: Users,
      title: 'Technology Partners',
      count: '25+',
      description: 'Integration with cutting-edge logistics technology and software solutions.'
    },
    {
      icon: Award,
      title: 'Certified Agents',
      count: '300+',
      description: 'Certified local agents providing on-ground support and expertise.'
    },
    {
      icon: Users,
      title: 'Service Providers',
      count: '500+',
      description: 'Specialized service providers for customs, warehousing, and transportation.'
    }
  ];

  const benefits = [
    'Extended global reach and coverage',
    'Local expertise in international markets',
    'Competitive pricing through network leverage',
    'Seamless multi-modal transportation',
    'Enhanced service reliability',
    'Cultural and regulatory knowledge',
    'Reduced transit times and costs',
    '24/7 global support coverage'
  ];

  const regions = [
    { name: 'North America', partners: 45, countries: 3 },
    { name: 'Europe', partners: 78, countries: 27 },
    { name: 'Asia Pacific', partners: 92, countries: 18 },
    { name: 'Middle East & Africa', partners: 34, countries: 22 },
    { name: 'Latin America', partners: 28, countries: 15 },
    { name: 'Oceania', partners: 8, countries: 4 }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Global Partner Network
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
              Our extensive network of trusted partners enables us to deliver 
              exceptional logistics services worldwide with local expertise and global reach.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onContactClick}
                className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
              >
                Become a Partner
              </button>
              <button 
                onClick={onQuoteClick}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-colors"
              >
                Leverage Our Network
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Types */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Partner Ecosystem
            </h2>
            <p className="text-xl text-gray-600">
              Diverse partnerships that enhance our service capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnerTypes.map((type, index) => (
              <div key={index} className="text-center">
                <type.icon className="h-16 w-16 text-teal-600 mx-auto mb-6" />
                <div className="text-3xl font-bold text-teal-600 mb-2">{type.count}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{type.title}</h3>
                <p className="text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Partners */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Strategic Partners
            </h2>
            <p className="text-xl text-gray-600">
              Leading partnerships that drive our global capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {keyPartners.map((partner, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded">{partner.type}</span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {partner.region}
                      </span>
                    </div>
                  </div>
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="w-16 h-8 object-cover rounded"
                  />
                </div>
                <p className="text-gray-600 mb-4">{partner.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <strong>Services:</strong> {partner.services}
                  </div>
                  <div className="text-sm text-gray-500">
                    <strong>Since:</strong> {partner.established}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Partnership Benefits
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our global partner network provides you with unmatched advantages 
                in international logistics and supply chain management.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop" 
                alt="Global partnership"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Regional Coverage */}
      <div className="py-20 bg-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Global Coverage
            </h2>
            <p className="text-xl text-gray-600">
              Partner network spanning across all major regions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regions.map((region, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{region.name}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-teal-600">{region.partners}</div>
                    <div className="text-gray-500 text-sm">Active Partners</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600">{region.countries}</div>
                    <div className="text-gray-500 text-sm">Countries Covered</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partnership Program */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Join Our Partner Network
            </h2>
            <p className="text-xl text-gray-600">
              Become part of a global logistics network that delivers excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply</h3>
              <p className="text-gray-600">Submit your partnership application with company credentials and service capabilities.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Evaluate</h3>
              <p className="text-gray-600">Our team evaluates your qualifications, certifications, and service standards.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Partner</h3>
              <p className="text-gray-600">Begin collaboration with access to our global network and support systems.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Partners Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">
                "Partnering with ShipSmart has significantly expanded our service capabilities. 
                Their global network and technology integration have been game-changers for our business."
              </p>
              <div className="text-sm">
                <div className="font-semibold">Maria Santos</div>
                <div className="text-gray-400">CEO, European Freight Network</div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">
                "The partnership program provides excellent support and resources. 
                We've seen a 40% increase in business volume since joining their network."
              </p>
              <div className="text-sm">
                <div className="font-semibold">James Chen</div>
                <div className="text-gray-400">Director, Asia Pacific Logistics</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-teal-600 to-cyan-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Partner with Us?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join our global network and expand your logistics capabilities with trusted partnerships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onContactClick}
              className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors inline-flex items-center justify-center"
            >
              Apply for Partnership
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onQuoteClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
