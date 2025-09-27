import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Building, Phone, ArrowRight, AlertCircle, CheckCircle, Truck } from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { socialLoginService } from '../services/authService';
import { InteractiveButton } from './InteractiveButton';
import { MobileContainer, MobileInput, MobileButton } from './MobileOptimized';

export const MobileRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
  // Check if we have OAuth data from login redirect
  const socialUser = location.state?.socialUser;
  const provider = location.state?.provider;
  const message = location.state?.message;
  
  const [formData, setFormData] = useState({
    firstName: socialUser?.firstName || '',
    lastName: socialUser?.lastName || '',
    email: socialUser?.email || '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    role: 'shipper' as UserRole,
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string | boolean | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!socialUser) { // Only validate password if not from social login
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        password: socialUser ? 'social-login-password' : formData.password,
        role: formData.role
      });
      
      if (result.success) {
        console.log('✅ Registration successful, redirecting...');
        
        // Redirect to appropriate dashboard
        const redirectPath = formData.role === 'system_administrator' ? '/admin' :
                            formData.role === 'carrier' ? '/carrier' :
                            formData.role === 'driver' ? '/driver' :
                            formData.role === 'dispatcher' ? '/dispatcher' :
                            formData.role === 'customer_service' ? '/customer-service' :
                            formData.role === 'finance' ? '/finance' : '/shipper';
        
        navigate(redirectPath, { replace: true });
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await socialLoginService.loginWithGoogle();
      
      if (result.success && result.user && result.token) {
        navigate('/login', { 
          state: { 
            message: 'Account already exists. Please sign in with your Google account.',
            email: result.user.email
          }
        });
      } else if (result.requiresRegistration && result.user) {
        setFormData(prev => ({
          ...prev,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          email: result.user.email || '',
        }));
        setErrors({ success: 'Google account connected! Please complete your registration below.' });
      } else {
        setErrors({ general: result.error || 'Google signup failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Google signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await socialLoginService.loginWithFacebook();
      
      if (result.success && result.user && result.token) {
        navigate('/login', { 
          state: { 
            message: 'Account already exists. Please sign in with your Facebook account.',
            email: result.user.email
          }
        });
      } else if (result.requiresRegistration && result.user) {
        setFormData(prev => ({
          ...prev,
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          email: result.user.email || '',
        }));
        setErrors({ success: 'Facebook account connected! Please complete your registration below.' });
      } else {
        setErrors({ general: result.error || 'Facebook signup failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Facebook signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileContainer padding="md" className="py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600">
            Join RaphTrack and start managing your shipments
          </p>
        </div>

        {/* Social Login Message */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-sm text-center">{message}</p>
          </div>
        )}

        {/* Success Message */}
        {errors.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-700 text-sm">{errors.success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Social Login Buttons */}
        {!socialUser && (
          <div className="space-y-3 mb-6">
            <MobileButton
              onClick={handleGoogleSignup}
              variant="outline"
              size="lg"
              fullWidth={true}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span>Continue with Google</span>
              </div>
            </MobileButton>

            <MobileButton
              onClick={handleFacebookSignup}
              variant="outline"
              size="lg"
              fullWidth={true}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <span>Continue with Facebook</span>
              </div>
            </MobileButton>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or sign up with</span>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MobileInput
              type="text"
              label="First Name"
              placeholder="Joyce"
              value={formData.firstName}
              onChange={(value) => handleInputChange('firstName', value)}
              error={errors.firstName}
              icon={User}
              disabled={isLoading}
            />

            <MobileInput
              type="text"
              label="Last Name"
              placeholder="Mensah"
              value={formData.lastName}
              onChange={(value) => handleInputChange('lastName', value)}
              error={errors.lastName}
              icon={User}
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <MobileInput
            type="email"
            label="Email Address"
            placeholder="joyce@example.com"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            error={errors.email}
            icon={Mail}
            inputMode="email"
            autoComplete="email"
            disabled={isLoading || !!socialUser}
          />

          {/* Phone */}
          <MobileInput
            type="tel"
            label="Phone Number"
            placeholder="+1 (555) 123-456"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            icon={Phone}
            inputMode="tel"
            autoComplete="tel"
            disabled={isLoading}
          />

          {/* Company */}
          <MobileInput
            type="text"
            label="Company"
            placeholder="Acme Corp"
            value={formData.company}
            onChange={(value) => handleInputChange('company', value)}
            error={errors.company}
            icon={Building}
            disabled={isLoading}
          />

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="shipper"
                  checked={formData.role === 'shipper'}
                  onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={isLoading}
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Shipper</div>
                  <div className="text-xs text-gray-500">Send and track shipments</div>
                </div>
              </label>
            </div>
          </div>

          {/* Password Fields - Only show if not from social login */}
          {!socialUser && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`block w-full pl-12 pr-12 py-4 text-base border-2 rounded-lg min-h-[48px] transition-all duration-200 ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:outline-none focus:ring-opacity-20`}
                    placeholder="Enter password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`block w-full pl-12 pr-12 py-4 text-base border-2 rounded-lg min-h-[48px] transition-all duration-200 ${
                      errors.confirmPassword 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    } focus:outline-none focus:ring-opacity-20`}
                    placeholder="Confirm password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              disabled={isLoading}
            />
            <div className="text-sm">
              <span className="text-gray-700">I agree to the </span>
              <button
                type="button"
                onClick={() => navigate('/terms-of-service')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Terms and Conditions
              </button>
              <span className="text-gray-700"> and </span>
              <button
                type="button"
                onClick={() => navigate('/privacy-policy')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Privacy Policy
              </button>
            </div>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
          )}

          {/* Submit Button */}
          <MobileButton
            type="submit"
            variant="primary"
            size="xl"
            fullWidth={true}
            disabled={isLoading}
            loading={isLoading}
            icon={ArrowRight}
          >
            Create Account
          </MobileButton>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-gray-600">Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-500 font-medium"
              disabled={isLoading}
            >
              Sign in here
            </button>
          </div>
        </form>
      </MobileContainer>
    </div>
  );
};
