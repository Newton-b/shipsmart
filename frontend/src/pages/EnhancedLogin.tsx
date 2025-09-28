import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, 
  Truck, Shield, Loader2, Smartphone, User, Building
} from 'lucide-react';
import { useEnhancedAuth } from '../contexts/EnhancedAuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { socialAuthService, useSocialAuth } from '../services/socialAuthService';
import { MobileButton, MobileInput, MobileAlert } from '../components/MobileUILibrary';

export const EnhancedLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading } = useEnhancedAuth();
  const { signInWithGoogle, signInWithFacebook, isLoading: socialLoading, error: socialError } = useSocialAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'shipper' as const,
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check for messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setErrors({ success: location.state.message });
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    }
  }, [location.state]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const result = await login(formData);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...');
        
        // Redirect to appropriate dashboard based on role
        const redirectPath = formData.role === 'system_administrator' ? '/admin' :
                            formData.role === 'carrier' ? '/carrier' :
                            formData.role === 'driver' ? '/driver' :
                            formData.role === 'dispatcher' ? '/dispatcher' :
                            formData.role === 'customer_service' ? '/customer-service' :
                            formData.role === 'finance' ? '/finance' : '/shipper';
        
        navigate(redirectPath, { replace: true });
      } else {
        setErrors({ general: result.error || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrors({});
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success && result.user) {
        if (result.requiresRegistration) {
          // New user - redirect to registration with pre-filled data
          navigate('/register', {
            state: {
              socialUser: result.user,
              provider: 'google',
              message: 'Complete your registration to continue with your Google account'
            }
          });
        } else if (result.token) {
          // Existing user - complete login
          setErrors({ success: 'Successfully signed in with Google!' });
          
          // Simulate login completion
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        }
      } else {
        setErrors({ general: result.error || 'Google sign-in failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Google sign-in failed. Please try again.' });
    }
  };

  const handleFacebookLogin = async () => {
    setErrors({});
    
    try {
      const result = await signInWithFacebook();
      
      if (result.success && result.user) {
        if (result.requiresRegistration) {
          // New user - redirect to registration with pre-filled data
          navigate('/register', {
            state: {
              socialUser: result.user,
              provider: 'facebook',
              message: 'Complete your registration to continue with your Facebook account'
            }
          });
        } else if (result.token) {
          // Existing user - complete login
          setErrors({ success: 'Successfully signed in with Facebook!' });
          
          // Simulate login completion
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        }
      } else {
        setErrors({ general: result.error || 'Facebook sign-in failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Facebook sign-in failed. Please try again.' });
    }
  };

  const handleForgotPassword = () => {
    const email = formData.email || prompt('Please enter your email address:');
    if (!email) return;

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ general: 'Please enter a valid email address.' });
      return;
    }

    // Simulate sending password reset email
    setErrors({ success: `Password reset instructions have been sent to ${email}` });
    
    // Update form data with the email if it was entered via prompt
    if (!formData.email) {
      setFormData(prev => ({ ...prev, email }));
    }
  };

  const roleOptions = [
    { value: 'shipper', label: 'Shipper', description: 'Send and track shipments' },
    { value: 'carrier', label: 'Carrier', description: 'Transport and deliver goods' },
    { value: 'driver', label: 'Driver', description: 'Execute delivery routes' },
    { value: 'dispatcher', label: 'Dispatcher', description: 'Coordinate operations' },
    { value: 'customer_service', label: 'Customer Service', description: 'Support customers' },
    { value: 'finance', label: 'Finance', description: 'Manage payments and billing' },
    { value: 'system_administrator', label: 'Administrator', description: 'System management' }
  ];

  const isAnyLoading = isLoading || authLoading || socialLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-full shadow-lg">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back to RaphTrack
          </h2>
          <p className="text-gray-600">
            Sign in to your logistics dashboard
          </p>
        </div>

        {/* Success Message */}
        {errors.success && (
          <MobileAlert
            type="success"
            message={errors.success}
            onClose={() => setErrors(prev => ({ ...prev, success: '' }))}
          />
        )}

        {/* Error Message */}
        {(errors.general || socialError) && (
          <MobileAlert
            type="error"
            message={errors.general || socialError || ''}
            onClose={() => setErrors(prev => ({ ...prev, general: '' }))}
          />
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <MobileButton
            onClick={handleGoogleLogin}
            disabled={isAnyLoading}
            variant="outline"
            size="lg"
            fullWidth={true}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 relative"
          >
            {socialLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span>Continue with Google</span>
              </div>
            )}
          </MobileButton>

          <MobileButton
            onClick={handleFacebookLogin}
            disabled={isAnyLoading}
            variant="outline"
            size="lg"
            fullWidth={true}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {socialLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <span>Continue with Facebook</span>
              </div>
            )}
          </MobileButton>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-500">
                Or sign in with email
              </span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {roleOptions.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.role === role.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={isAnyLoading}
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">{role.label}</div>
                    <div className="text-xs text-gray-500">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Email */}
          <MobileInput
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            error={errors.email}
            icon={Mail}
            inputMode="email"
            autoComplete="email"
            disabled={isAnyLoading}
          />

          {/* Password */}
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
                className={`block w-full pl-12 pr-12 py-4 text-base border-2 rounded-lg min-h-[52px] transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                placeholder="Enter your password"
                disabled={isAnyLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                disabled={isAnyLoading}
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isAnyLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              disabled={isAnyLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <MobileButton
            type="submit"
            variant="primary"
            size="xl"
            fullWidth={true}
            disabled={isAnyLoading}
            loading={isLoading || authLoading}
            icon={ArrowRight}
          >
            Sign In
          </MobileButton>

          {/* Register Link */}
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up here
            </Link>
          </div>
        </form>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <div className="font-medium">Secure Login</div>
              <div>Your credentials are encrypted and protected with industry-standard security.</div>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-2">Demo Credentials:</div>
            <div className="space-y-1 text-xs">
              <div><strong>Admin:</strong> admin@raphtrack.com / password123</div>
              <div><strong>Shipper:</strong> shipper@raphtrack.com / password123</div>
              <div><strong>Driver:</strong> driver@raphtrack.com / password123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
