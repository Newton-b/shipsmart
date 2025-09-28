import React, { useState, useEffect } from 'react';
import {
  CreditCard, DollarSign, Calendar, Lock, Check, AlertTriangle,
  Plus, Trash2, Edit, Eye, Download, Receipt, Shield,
  Smartphone, Wallet, Building, User, Mail, Phone
} from 'lucide-react';
import { paymentService, PaymentMethod, Invoice, SubscriptionPlan } from '../services/paymentService';
import { MobileButton, MobileInput, MobileCard, MobileAlert, MobileSelect } from './MobileUILibrary';

interface PaymentSystemProps {
  customerId: string;
  onPaymentSuccess?: (paymentId: string) => void;
}

export const PaymentSystem: React.FC<PaymentSystemProps> = ({
  customerId,
  onPaymentSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'methods' | 'invoices' | 'plans'>('methods');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  // Card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
    billingAddress: {
      name: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [methods, invoiceList, plans] = await Promise.all([
        paymentService.getPaymentMethods(customerId),
        paymentService.getInvoices(customerId),
        paymentService.getSubscriptionPlans()
      ]);
      
      setPaymentMethods(methods);
      setInvoices(invoiceList);
      setSubscriptionPlans(plans);
    } catch (err) {
      setError('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!validateCardForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentService.addPaymentMethod({
        type: 'card',
        cardNumber: cardForm.cardNumber,
        expiryMonth: parseInt(cardForm.expiryMonth),
        expiryYear: parseInt(cardForm.expiryYear),
        cvc: cardForm.cvc,
        billingAddress: {
          ...cardForm.billingAddress,
          name: cardForm.cardholderName
        }
      });

      if (result.success && result.paymentMethod) {
        setPaymentMethods(prev => [...prev, result.paymentMethod!]);
        setSuccess('Payment method added successfully');
        setShowAddCard(false);
        resetCardForm();
      } else {
        setError(result.error || 'Failed to add payment method');
      }
    } catch (err) {
      setError('Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string, paymentMethodId: string) => {
    setProcessingPayment(invoiceId);
    setError(null);

    try {
      const result = await paymentService.payInvoice(invoiceId, paymentMethodId);

      if (result.success) {
        setSuccess('Invoice paid successfully');
        // Update invoice status
        setInvoices(prev => prev.map(inv => 
          inv.id === invoiceId 
            ? { ...inv, status: 'paid' as const, paidAt: new Date() }
            : inv
        ));
        onPaymentSuccess?.(result.paymentIntent?.id || '');
      } else {
        setError(result.error || 'Payment failed');
      }
    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleSubscribe = async (planId: string, paymentMethodId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await paymentService.subscribeToPlan({
        planId,
        paymentMethodId,
        customerId
      });

      if (result.success) {
        setSuccess('Successfully subscribed to plan');
        onPaymentSuccess?.(result.paymentIntent?.id || '');
      } else {
        setError(result.error || 'Subscription failed');
      }
    } catch (err) {
      setError('Subscription failed');
    } finally {
      setIsLoading(false);
    }
  };

  const validateCardForm = (): boolean => {
    const errors: string[] = [];

    if (!paymentService.validateCardNumber(cardForm.cardNumber)) {
      errors.push('Invalid card number');
    }

    if (!cardForm.expiryMonth || !cardForm.expiryYear) {
      errors.push('Expiry date is required');
    }

    if (cardForm.cvc.length < 3) {
      errors.push('Invalid CVC');
    }

    if (!cardForm.cardholderName.trim()) {
      errors.push('Cardholder name is required');
    }

    if (!cardForm.billingAddress.line1.trim()) {
      errors.push('Billing address is required');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    return true;
  };

  const resetCardForm = () => {
    setCardForm({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      cardholderName: '',
      billingAddress: {
        name: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      }
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'open': return 'text-blue-600 bg-blue-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Center</h1>
        <p className="text-gray-600">Manage your payment methods, invoices, and subscriptions</p>
      </div>

      {/* Alerts */}
      {error && (
        <MobileAlert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <MobileAlert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'methods', label: 'Payment Methods', icon: CreditCard },
          { id: 'invoices', label: 'Invoices', icon: Receipt },
          { id: 'plans', label: 'Subscription Plans', icon: DollarSign }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Payment Methods Tab */}
      {activeTab === 'methods' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
            <MobileButton
              onClick={() => setShowAddCard(true)}
              icon={Plus}
              variant="primary"
            >
              Add Card
            </MobileButton>
          </div>

          {/* Payment Methods List */}
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <MobileCard key={method.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getCardIcon(method.brand || '')}</div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {method.brand?.toUpperCase()} •••• {method.last4}
                      </div>
                      <div className="text-sm text-gray-600">
                        Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                      </div>
                      {method.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">{method.billingAddress.name}</div>
                    <div>{method.billingAddress.line1}</div>
                    {method.billingAddress.line2 && <div>{method.billingAddress.line2}</div>}
                    <div>
                      {method.billingAddress.city}, {method.billingAddress.state} {method.billingAddress.postalCode}
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>

          {/* Add Card Modal */}
          {showAddCard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Add Payment Method</h3>
                    <button
                      onClick={() => setShowAddCard(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Card Number */}
                    <MobileInput
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={cardForm.cardNumber}
                      onChange={(value) => setCardForm(prev => ({ 
                        ...prev, 
                        cardNumber: formatCardNumber(value) 
                      }))}
                      icon={CreditCard}
                    />

                    {/* Expiry and CVC */}
                    <div className="grid grid-cols-3 gap-3">
                      <MobileSelect
                        label="Month"
                        value={cardForm.expiryMonth}
                        onChange={(value) => setCardForm(prev => ({ ...prev, expiryMonth: value }))}
                        options={Array.from({ length: 12 }, (_, i) => ({
                          value: (i + 1).toString().padStart(2, '0'),
                          label: (i + 1).toString().padStart(2, '0')
                        }))}
                      />
                      
                      <MobileSelect
                        label="Year"
                        value={cardForm.expiryYear}
                        onChange={(value) => setCardForm(prev => ({ ...prev, expiryYear: value }))}
                        options={Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return { value: year.toString(), label: year.toString() };
                        })}
                      />
                      
                      <MobileInput
                        label="CVC"
                        placeholder="123"
                        value={cardForm.cvc}
                        onChange={(value) => setCardForm(prev => ({ 
                          ...prev, 
                          cvc: value.replace(/\D/g, '').slice(0, 4) 
                        }))}
                        icon={Lock}
                      />
                    </div>

                    {/* Cardholder Name */}
                    <MobileInput
                      label="Cardholder Name"
                      placeholder="John Doe"
                      value={cardForm.cardholderName}
                      onChange={(value) => setCardForm(prev => ({ ...prev, cardholderName: value }))}
                      icon={User}
                    />

                    {/* Billing Address */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Billing Address</h4>
                      
                      <MobileInput
                        label="Address Line 1"
                        placeholder="123 Main St"
                        value={cardForm.billingAddress.line1}
                        onChange={(value) => setCardForm(prev => ({ 
                          ...prev, 
                          billingAddress: { ...prev.billingAddress, line1: value }
                        }))}
                        icon={Building}
                      />
                      
                      <MobileInput
                        label="Address Line 2 (Optional)"
                        placeholder="Apt 4B"
                        value={cardForm.billingAddress.line2}
                        onChange={(value) => setCardForm(prev => ({ 
                          ...prev, 
                          billingAddress: { ...prev.billingAddress, line2: value }
                        }))}
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <MobileInput
                          label="City"
                          placeholder="New York"
                          value={cardForm.billingAddress.city}
                          onChange={(value) => setCardForm(prev => ({ 
                            ...prev, 
                            billingAddress: { ...prev.billingAddress, city: value }
                          }))}
                        />
                        
                        <MobileInput
                          label="State"
                          placeholder="NY"
                          value={cardForm.billingAddress.state}
                          onChange={(value) => setCardForm(prev => ({ 
                            ...prev, 
                            billingAddress: { ...prev.billingAddress, state: value }
                          }))}
                        />
                      </div>
                      
                      <MobileInput
                        label="ZIP Code"
                        placeholder="10001"
                        value={cardForm.billingAddress.postalCode}
                        onChange={(value) => setCardForm(prev => ({ 
                          ...prev, 
                          billingAddress: { ...prev.billingAddress, postalCode: value }
                        }))}
                      />
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <div className="font-medium">Secure Payment</div>
                          <div>Your payment information is encrypted and secure.</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <MobileButton
                        onClick={() => setShowAddCard(false)}
                        variant="outline"
                        fullWidth
                      >
                        Cancel
                      </MobileButton>
                      <MobileButton
                        onClick={handleAddCard}
                        loading={isLoading}
                        variant="primary"
                        fullWidth
                      >
                        Add Card
                      </MobileButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>

          <div className="space-y-4">
            {invoices.map((invoice) => (
              <MobileCard key={invoice.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{invoice.number}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{invoice.description}</p>
                    <p className="text-gray-500 text-xs">
                      Due: {invoice.dueDate.toLocaleDateString()}
                      {invoice.paidAt && ` • Paid: ${invoice.paidAt.toLocaleDateString()}`}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-2 mb-4">
                  {invoice.lineItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.description} {item.quantity > 1 && `(${item.quantity}x)`}
                      </span>
                      <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>

                  {invoice.status === 'open' && paymentMethods.length > 0 && (
                    <MobileButton
                      onClick={() => handlePayInvoice(invoice.id, paymentMethods[0].id)}
                      loading={processingPayment === invoice.id}
                      variant="primary"
                      size="sm"
                    >
                      Pay Now
                    </MobileButton>
                  )}
                </div>
              </MobileCard>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">Select the perfect plan for your logistics needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <MobileCard 
                key={plan.id} 
                className={`p-6 relative ${plan.isPopular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>

                  {plan.trialDays && (
                    <div className="text-sm text-green-600 font-medium">
                      {plan.trialDays}-day free trial
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <MobileButton
                  onClick={() => paymentMethods.length > 0 && handleSubscribe(plan.id, paymentMethods[0].id)}
                  disabled={paymentMethods.length === 0}
                  variant={plan.isPopular ? 'primary' : 'outline'}
                  fullWidth
                  loading={isLoading}
                >
                  {paymentMethods.length === 0 ? 'Add Payment Method First' : 'Subscribe'}
                </MobileButton>
              </MobileCard>
            ))}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};
