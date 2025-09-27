import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'number' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | null;
  options?: { value: string; label: string }[];
  icon?: React.ComponentType<{ className?: string }>;
}

interface InteractiveFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitText?: string;
  className?: string;
  showProgress?: boolean;
}

export const InteractiveForm: React.FC<InteractiveFormProps> = ({
  fields,
  onSubmit,
  submitText = 'Submit',
  className = '',
  showProgress = true
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = fields.filter(field => field.required);
    const completedFields = requiredFields.filter(field => formData[field.name]?.trim());
    setProgress(requiredFields.length > 0 ? (completedFields.length / requiredFields.length) * 100 : 0);
  }, [formData, fields]);

  const validateField = (field: FormField, value: string): string | null => {
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      return field.validation(value);
    }

    // Built-in validations
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number';
      }
    }

    return null;
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Real-time validation
    const field = fields.find(f => f.name === fieldName);
    if (field && touched[fieldName]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    }
  };

  const handleInputBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, formData[fieldName] || '');
      setErrors(prev => ({ ...prev, [fieldName]: error || '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      const error = validateField(field, formData[field.name] || '');
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}));

    if (hasErrors) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const renderField = (field: FormField) => {
    const hasError = touched[field.name] && errors[field.name];
    const isValid = touched[field.name] && !errors[field.name] && formData[field.name];
    const Icon = field.icon;

    return (
      <div key={field.name} className="space-y-2">
        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          
          {field.type === 'select' ? (
            <select
              id={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleInputBlur(field.name)}
              className={`
                block w-full rounded-lg border-2 px-3 py-2 text-sm transition-all duration-200
                ${Icon ? 'pl-10' : ''}
                ${hasError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : isValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
              `}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              id={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleInputBlur(field.name)}
              placeholder={field.placeholder}
              rows={4}
              className={`
                block w-full rounded-lg border-2 px-3 py-2 text-sm transition-all duration-200 resize-none
                ${Icon ? 'pl-10' : ''}
                ${hasError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : isValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
              `}
            />
          ) : (
            <input
              id={field.name}
              type={field.type === 'password' && showPasswords[field.name] ? 'text' : field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              onBlur={() => handleInputBlur(field.name)}
              placeholder={field.placeholder}
              className={`
                block w-full rounded-lg border-2 px-3 py-2 text-sm transition-all duration-200
                ${Icon ? 'pl-10' : ''}
                ${field.type === 'password' ? 'pr-10' : ''}
                ${hasError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : isValid
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }
                focus:outline-none focus:ring-2 focus:ring-opacity-50
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
              `}
            />
          )}
          
          {field.type === 'password' && (
            <button
              type="button"
              onClick={() => togglePasswordVisibility(field.name)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords[field.name] ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
          
          {isValid && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
          )}
        </div>
        
        {hasError && (
          <div className="flex items-center space-x-1 text-red-600 text-sm animate-shake">
            <AlertCircle className="h-4 w-4" />
            <span>{errors[field.name]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Form Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {fields.map(renderField)}
      
      <button
        type="submit"
        disabled={isSubmitting || progress < 100}
        className={`
          w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-white
          transition-all duration-200 transform hover:scale-105 active:scale-95
          ${isSubmitting || progress < 100
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>{submitText}</span>
        )}
      </button>
    </form>
  );
};
