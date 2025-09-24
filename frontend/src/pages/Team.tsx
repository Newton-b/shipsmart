import React from 'react';
import { Mail, Linkedin, Award, Users, Globe, ArrowRight } from 'lucide-react';

interface TeamProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const Team: React.FC<TeamProps> = ({ onQuoteClick, onContactClick }) => {
  const leadership = [
    {
      name: 'Sarah Chen',
      position: 'Chief Executive Officer',
      bio: 'With over 20 years in global logistics, Sarah leads ShipSmart\'s vision of transforming freight forwarding through technology and innovation.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      email: 'sarah.chen@shipsmartlogistics.com',
      linkedin: '#'
    },
    {
      name: 'Michael Rodriguez',
      position: 'Chief Operating Officer',
      bio: 'Michael oversees global operations, ensuring seamless service delivery across our international network of partners and facilities.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      email: 'michael.rodriguez@shipsmartlogistics.com',
      linkedin: '#'
    },
    {
      name: 'Jennifer Park',
      position: 'Chief Technology Officer',
      bio: 'Jennifer drives our digital transformation initiatives, developing cutting-edge solutions for supply chain visibility and automation.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      email: 'jennifer.park@shipsmartlogistics.com',
      linkedin: '#'
    }
  ];

  const departments = [
    {
      name: 'Operations Team',
      description: 'Expert logistics professionals managing daily operations across all service lines.',
      count: 45,
      icon: Users
    },
    {
      name: 'Customer Success',
      description: 'Dedicated account managers providing personalized service and support.',
      count: 18,
      icon: Award
    },
    {
      name: 'Global Network',
      description: 'International partners and agents extending our reach worldwide.',
      count: 120,
      icon: Globe
    }
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'We strive for operational excellence in every shipment and customer interaction.'
    },
    {
      title: 'Innovation',
      description: 'Continuously improving our services through technology and creative solutions.'
    },
    {
      title: 'Integrity',
      description: 'Building trust through transparent communication and reliable service delivery.'
    },
    {
      title: 'Partnership',
      description: 'Creating long-term relationships with clients, suppliers, and team members.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Meet Our Team
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Our experienced professionals are dedicated to delivering exceptional 
              logistics solutions and building lasting partnerships with our clients worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onContactClick}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Contact Our Team
              </button>
              <button 
                onClick={onQuoteClick}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Get Quote
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600">
              Experienced leaders driving innovation in global logistics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={leader.image} 
                  alt={leader.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                  <div className="text-blue-600 font-semibold mb-4">{leader.position}</div>
                  <p className="text-gray-600 mb-6">{leader.bio}</p>
                  <div className="flex space-x-4">
                    <a 
                      href={`mailto:${leader.email}`}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                    <a 
                      href={leader.linkedin}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departments Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Departments
            </h2>
            <p className="text-xl text-gray-600">
              Specialized teams working together to deliver exceptional service
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg text-center">
                <dept.icon className="h-12 w-12 text-blue-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">{dept.name}</h3>
                <p className="text-gray-600 mb-6">{dept.description}</p>
                <div className="text-3xl font-bold text-blue-600">{dept.count}+</div>
                <div className="text-gray-500">Team Members</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide our team and shape our culture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {value.title.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Join Us Section */}
      <div className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Join Our Growing Team
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We're always looking for talented professionals to join our mission of 
            transforming global logistics through innovation and excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.open('#careers', '_self')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              View Open Positions
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              Contact HR
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Work with Our Team?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Experience the difference that dedicated professionals make in your supply chain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
