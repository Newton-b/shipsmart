import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Package, 
  Ship, 
  Plane, 
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Heart,
  Star,
  Award,
  Target
} from 'lucide-react';

// Animated Loading Spinner
export const AnimatedSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }> = ({ 
  size = 'md', 
  color = 'text-blue-600' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizeClasses[size]} ${color} animate-spin`} />
    </div>
  );
};

// Pulsing Dot Loader
export const PulsingDots: React.FC = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

// Bouncing Balls Loader
export const BouncingBalls: React.FC = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};

// Skeleton Loader
export const SkeletonLoader: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}></div>
        </div>
      ))}
    </div>
  );
};

// Progress Bar with Animation
export const AnimatedProgressBar: React.FC<{ 
  progress: number; 
  color?: string; 
  showLabel?: boolean;
  animated?: boolean;
}> = ({ 
  progress, 
  color = 'bg-blue-600', 
  showLabel = true,
  animated = true 
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(displayProgress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
          style={{ width: `${displayProgress}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Floating Action Button with Ripple Effect
export const FloatingActionButton: React.FC<{ 
  icon: React.ReactNode; 
  onClick: () => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  icon, 
  onClick, 
  color = 'bg-blue-600 hover:bg-blue-700',
  size = 'md' 
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} ${color} text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 relative overflow-hidden`}
    >
      {icon}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white opacity-30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </button>
  );
};

// Animated Counter
export const AnimatedCounter: React.FC<{ 
  value: number; 
  duration?: number;
  prefix?: string;
  suffix?: string;
}> = ({ 
  value, 
  duration = 2000,
  prefix = '',
  suffix = '' 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Typing Animation
export const TypingAnimation: React.FC<{ 
  text: string; 
  speed?: number;
  className?: string;
}> = ({ 
  text, 
  speed = 100,
  className = '' 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// Shipment Status Animation
export const ShipmentStatusAnimation: React.FC<{ 
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  type: 'ocean' | 'air' | 'ground';
}> = ({ status, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'ocean': return <Ship className="w-6 h-6" />;
      case 'air': return <Plane className="w-6 h-6" />;
      case 'ground': return <Truck className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
      case 'in-transit': return 'text-blue-500 bg-blue-100 dark:bg-blue-900';
      case 'delivered': return 'text-green-500 bg-green-100 dark:bg-green-900';
      case 'delayed': return 'text-red-500 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getAnimation = () => {
    switch (status) {
      case 'pending': return 'animate-pulse';
      case 'in-transit': return 'animate-bounce';
      case 'delivered': return '';
      case 'delayed': return 'animate-ping';
      default: return '';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full ${getStatusColor()}`}>
      <div className={getAnimation()}>
        {getIcon()}
      </div>
      <span className="text-sm font-medium capitalize">{status.replace('-', ' ')}</span>
    </div>
  );
};

// Success Animation
export const SuccessAnimation: React.FC<{ show: boolean; onComplete?: () => void }> = ({ 
  show, 
  onComplete 
}) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500 animate-bounce" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Success!</h3>
        <p className="text-gray-600 dark:text-gray-400">Operation completed successfully</p>
      </div>
    </div>
  );
};

// Loading Card Skeleton
export const LoadingCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

// Notification Toast
export const NotificationToast: React.FC<{
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  show: boolean;
  onClose: () => void;
}> = ({ type, message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800';
      case 'error': return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-800';
      case 'info': return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`rounded-lg border p-4 shadow-lg ${getBgColor()}`}>
        <div className="flex items-center space-x-3">
          {getIcon()}
          <p className="text-sm font-medium text-gray-900 dark:text-white">{message}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Gamification Elements
export const AchievementBadge: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
}> = ({ title, description, icon, unlocked, progress = 0 }) => {
  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      unlocked 
        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 border-yellow-200 dark:border-yellow-800 shadow-lg' 
        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-full ${
          unlocked ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {title}
          </h3>
          <p className={`text-sm ${unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
            {description}
          </p>
          {!unlocked && progress > 0 && (
            <div className="mt-2">
              <AnimatedProgressBar progress={progress} showLabel={false} />
            </div>
          )}
        </div>
        {unlocked && (
          <div className="text-yellow-500 animate-bounce">
            <Star className="w-6 h-6 fill-current" />
          </div>
        )}
      </div>
    </div>
  );
};

// Interactive Button with Hover Effects
export const InteractiveButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary': return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25';
      case 'secondary': return 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-500/25';
      case 'success': return 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/25';
      case 'danger': return 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25';
      default: return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-3 py-1.5 text-sm';
      case 'md': return 'px-4 py-2 text-base';
      case 'lg': return 'px-6 py-3 text-lg';
      default: return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        rounded-lg font-medium shadow-lg hover:shadow-xl
        transform transition-all duration-200
        ${isPressed ? 'scale-95' : 'hover:scale-105'}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        disabled:hover:scale-100
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        relative overflow-hidden
      `}
    >
      <span className={`flex items-center justify-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedSpinner size="sm" color="text-white" />
        </div>
      )}
    </button>
  );
};

export default {
  AnimatedSpinner,
  PulsingDots,
  BouncingBalls,
  SkeletonLoader,
  AnimatedProgressBar,
  FloatingActionButton,
  AnimatedCounter,
  TypingAnimation,
  ShipmentStatusAnimation,
  SuccessAnimation,
  LoadingCard,
  NotificationToast,
  AchievementBadge,
  InteractiveButton
};
