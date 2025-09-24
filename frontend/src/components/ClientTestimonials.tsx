import React from 'react';
import { Star, Quote } from 'lucide-react';

interface ClientTestimonialsProps {
  onContactClick: () => void;
}

export const ClientTestimonials: React.FC<ClientTestimonialsProps> = ({ onContactClick }) => {
  const testimonials = [
    {
      name: 'Sarah Mensah',
      title: 'Supply Chain Director',
      company: 'TechFlow Industries',
      content: 'ShipSmart transformed our logistics operations. The real-time visibility and automated workflows reduced our shipping costs by 25% while improving delivery times.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Marcus Rawlings',
      title: 'Logistics Manager',
      company: 'Global Manufacturing Co.',
      content: 'The multi-carrier integration and customs clearance support made international shipping seamless. Their team is incredibly responsive and knowledgeable.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Emily Watson',
      title: 'Operations Director',
      company: 'Retail Solutions Ltd',
      content: 'From ocean freight to last-mile delivery, ShipSmart handles everything. The platform\'s analytics help us optimize our supply chain continuously.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const clients = [
    { name: 'TechFlow', logo: 'https://via.placeholder.com/120x40/4F46E5/FFFFFF?text=TechFlow' },
    { name: 'GlobalMfg', logo: 'https://via.placeholder.com/120x40/059669/FFFFFF?text=GlobalMfg' },
    { name: 'RetailSol', logo: 'https://via.placeholder.com/120x40/DC2626/FFFFFF?text=RetailSol' },
    { name: 'InnovateCorp', logo: 'https://via.placeholder.com/120x40/7C3AED/FFFFFF?text=InnovateCorp' },
    { name: 'SmartLogistics', logo: 'https://via.placeholder.com/120x40/EA580C/FFFFFF?text=SmartLog' },
    { name: 'FastShip', logo: 'https://via.placeholder.com/120x40/0891B2/FFFFFF?text=FastShip' }
  ];

  const stats = [
    { value: '10,000+', label: 'Shipments Delivered' },
    { value: '150+', label: 'Countries Served' },
    { value: '99.9%', label: 'On-Time Delivery' },
    { value: '24/7', label: 'Customer Support' }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of companies who trust ShipSmart with their global logistics
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Logos */}
        <div className="mb-16">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60">
            {clients.map((client, index) => (
              <div key={index} className="flex justify-center">
                <img 
                  src={client.logo} 
                  alt={client.name}
                  className="h-8 md:h-10 object-contain grayscale hover:grayscale-0 transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-100" />
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.title}</div>
                  <div className="text-sm text-blue-600">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Join Our Success Stories?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Experience the ShipSmart difference with a free consultation
          </p>
          <button 
            onClick={onContactClick}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Your Success Story
          </button>
        </div>
      </div>
    </section>
  );
};
