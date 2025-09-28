import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// Mobile-optimized Button Component
interface MobileButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 touch-manipulation
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
    xl: 'px-8 py-5 text-xl min-h-[60px]'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`w-5 h-5 ${children ? 'mr-2' : ''}`} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className={`w-5 h-5 ${children ? 'ml-2' : ''}`} />
          )}
        </>
      )}
    </button>
  );
};

// Mobile-optimized Input Component
interface MobileInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'search';
  error?: string;
  icon?: React.ComponentType<any>;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal' | 'search';
  className?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  icon: Icon,
  disabled = false,
  required = false,
  autoComplete,
  inputMode,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`
            block w-full py-4 text-base border-2 rounded-lg min-h-[52px]
            transition-all duration-200 placeholder-gray-400
            ${Icon ? 'pl-12 pr-4' : 'px-4'}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : isFocused 
                ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500' 
                : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2 focus:ring-opacity-20
          `}
        />
      </div>
      {error && (
        <div className="flex items-center mt-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

// Mobile-optimized Select Component
interface MobileSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const MobileSelect: React.FC<MobileSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  disabled = false,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`w-full ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between py-4 px-4 text-base border-2 rounded-lg min-h-[52px]
            transition-all duration-200 text-left
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : isOpen 
                ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500' 
                : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-opacity-20
          `}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
                disabled={option.disabled}
                className={`
                  w-full px-4 py-4 text-left text-base transition-colors
                  ${option.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-900 hover:bg-blue-50 cursor-pointer'
                  }
                  ${value === option.value ? 'bg-blue-50 text-blue-600' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  {option.label}
                  {value === option.value && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center mt-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

// Mobile-optimized Card Component
interface MobileCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  title,
  subtitle,
  action,
  padding = 'md',
  className = '',
  onClick
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200
        ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''}
        transition-all duration-200 ${className}
      `}
      onClick={onClick}
    >
      {(title || subtitle || action) && (
        <div className={`flex items-center justify-between border-b border-gray-100 ${paddingClasses[padding]} pb-3`}>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={title || subtitle || action ? paddingClasses[padding] : paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
};

// Mobile-optimized Alert Component
interface MobileAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const MobileAlert: React.FC<MobileAlertProps> = ({
  type,
  title,
  message,
  onClose,
  className = ''
}) => {
  const alertConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}
    `}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${config.iconColor} mr-3 mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          {title && (
            <h4 className={`font-medium ${config.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${config.messageColor}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${config.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Mobile-optimized Loading Component
interface MobileLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  text?: string;
  className?: string;
}

export const MobileLoading: React.FC<MobileLoadingProps> = ({
  size = 'md',
  color = 'blue',
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div className={`
          animate-spin rounded-full border-2 
          ${sizeClasses[size]} ${colorClasses[color]}
        `} />
        {text && (
          <p className="text-sm text-gray-600 font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

// Mobile-optimized Bottom Sheet Component
interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto'
}) => {
  const heightClasses = {
    auto: 'max-h-[80vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className={`
        absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl
        transform transition-transform duration-300 ease-out
        ${heightClasses[height]} overflow-hidden
      `}>
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
