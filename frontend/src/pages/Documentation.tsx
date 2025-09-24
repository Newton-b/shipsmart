import React from 'react';
import { Book, Download, Search, FileText, Globe, Truck, Plane, Ship, ArrowRight, ExternalLink } from 'lucide-react';

interface DocumentationProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const Documentation: React.FC<DocumentationProps> = ({ onQuoteClick, onContactClick }) => {
  const categories = [
    {
      icon: Ship,
      title: 'Ocean Freight Guides',
      description: 'Comprehensive guides for ocean shipping, container types, and port procedures.',
      documents: 12,
      color: 'blue'
    },
    {
      icon: Plane,
      title: 'Air Freight Resources',
      description: 'Air cargo documentation, dangerous goods regulations, and airport procedures.',
      documents: 8,
      color: 'indigo'
    },
    {
      icon: Truck,
      title: 'Ground Transportation',
      description: 'Trucking regulations, cross-border procedures, and domestic shipping guides.',
      documents: 15,
      color: 'purple'
    },
    {
      icon: Globe,
      title: 'Customs & Compliance',
      description: 'Import/export procedures, customs forms, and regulatory compliance guides.',
      documents: 20,
      color: 'green'
    }
  ];

  const popularDocs = [
    {
      title: 'International Shipping Guide 2024',
      description: 'Complete guide to international shipping procedures, documentation, and best practices.',
      type: 'PDF Guide',
      pages: 45,
      downloads: 2847,
      updated: '2024-01-15'
    },
    {
      title: 'Customs Documentation Checklist',
      description: 'Essential checklist for customs clearance documentation and requirements.',
      type: 'Checklist',
      pages: 8,
      downloads: 1923,
      updated: '2024-01-10'
    },
    {
      title: 'Dangerous Goods Shipping Manual',
      description: 'Comprehensive manual for shipping hazardous materials by air, ocean, and ground.',
      type: 'Manual',
      pages: 67,
      downloads: 1456,
      updated: '2024-01-08'
    },
    {
      title: 'Incoterms 2020 Reference Guide',
      description: 'Official reference guide for International Commercial Terms and their applications.',
      type: 'Reference',
      pages: 32,
      downloads: 3201,
      updated: '2023-12-20'
    }
  ];

  const quickLinks = [
    { title: 'Shipping Calculator', description: 'Calculate shipping costs and transit times', icon: FileText },
    { title: 'Track Shipment', description: 'Real-time tracking for all your shipments', icon: Search },
    { title: 'Forms & Templates', description: 'Download shipping forms and documentation templates', icon: Download },
    { title: 'API Documentation', description: 'Integration guides and API references', icon: Book }
  ];

  const tutorials = [
    {
      title: 'How to Prepare Ocean Freight Shipments',
      duration: '12 min read',
      difficulty: 'Beginner',
      topics: ['Container Selection', 'Documentation', 'Packaging']
    },
    {
      title: 'Air Freight Best Practices',
      duration: '8 min read',
      difficulty: 'Intermediate',
      topics: ['Weight Limits', 'Dangerous Goods', 'Express Services']
    },
    {
      title: 'Customs Clearance Process',
      duration: '15 min read',
      difficulty: 'Advanced',
      topics: ['Import Procedures', 'Duty Calculation', 'Compliance']
    },
    {
      title: 'Project Cargo Planning',
      duration: '20 min read',
      difficulty: 'Expert',
      topics: ['Route Planning', 'Permits', 'Special Equipment']
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      green: 'bg-green-50 text-green-600 border-green-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Documentation Center
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Access comprehensive shipping guides, documentation templates, and resources 
              to streamline your logistics operations and ensure compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="relative max-w-md mx-auto sm:mx-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                onClick={onContactClick}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <link.icon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                <p className="text-gray-600 text-sm">{link.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documentation Categories */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Documentation Categories
            </h2>
            <p className="text-xl text-gray-600">
              Organized resources for all your shipping needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div key={index} className={`rounded-xl p-8 border-2 hover:shadow-lg transition-shadow cursor-pointer ${getColorClasses(category.color)}`}>
                <category.icon className="h-12 w-12 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">{category.title}</h3>
                <p className="text-gray-600 mb-6">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.documents} Documents</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Documents */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Documents
            </h2>
            <p className="text-xl text-gray-600">
              Most downloaded guides and resources
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {popularDocs.map((doc, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{doc.title}</h3>
                    <p className="text-gray-600 mb-4">{doc.description}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600 ml-4" />
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                  <span>{doc.type}</span>
                  <span>{doc.pages} pages</span>
                  <span>{doc.downloads.toLocaleString()} downloads</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Updated {doc.updated}</span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tutorials */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Step-by-Step Tutorials
            </h2>
            <p className="text-xl text-gray-600">
              Learn shipping processes with our detailed guides
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tutorials.map((tutorial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    tutorial.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                    tutorial.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    tutorial.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tutorial.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{tutorial.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{tutorial.duration}</p>
                <div className="space-y-2 mb-6">
                  {tutorial.topics.map((topic, idx) => (
                    <span key={idx} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2">
                      {topic}
                    </span>
                  ))}
                </div>
                <button className="w-full bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center justify-center">
                  Read Tutorial
                  <ExternalLink className="h-4 w-4 ml-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Need Additional Support?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Can't find what you're looking for? Our support team is here to help with 
            any questions about shipping procedures and documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onContactClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              Contact Support
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onQuoteClick}
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              Request Custom Guide
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Ship Smarter?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Use our comprehensive documentation to streamline your shipping processes and ensure compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              Get Shipping Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Speak with Expert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
