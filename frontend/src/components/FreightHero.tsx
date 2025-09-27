import React, { useState, useEffect } from 'react';
import { ArrowRight, Globe, Shield, Clock, Ship, Plane, Truck, Package, Container, Play, TrendingUp } from 'lucide-react';
import { InteractiveButton } from './InteractiveButton';

interface FreightHeroProps {
  onQuoteClick: () => void;
  onLearnMoreClick?: () => void;
}

export const FreightHero: React.FC<FreightHeroProps> = ({ onQuoteClick, onLearnMoreClick }) => {
  const [animatedStats, setAnimatedStats] = useState([
    { icon: Globe, value: 0, target: 150, suffix: '+', label: 'Countries Served' },
    { icon: Shield, value: 0, target: 99.9, suffix: '%', label: 'On-Time Delivery' },
    { icon: Clock, value: 0, target: 24, suffix: '/7', label: 'Customer Support' },
  ]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate statistics
    const animateStats = () => {
      animatedStats.forEach((stat, index) => {
        let current = 0;
        const increment = stat.target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.target) {
            current = stat.target;
            clearInterval(timer);
          }
          setAnimatedStats(prev => prev.map((s, i) => 
            i === index ? { ...s, value: current } : s
          ));
        }, 50);
      });
    };

    const timer = setTimeout(animateStats, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuoteClick = async () => {
    // Add some interactive feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    onQuoteClick();
  };

  const handleLearnMoreClick = async () => {
    if (onLearnMoreClick) {
      await new Promise(resolve => setTimeout(resolve, 300));
      onLearnMoreClick();
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Animated Freight Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Container Ship Animation */}
        <div className="absolute top-1/4 left-0 animate-ship">
          <Ship className="w-16 h-16 text-blue-300 opacity-30" />
        </div>
        
        {/* Airplane Animation */}
        <div className="absolute top-1/3 right-0 animate-plane">
          <Plane className="w-12 h-12 text-blue-200 opacity-40" />
        </div>
        
        {/* Truck Animation */}
        <div className="absolute bottom-1/4 left-0 animate-truck">
          <Truck className="w-14 h-14 text-blue-300 opacity-35" />
        </div>
        
        {/* Floating Containers */}
        <div className="absolute top-1/2 left-1/4 animate-float-1">
          <Package className="w-8 h-8 text-blue-200 opacity-25" />
        </div>
        <div className="absolute top-1/5 right-1/4 animate-float-2">
          <Container className="w-10 h-10 text-blue-300 opacity-30" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-float-3">
          <Package className="w-6 h-6 text-blue-200 opacity-20" />
        </div>
        
        {/* Animated Route Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <path
            d="M 0,200 Q 300,100 600,300"
            stroke="rgba(147, 197, 253, 0.3)"
            strokeWidth="2"
            fill="none"
            className="animate-draw-line"
          />
          <path
            d="M 100,400 Q 400,200 800,350"
            stroke="rgba(147, 197, 253, 0.2)"
            strokeWidth="1"
            fill="none"
            className="animate-draw-line-delayed"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Global Supply Chain,
              <span className="text-blue-300"> All in One Platform</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              From factory floor to customer door. Ocean & Air Freight, Customs Clearance, 
              and Real-time Tracking with unparalleled visibility and control.
            </p>

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {animatedStats.map((stat, index) => (
                <div key={index} className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: `${index * 200}ms` }}>
                  <div className="bg-blue-800/50 rounded-lg p-4 hover:bg-blue-700/50 transition-colors cursor-pointer group">
                    <stat.icon className="h-8 w-8 text-blue-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-2xl font-bold text-white">
                      {stat.target === 99.9 ? stat.value.toFixed(1) : Math.floor(stat.value)}{stat.suffix}
                    </div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <InteractiveButton
                onClick={handleQuoteClick}
                variant="secondary"
                size="lg"
                icon={ArrowRight}
                className="bg-white text-blue-900 hover:bg-blue-50"
                loadingText="Getting Quote..."
                successText="Quote Ready!"
              >
                Get Instant Quote
              </InteractiveButton>
              
              <InteractiveButton
                onClick={handleLearnMoreClick}
                variant="outline"
                size="lg"
                icon={Play}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900"
                loadingText="Loading..."
                successText="Let's Go!"
              >
                Learn More
              </InteractiveButton>
            </div>
          </div>

          {/* Right Column - Animated Freight Visuals */}
          <div className="relative">
            {/* Main Container Visual */}
            <div className="relative bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-700/50 to-transparent rounded-2xl"></div>
              
              {/* Port Scene */}
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                  {/* Cranes */}
                  <div className="animate-crane-1">
                    <div className="w-2 h-20 bg-blue-300 mx-auto"></div>
                    <div className="w-8 h-1 bg-blue-300 transform -translate-y-16 animate-crane-arm"></div>
                  </div>
                  <div className="animate-crane-2">
                    <div className="w-2 h-24 bg-blue-200 mx-auto"></div>
                    <div className="w-10 h-1 bg-blue-200 transform -translate-y-20 animate-crane-arm-delayed"></div>
                  </div>
                </div>

                {/* Container Stack */}
                <div className="grid grid-cols-4 gap-1 mb-4">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 rounded-sm animate-container-stack ${
                        i % 3 === 0 ? 'bg-red-400' : i % 3 === 1 ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>

                {/* Moving Ship */}
                <div className="relative h-12 bg-blue-600 rounded-lg overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-blue-400"></div>
                  <div className="absolute bottom-2 animate-ship-move">
                    <Ship className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Transport Icons */}
                <div className="flex justify-around mt-6">
                  <div className="text-center animate-bounce-1">
                    <Ship className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                    <span className="text-xs text-blue-200">Ocean</span>
                  </div>
                  <div className="text-center animate-bounce-2">
                    <Plane className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                    <span className="text-xs text-blue-200">Air</span>
                  </div>
                  <div className="text-center animate-bounce-3">
                    <Truck className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                    <span className="text-xs text-blue-200">Ground</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 animate-float-slow">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 animate-float-slow-delayed">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes ship {
          0% { transform: translateX(-100px) translateY(0px); }
          50% { transform: translateX(50vw) translateY(-10px); }
          100% { transform: translateX(100vw) translateY(0px); }
        }
        
        @keyframes plane {
          0% { transform: translateX(100px) translateY(0px) rotate(0deg); }
          50% { transform: translateX(-50vw) translateY(-20px) rotate(-5deg); }
          100% { transform: translateX(-100vw) translateY(0px) rotate(0deg); }
        }
        
        @keyframes truck {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100vw); }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(90deg); }
        }
        
        @keyframes draw-line {
          0% { stroke-dasharray: 0, 1000; }
          100% { stroke-dasharray: 1000, 0; }
        }
        
        @keyframes crane-arm {
          0%, 100% { transform: translateY(-16px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(10deg); }
        }
        
        @keyframes container-stack {
          0% { transform: translateY(20px) opacity(0); }
          100% { transform: translateY(0px) opacity(1); }
        }
        
        @keyframes ship-move {
          0% { transform: translateX(-40px); }
          100% { transform: translateX(200px); }
        }
        
        @keyframes bounce-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes bounce-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes bounce-3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(360deg); }
        }
        
        .animate-ship { animation: ship 20s linear infinite; }
        .animate-plane { animation: plane 15s linear infinite; }
        .animate-truck { animation: truck 25s linear infinite; }
        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 8s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 7s ease-in-out infinite; }
        .animate-draw-line { animation: draw-line 10s ease-in-out infinite; }
        .animate-draw-line-delayed { animation: draw-line 10s ease-in-out infinite 2s; }
        .animate-crane-1 { animation: bounce-1 4s ease-in-out infinite; }
        .animate-crane-2 { animation: bounce-2 5s ease-in-out infinite 1s; }
        .animate-crane-arm { animation: crane-arm 3s ease-in-out infinite; }
        .animate-crane-arm-delayed { animation: crane-arm 3s ease-in-out infinite 1.5s; }
        .animate-container-stack { animation: container-stack 1s ease-out forwards; }
        .animate-ship-move { animation: ship-move 12s linear infinite; }
        .animate-bounce-1 { animation: bounce-1 2s ease-in-out infinite; }
        .animate-bounce-2 { animation: bounce-2 2s ease-in-out infinite 0.5s; }
        .animate-bounce-3 { animation: bounce-3 2s ease-in-out infinite 1s; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slow-delayed { animation: float-slow 8s ease-in-out infinite 2s; }
      `}</style>
    </div>
  );
};
