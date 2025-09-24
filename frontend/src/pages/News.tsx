import React from 'react';
import { Calendar, User, ArrowRight, TrendingUp, Globe, Award } from 'lucide-react';

interface NewsProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
}

export const News: React.FC<NewsProps> = ({ onQuoteClick, onContactClick }) => {
  const featuredNews = {
    title: 'ShipSmart Expands Operations with New West Coast Facility',
    excerpt: 'Our new 750,000 sq ft facility in Seattle enhances our Pacific Northwest coverage and reduces transit times for customers.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop',
    date: '2024-01-15',
    author: 'Sarah Chen',
    category: 'Company News'
  };

  const newsArticles = [
    {
      title: 'Q4 2023 Performance: Record-Breaking Year for ShipSmart',
      excerpt: 'We achieved 35% growth in shipment volume and expanded our global network to 120+ countries.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      date: '2024-01-10',
      author: 'Michael Rodriguez',
      category: 'Company News'
    },
    {
      title: 'New AI-Powered Tracking System Launches',
      excerpt: 'Our latest technology upgrade provides real-time predictive analytics and enhanced visibility.',
      image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=250&fit=crop',
      date: '2024-01-08',
      author: 'Jennifer Park',
      category: 'Technology'
    },
    {
      title: 'Sustainability Initiative: Carbon-Neutral Shipping Options',
      excerpt: 'Introducing eco-friendly shipping solutions to help customers reduce their environmental impact.',
      image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=400&h=250&fit=crop',
      date: '2024-01-05',
      author: 'David Kim',
      category: 'Sustainability'
    },
    {
      title: 'Industry Outlook: Global Trade Trends for 2024',
      excerpt: 'Expert analysis on emerging markets, supply chain resilience, and digital transformation.',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop',
      date: '2024-01-03',
      author: 'Lisa Wang',
      category: 'Industry Insights'
    },
    {
      title: 'Partnership Announcement: Strategic Alliance with European Logistics Leader',
      excerpt: 'New partnership enhances our European coverage and provides customers with expanded service options.',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=250&fit=crop',
      date: '2023-12-28',
      author: 'Sarah Chen',
      category: 'Partnerships'
    },
    {
      title: 'Employee Spotlight: Innovation Award Winners',
      excerpt: 'Recognizing team members who drove operational improvements and customer satisfaction initiatives.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
      date: '2023-12-20',
      author: 'HR Team',
      category: 'Company Culture'
    }
  ];

  const categories = [
    { name: 'All', count: 7, active: true },
    { name: 'Company News', count: 3, active: false },
    { name: 'Technology', count: 1, active: false },
    { name: 'Industry Insights', count: 1, active: false },
    { name: 'Sustainability', count: 1, active: false },
    { name: 'Partnerships', count: 1, active: false }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              News & Updates
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Stay informed with the latest company news, industry insights, 
              and updates from the world of global logistics and freight forwarding.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Article */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative">
                <img 
                  src={featuredNews.image} 
                  alt={featuredNews.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(featuredNews.date)}
                  <span className="mx-2">•</span>
                  <User className="h-4 w-4 mr-2" />
                  {featuredNews.author}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {featuredNews.title}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {featuredNews.excerpt}
                </p>
                <button 
                  onClick={onContactClick}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center w-fit"
                >
                  Read Full Article
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  category.active
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(article.date)}
                  </div>
                  <div className="mb-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <User className="h-4 w-4 mr-2" />
                      {article.author}
                    </div>
                    <button 
                      onClick={onContactClick}
                      className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                    >
                      Read More
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Subscribe to our newsletter for the latest news, industry insights, and company updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button 
              onClick={onContactClick}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Industry Stats */}
      <div className="py-20 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Industry Impact
            </h2>
            <p className="text-xl text-slate-300">
              Our contribution to global logistics
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">35%</div>
              <div className="text-slate-300">Growth in 2023</div>
            </div>
            <div>
              <Globe className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">120+</div>
              <div className="text-slate-300">Countries Served</div>
            </div>
            <div>
              <Award className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">98.5%</div>
              <div className="text-slate-300">Customer Satisfaction</div>
            </div>
            <div>
              <User className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-slate-300">Active Customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Ship with ShipSmart?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Experience the innovation and reliability that's making headlines in the logistics industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onQuoteClick}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              Get Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={onContactClick}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
