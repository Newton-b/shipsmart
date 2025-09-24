import React from 'react';
import { MapPin, Clock, DollarSign, Users, Heart, Zap, ArrowRight, CheckCircle } from 'lucide-react';

interface CareersProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const Careers: React.FC<CareersProps> = ({ onQuoteClick, onContactClick }) => {
  const openPositions = [
    {
      title: 'Senior Logistics Coordinator',
      department: 'Operations',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      salary: '$65,000 - $85,000',
      description: 'Manage complex shipments and coordinate with international partners to ensure seamless delivery.'
    },
    {
      title: 'Customer Success Manager',
      department: 'Sales',
      location: 'Chicago, IL',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
      description: 'Build relationships with key accounts and drive customer satisfaction and retention.'
    },
    {
      title: 'Software Engineer',
      department: 'Technology',
      location: 'Remote',
      type: 'Full-time',
      salary: '$90,000 - $120,000',
      description: 'Develop and maintain our logistics platform and tracking systems.'
    },
    {
      title: 'Customs Specialist',
      department: 'Compliance',
      location: 'Newark, NJ',
      type: 'Full-time',
      salary: '$55,000 - $70,000',
      description: 'Handle customs clearance processes and ensure regulatory compliance.'
    },
    {
      title: 'Business Development Representative',
      department: 'Sales',
      location: 'Atlanta, GA',
      type: 'Full-time',
      salary: '$50,000 - $65,000 + Commission',
      description: 'Generate new business opportunities and expand our client base.'
    },
    {
      title: 'Warehouse Operations Manager',
      department: 'Operations',
      location: 'Dallas, TX',
      type: 'Full-time',
      salary: '$60,000 - $80,000',
      description: 'Oversee warehouse operations and optimize fulfillment processes.'
    }
  ];

  const benefits = [
    'Comprehensive health, dental, and vision insurance',
    'Flexible work arrangements and remote options',
    'Professional development and training programs',
    'Competitive salary and performance bonuses',
    '401(k) with company matching',
    'Paid time off and holidays',
    'Employee wellness programs',
    'Career advancement opportunities'
  ];

  const culture = [
    {
      icon: Users,
      title: 'Collaborative Environment',
      description: 'Work with diverse teams across the globe to solve complex logistics challenges.'
    },
    {
      icon: Zap,
      title: 'Innovation Focus',
      description: 'Drive technological advancement in the freight forwarding industry.'
    },
    {
      icon: Heart,
      title: 'Work-Life Balance',
      description: 'Flexible schedules and remote work options to support your lifestyle.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
              Build your career with a leading freight forwarding company that values 
              innovation, collaboration, and professional growth in the global logistics industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                View Open Positions
              </button>
              <button 
                onClick={onContactClick}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                Contact HR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Culture Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Culture
            </h2>
            <p className="text-xl text-gray-600">
              What makes ShipSmart a great place to work
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {culture.map((item, index) => (
              <div key={index} className="text-center">
                <item.icon className="h-16 w-16 text-green-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Comprehensive Benefits
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We believe in taking care of our team members with competitive 
                compensation and comprehensive benefits that support your well-being.
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
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                alt="Team collaboration"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions Section */}
      <div id="open-positions" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-gray-600">
              Find your next opportunity with ShipSmart
            </p>
          </div>

          <div className="grid gap-6">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {position.department}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {position.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {position.type}
                      </div>
                      <div className="flex items-center text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {position.salary}
                      </div>
                    </div>
                    <p className="text-gray-600">{position.description}</p>
                  </div>
                  <div className="mt-6 lg:mt-0 lg:ml-8">
                    <button 
                      onClick={onContactClick}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center"
                    >
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Process Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Application Process
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to join our team
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply</h3>
              <p className="text-gray-600">Submit your application and resume for the position that interests you.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Review</h3>
              <p className="text-gray-600">Our HR team will review your application and contact qualified candidates.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Interview</h3>
              <p className="text-gray-600">Participate in interviews with hiring managers and team members.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Join</h3>
              <p className="text-gray-600">Welcome to the team! Begin your onboarding and start making an impact.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-green-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join a company that's shaping the future of global logistics and build a rewarding career with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onContactClick}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center justify-center"
            >
              Apply Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onQuoteClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Learn More About Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
