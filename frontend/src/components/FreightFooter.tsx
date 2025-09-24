import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';

interface FreightFooterProps {
  onContactClick: () => void;
  onNavigate?: (section: string) => void;
  onPageNavigate?: (page: string) => void;
}

export const FreightFooter: React.FC<FreightFooterProps> = ({ onContactClick, onNavigate, onPageNavigate }) => {
  const services = [
    { name: 'Ocean Freight', action: () => onPageNavigate?.('ocean-freight') },
    { name: 'Air Freight', action: () => onPageNavigate?.('air-freight') },
    { name: 'Customs Clearance', action: () => onPageNavigate?.('customs-clearance') },
    { name: 'Warehousing', action: () => onPageNavigate?.('warehousing') },
    { name: 'Ground Transportation', action: () => onPageNavigate?.('ground-transportation') },
    { name: 'Project Cargo', action: () => onPageNavigate?.('project-cargo') }
  ];

  const company = [
    { name: 'About Us', action: () => onPageNavigate?.('about-us') },
    { name: 'Our Team', action: () => onPageNavigate?.('team') },
    { name: 'Careers', action: () => onPageNavigate?.('careers') },
    { name: 'News & Updates', action: () => onPageNavigate?.('news') },
    { name: 'Case Studies', action: () => onPageNavigate?.('case-studies') },
    { name: 'Partners', action: () => onPageNavigate?.('partners') }
  ];

  const resources = [
    { name: 'Documentation', action: () => onPageNavigate?.('documentation') },
    { name: 'API Reference', action: () => onPageNavigate?.('api-reference') },
    { name: 'Shipping Calculator', action: () => onNavigate?.('services') },
    { name: 'Transit Times', action: () => onNavigate?.('tracking') },
    { name: 'Incoterms Guide', action: () => onPageNavigate?.('incoterms-guide') },
    { name: 'Support Center', action: onContactClick }
  ];

  const offices = [
    {
      city: 'New York',
      address: '123 Harbor Drive, NY 10001',
      phone: '+1 (555) 123-4567',
      mapLink: 'https://maps.google.com/?q=123+Harbor+Drive+NY+10001'
    },
    {
      city: 'Accra',
      address: 'Airport City, Accra, Ghana',
      phone: '+233 559204847',
      mapLink: 'https://maps.google.com/?q=Airport+City+Accra+Ghana'
    },
    {
      city: 'Miami',
      address: '789 Ocean Avenue, FL 33101',
      phone: '+1 (555) 456-7890',
      mapLink: 'https://maps.google.com/?q=789+Ocean+Avenue+FL+33101'
    }
  ];

  const socialLinks = [
    { icon: Linkedin, url: 'https://linkedin.com/company/shipsmart', label: 'LinkedIn' },
    { icon: Twitter, url: 'https://twitter.com/shipsmart', label: 'Twitter' },
    { icon: Facebook, url: 'https://facebook.com/shipsmart', label: 'Facebook' },
    { 
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ), 
      url: 'https://instagram.com/shipsmart', 
      label: 'Instagram' 
    },
    { 
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ), 
      url: 'https://tiktok.com/@shipsmart', 
      label: 'TikTok' 
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="ml-3 text-2xl font-bold">ShipSmart</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted global logistics partner. We provide comprehensive freight forwarding 
              solutions with cutting-edge technology and unparalleled customer service.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <button
                  key={index}
                  onClick={() => window.open(social.url, '_blank')}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <button 
                    onClick={service.action}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    {service.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {company.map((item, index) => (
                <li key={index}>
                  <button 
                    onClick={item.action}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {resources.map((resource, index) => (
                <li key={index}>
                  <button 
                    onClick={resource.action}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    {resource.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Offices Section */}
        <div className="border-t border-gray-800 mt-12 pt-12">
          <h3 className="text-xl font-semibold mb-8 text-center">Our Global Offices</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <div key={index} className="text-center">
                <h4 className="font-semibold text-lg mb-3">{office.city}</h4>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <button
                      onClick={() => window.open(office.mapLink, '_blank')}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {office.address}
                    </button>
                  </div>
                  <div className="flex items-center justify-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <button 
                      onClick={() => window.open(`tel:${office.phone}`, '_self')}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {office.phone}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Ship Smarter?</h3>
            <p className="text-blue-100 mb-6">
              Get in touch with our logistics experts for a customized solution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.open('mailto:contact@shipsmart.com', '_self')}
                className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                contact@shipsmart.com
              </button>
              <button 
                onClick={() => window.open('tel:+1-800-SHIPSMART', '_self')}
                className="inline-flex items-center border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                1-800-SHIPSMART
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            &copy; 2024 ShipSmart. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button 
              onClick={() => onPageNavigate?.('privacy-policy')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onPageNavigate?.('terms-of-service')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => onPageNavigate?.('cookie-policy')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
