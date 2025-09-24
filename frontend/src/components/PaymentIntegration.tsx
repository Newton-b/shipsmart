import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Lock, CheckCircle, AlertCircle, DollarSign, Zap, Star, Award, Bell } from 'lucide-react';
import { AnimatedCounter, AnimatedProgressBar, PulsingDots, NotificationToast } from './AnimatedElements';

interface PaymentIntegrationProps {
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  shippingDetails: any;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType;
  description: string;
  processingFee: number;
  processingTime: string;
  security: 'high' | 'medium';
}

export const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  shippingDetails
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('stripe');
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'processing' | 'success' | 'error'>('method');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Secure payment via Stripe',
      processingFee: 2.9,
      processingTime: 'Instant',
      security: 'high'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: Shield,
      description: 'Pay with your PayPal account',
      processingFee: 3.5,
      processingTime: 'Instant',
      security: 'high'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: DollarSign,
      description: 'Direct bank transfer',
      processingFee: 0,
      processingTime: '1-3 business days',
      security: 'high'
    }
  ];

  const calculateTotal = () => {
    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
    const processingFee = selectedMethodData ? (amount * selectedMethodData.processingFee / 100) : 0;
    return amount + processingFee;
  };

  const validatePaymentData = () => {
    const errors: {[key: string]: string} = {};
    
    if (selectedMethod === 'stripe') {
      if (!paymentData.cardNumber || paymentData.cardNumber.length < 16) {
        errors.cardNumber = 'Valid card number is required';
      }
      if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        errors.expiryDate = 'Valid expiry date is required (MM/YY)';
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        errors.cvv = 'Valid CVV is required';
      }
      if (!paymentData.cardholderName.trim()) {
        errors.cardholderName = 'Cardholder name is required';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const processPayment = async () => {
    if (!validatePaymentData()) return;
    
    setIsProcessing(true);
    setPaymentStep('processing');
    setProcessingProgress(0);

    try {
      // Simulate payment processing with progress
      const progressSteps = [
        { progress: 20, message: 'Validating payment details...' },
        { progress: 40, message: 'Connecting to payment processor...' },
        { progress: 60, message: 'Processing payment...' },
        { progress: 80, message: 'Verifying transaction...' },
        { progress: 100, message: 'Payment successful!' }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProcessingProgress(step.progress);
      }

      // Simulate successful payment
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setPaymentStep('success');
      setShowSuccess(true);
      
      setTimeout(() => {
        onPaymentSuccess(paymentId);
      }, 2000);

    } catch (error) {
      setPaymentStep('error');
      onPaymentError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  if (paymentStep === 'processing') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mb-6">
            <PulsingDots size="large" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Processing Payment
          </h3>
          <div className="mb-4">
            <AnimatedProgressBar progress={processingProgress} color="bg-blue-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we process your payment securely...
          </p>
        </div>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your shipment has been booked and payment processed.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                <AnimatedCounter value={calculateTotal()} prefix={currency} />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* Payment Method Selection */}
      {paymentStep === 'method' && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Choose Payment Method
          </h3>
          
          <div className="space-y-4 mb-6">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {method.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Fee: {method.processingFee}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {method.processingTime}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Payment Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping Cost:</span>
                <span className="font-medium">
                  <AnimatedCounter value={amount} prefix={currency} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Processing Fee:</span>
                <span className="font-medium">
                  <AnimatedCounter 
                    value={calculateTotal() - amount} 
                    prefix={currency} 
                  />
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  <AnimatedCounter value={calculateTotal()} prefix={currency} />
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPaymentStep('details')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Continue to Payment</span>
            <Zap className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Payment Details Form */}
      {paymentStep === 'details' && selectedMethod === 'stripe' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Payment Details
            </h3>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <Lock className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={formatCardNumber(paymentData.cardNumber)}
                onChange={(e) => handleInputChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={paymentData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.expiryDate}</p>
                )}
              </div>

              {/* CVV */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={paymentData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.cvv}</p>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={paymentData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                placeholder="John Doe"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.cardholderName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.cardholderName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.cardholderName}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setPaymentStep('method')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={processPayment}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>Pay {currency}{calculateTotal().toFixed(2)}</span>
              <CreditCard className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <NotificationToast
          message="Payment processed successfully!"
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};
