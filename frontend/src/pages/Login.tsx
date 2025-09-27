import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Truck, Shield } from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface LoginProps {
  onQuoteClick: () => void;
  onContactClick: () => void;
  onNavigate: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onQuoteClick, onContactClick, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();
  
  // Debug: Log auth state
  console.log('🔍 Login component - Auth state:', { user, isAuthenticated });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'shipper' as UserRole,
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
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
    console.log('🚀 Login form submitted!', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed', errors);
      return;
    }

    setIsLoading(true);
    console.log('⏳ Starting login process...');
    
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        rememberMe: formData.rememberMe
      });
      
      console.log('📝 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful! Redirecting...');
        
        // Wait a moment for user state to update, then get the role
        await new Promise(resolve => setTimeout(resolve, 100));
        const userRole = user?.role || formData.role;
        let redirectPath = '/dashboard'; // fallback
        
        switch (userRole) {
          case 'system_administrator':
            redirectPath = '/admin';
            break;
          case 'shipper':
            redirectPath = '/shipper';
            break;
          case 'carrier':
            redirectPath = '/carrier';
            break;
          case 'driver':
            redirectPath = '/driver';
            break;
          case 'dispatcher':
            redirectPath = '/dispatcher';
            break;
          case 'customer_service':
            redirectPath = '/customer-service';
            break;
          case 'finance':
            redirectPath = '/finance';
            break;
          default:
            redirectPath = '/dashboard';
        }
        
        console.log(`🎯 Redirecting ${userRole} to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
      } else {
        console.log('❌ Login failed:', result.error);
        if (result.requiresVerification) {
          setErrors({ 
            general: result.error || 'Email verification required',
            verification: 'Please check your email and click the verification link before logging in.'
          });
        } else {
          setErrors({ general: result.error || 'Login failed. Please try again.' });
        }
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
      console.log('🏁 Login process completed');
    }
  };

  const handleGoogleLogin = async () => {
    console.log('🔵 Google login button clicked!');
    setIsLoading(true);
    try {
      // Simulate Google OAuth flow
      console.log('⏳ Initiating Google OAuth...');
      
      // In a real implementation, you would:
      // 1. Redirect to Google OAuth URL
      // 2. Handle the callback with authorization code
      // 3. Exchange code for access token
      // 4. Get user info from Google API
      // 5. Create or login user in your system
      
      // For now, simulate the OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful Google login
      const googleUser = {
        email: 'user@gmail.com',
        firstName: 'Google',
        lastName: 'User',
        avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        provider: 'google'
      };
      
      // Create a mock login result
      const result = await login({
        email: googleUser.email,
        password: 'google-oauth-token', // In real app, this would be handled differently
        role: 'shipper', // Default role for OAuth users
        rememberMe: true
      });
      
      if (result.success) {
        // Redirect OAuth users to shipper dashboard (default for social login)
        navigate('/shipper', { replace: true });
      } else {
        // If user doesn't exist, redirect to registration with pre-filled Google data
        navigate('/register', { 
          state: { 
            googleUser,
            message: 'Complete your registration to continue with Google account'
          }
        });
      }
    } catch (error) {
      console.error('Google login failed:', error);
      setErrors({ general: 'Google login failed. Please try again or use email/password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    console.log('🔵 Facebook login button clicked!');
    setIsLoading(true);
    try {
      // Simulate Facebook OAuth flow
      console.log('⏳ Initiating Facebook OAuth...');
      
      // In a real implementation, you would:
      // 1. Initialize Facebook SDK
      // 2. Call FB.login() with required permissions
      // 3. Get user profile data
      // 4. Create or login user in your system
      
      // For now, simulate the OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful Facebook login
      const facebookUser = {
        email: 'user@facebook.com',
        firstName: 'Facebook',
        lastName: 'User',
        avatar: 'https://graph.facebook.com/me/picture?type=large',
        provider: 'facebook'
      };
      
      // Create a mock login result
      const result = await login({
        email: facebookUser.email,
        password: 'facebook-oauth-token', // In real app, this would be handled differently
        role: 'shipper', // Default role for OAuth users
        rememberMe: true
      });
      
      if (result.success) {
        // Redirect OAuth users to shipper dashboard (default for social login)
        navigate('/shipper', { replace: true });
      } else {
        // If user doesn't exist, redirect to registration with pre-filled Facebook data
        navigate('/register', { 
          state: { 
            facebookUser,
            message: 'Complete your registration to continue with Facebook account'
          }
        });
      }
    } catch (error) {
      console.error('Facebook login failed:', error);
      setErrors({ general: 'Facebook login failed. Please try again or use email/password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const email = formData.email || prompt('Please enter your email address:');
    if (email) {
      console.log('Password reset requested for:', email);
      alert(`Password reset link would be sent to ${email}. Check your email inbox.`);
      // In a real app: call password reset API
    }
  };


  const features = [
    'Real-time shipment tracking',
    'Instant rate quotes',
    'Document management',
    'Dedicated account manager',
    'Priority customer support',
    'Advanced analytics dashboard'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-600 p-3 rounded-full">
                <Truck className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to your RaphTrack account to manage your shipments
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Display */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
                {errors.verification && (
                  <p className="text-red-600 text-xs mt-2">{errors.verification}</p>
                )}
              </div>
            )}
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Your Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="system_administrator">🛠️ System Administrator</option>
                  <option value="shipper">📦 Shipper (Customer)</option>
                  <option value="carrier">🏢 Carrier (Freight Company)</option>
                  <option value="driver">🚚 Driver</option>
                  <option value="dispatcher">📍 Dispatcher</option>
                  <option value="customer_service">📞 Customer Service</option>
                  <option value="finance">💰 Finance</option>
                </select>
              </div>
              {errors.role && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.role}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-600">
                💡 Select the role you registered with to access the appropriate dashboard
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-2">Google</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                ) : (
                  <>
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/>
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </>
                )}
              </button>
            </div>
            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign up for free
                </button>
              </p>
            </div>

            {/* Registration Prompt */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-semibold text-green-800 mb-2">Ready to Start Shipping?</h4>
              <p className="text-xs text-green-700 mb-3">
                Join thousands of businesses who trust RaphTrack for their logistics needs. 
                Create your account to access real-time tracking, competitive rates, and dedicated support.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Create Your Account →
                </button>
                
                {/* Debug: Clear Account Data */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('This will clear all stored account data. Are you sure?')) {
                      localStorage.removeItem('registeredUsers');
                      localStorage.removeItem('user');
                      localStorage.removeItem('sessionToken');
                      alert('✅ Account data cleared! You can now register fresh.');
                      window.location.reload();
                    }
                  }}
                  className="w-full bg-red-100 text-red-700 py-1 px-4 rounded text-xs hover:bg-red-200 transition-colors"
                >
                  🗑️ Clear Account Data (Debug)
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white items-center justify-center p-12">
        <div className="max-w-md">
          <h3 className="text-3xl font-bold mb-6">
            Streamline Your Logistics
          </h3>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of businesses who trust RaphTrack for their global shipping needs.
          </p>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-300 mr-3 flex-shrink-0" />
                <span className="text-blue-100">{feature}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-blue-700 rounded-lg">
            <p className="text-sm text-blue-100 mb-2">Need help getting started?</p>
            <button 
              onClick={onContactClick}
              className="text-white font-medium hover:text-blue-200"
            >
              Contact our support team →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
