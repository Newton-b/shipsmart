import React, { ReactNode } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useInteractiveButton } from '../hooks/useInteractiveButton';

interface InteractiveButtonProps {
  children: ReactNode;
  onClick?: () => Promise<void> | void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText = 'Error occurred',
  icon: Icon,
  hapticFeedback = true,
  soundFeedback = false,
  type = 'button'
}) => {
  const { isLoading, isSuccess, isError, isPressed, handlePress, handleClick } = useInteractiveButton({
    hapticFeedback,
    soundFeedback
  });

  const getVariantClasses = () => {
    const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-500 shadow-md hover:shadow-lg`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white focus:ring-gray-500`;
      case 'success':
        return `${baseClasses} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white focus:ring-green-500 shadow-md hover:shadow-lg`;
      case 'danger':
        return `${baseClasses} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500 shadow-md hover:shadow-lg`;
      case 'outline':
        return `${baseClasses} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm rounded-md';
      case 'md':
        return 'px-4 py-2 text-sm rounded-lg';
      case 'lg':
        return 'px-6 py-3 text-base rounded-lg';
      default:
        return 'px-4 py-2 text-sm rounded-lg';
    }
  };

  const getStateClasses = () => {
    if (disabled) return 'opacity-50 cursor-not-allowed';
    if (isPressed) return 'transform scale-95';
    if (isLoading) return 'cursor-wait';
    if (isSuccess) return 'bg-green-600 hover:bg-green-600';
    if (isError) return 'bg-red-600 hover:bg-red-600';
    return 'transform hover:scale-105 active:scale-95';
  };

  const handleButtonClick = async () => {
    if (disabled || isLoading) return;
    
    handlePress();
    
    if (onClick) {
      await handleClick(onClick);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      );
    }
    
    if (isSuccess) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{successText}</span>
        </div>
      );
    }
    
    if (isError) {
      return (
        <div className="flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorText}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center space-x-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
      </div>
    );
  };

  return (
    <button
      type={type}
      onClick={handleButtonClick}
      disabled={disabled || isLoading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${getStateClasses()}
        ${className}
      `}
    >
      {/* Ripple effect */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className={`absolute inset-0 bg-white opacity-0 ${isPressed ? 'animate-ping opacity-20' : ''}`} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {renderContent()}
      </div>
    </button>
  );
};
