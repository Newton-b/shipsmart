import React from 'react';
import { ArrowRight, Clock, DollarSign, TrendingUp, CheckCircle, Building2, Factory, Zap } from 'lucide-react';

interface CaseStudiesProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const CaseStudies: React.FC<CaseStudiesProps> = ({ onQuoteClick, onContactClick }) => {
  const featuredCase = {
    title: 'Global Electronics Manufacturer Reduces Costs by 40%',
    client: 'TechGlobal Industries',
    industry: 'Electronics Manufacturing',
    challenge: 'Complex multi-modal shipping requirements across 15 countries with tight delivery windows',
    solution: 'Implemented integrated ocean-air freight solution with real-time tracking and customs pre-clearance',
    results: [
      '40% reduction in total logistics costs',
      '95% on-time delivery improvement',
      '60% faster customs clearance',
      '$2.3M annual savings achieved'
    ],
    image: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=600&h=400&fit=crop',
    duration: '18 months',
    savings: '$2.3M'
  };

  const caseStudies = [
    {
      title: 'Automotive Parts Distribution Optimization',
      client: 'AutoParts Pro',
      industry: 'Automotive',
      challenge: 'Streamline just-in-time delivery for 200+ manufacturing plants',
      solution: 'Dedicated ground transportation network with predictive analytics',
      results: '30% faster delivery, 25% cost reduction',
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=250&fit=crop',
      icon: Building2
    },
    {
      title: 'Pharmaceutical Cold Chain Excellence',
      client: 'MedLife Pharmaceuticals',
      industry: 'Healthcare',
      challenge: 'Temperature-sensitive drug distribution across multiple continents',
      solution: 'Specialized cold chain logistics with continuous monitoring',
      results: '99.9% temperature compliance, zero product loss',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop',
      icon: Factory
    },
    {
      title: 'E-commerce Fulfillment Scaling',
      client: 'RetailMax Online',
      industry: 'E-commerce',
      challenge: 'Handle 500% growth in order volume during peak season',
      solution: 'Flexible warehousing with automated fulfillment systems',
      results: 'Processed 2M+ orders with 99.5% accuracy',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=250&fit=crop',
      icon: Zap
    },
    {
      title: 'Construction Equipment Project Cargo',
      client: 'BuildCorp International',
      industry: 'Construction',
      challenge: 'Transport oversized mining equipment to remote locations',
      solution: 'Multi-modal project cargo with specialized equipment',
      results: 'On-time delivery to 12 remote sites worldwide',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop',
      icon: Building2
    },
    {
      title: 'Fashion Retail Seasonal Logistics',
      client: 'StyleForward Fashion',
      industry: 'Retail',
      challenge: 'Coordinate global fashion week deliveries across 50 cities',
      solution: 'Express air freight with white glove delivery services',
      results: '100% on-time delivery for all fashion shows',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
      icon: Factory
    },
    {
      title: 'Food & Beverage Supply Chain',
      client: 'FreshFoods Global',
      industry: 'Food & Beverage',
      challenge: 'Maintain freshness across international distribution network',
      solution: 'Integrated cold chain with IoT monitoring and tracking',
      results: '15% reduction in spoilage, improved shelf life',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop',
      icon: Zap
    }
  ];

  const industries = [
    { name: 'Manufacturing', count: 45, growth: '+12%' },
    { name: 'Healthcare', count: 28, growth: '+18%' },
    { name: 'E-commerce', count: 67, growth: '+35%' },
    { name: 'Automotive', count: 32, growth: '+8%' },
    { name: 'Technology', count: 41, growth: '+22%' },
    { name: 'Retail', count: 38, growth: '+15%' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Success Stories
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Discover how we've helped businesses across industries optimize their 
              supply chains, reduce costs, and achieve their logistics goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onQuoteClick}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Start Your Success Story
              </button>
              <button 
                onClick={onContactClick}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Discuss Your Needs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Case Study */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative">
                <img 
                  src={featuredCase.image} 
                  alt={featuredCase.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured Case
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <div className="mb-4">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {featuredCase.industry}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {featuredCase.title}
                </h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Challenge:</h4>
                    <p className="text-gray-600">{featuredCase.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Solution:</h4>
                    <p className="text-gray-600">{featuredCase.solution}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{featuredCase.savings}</div>
                    <div className="text-gray-500 text-sm">Annual Savings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{featuredCase.duration}</div>
                    <div className="text-gray-500 text-sm">Project Duration</div>
                  </div>
                </div>
                <button 
                  onClick={onContactClick}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center"
                >
                  Read Full Case Study
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Highlights */}
      <div className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Results Achieved
            </h2>
            <p className="text-xl text-gray-600">
              Measurable outcomes from our featured case study
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCase.results.map((result, index) => (
              <div key={index} className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium">{result}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              More Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Explore how we've delivered results across various industries
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={study.image} 
                  alt={study.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <study.icon className="h-6 w-6 text-indigo-600 mr-2" />
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {study.industry}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {study.title}
                  </h3>
                  <div className="space-y-3 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-700 text-sm">Challenge:</h5>
                      <p className="text-gray-600 text-sm">{study.challenge}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 text-sm">Solution:</h5>
                      <p className="text-gray-600 text-sm">{study.solution}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-indigo-600 font-semibold mb-2">Results:</div>
                    <p className="text-gray-700 text-sm">{study.results}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industry Statistics */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industries We Serve
            </h2>
            <p className="text-xl text-gray-600">
              Success across diverse sectors and markets
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{industry.name}</h3>
                <div className="text-3xl font-bold text-indigo-600 mb-2">{industry.count}</div>
                <div className="text-gray-500 mb-3">Active Projects</div>
                <div className="flex items-center justify-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="font-semibold">{industry.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Success Story?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of satisfied clients who have transformed their logistics operations with ShipSmart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors inline-flex items-center justify-center"
            >
              Get Your Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
