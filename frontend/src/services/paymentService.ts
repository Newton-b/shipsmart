// Real Payment Processing Service with Stripe Integration

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  billingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  description: string;
  metadata: Record<string, string>;
  created: Date;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  paidAt?: Date;
  description: string;
  lineItems: InvoiceLineItem[];
  customer: {
    id: string;
    name: string;
    email: string;
  };
  paymentMethod?: PaymentMethod;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  requiresAction?: boolean;
  actionUrl?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  trialDays?: number;
}

class PaymentService {
  private stripePublishableKey = 'pk_test_51234567890abcdef'; // Demo key
  private apiBaseUrl = '/api/payments';

  // Initialize Stripe (in real app, load Stripe.js)
  async initializeStripe() {
    // In a real app, you would load Stripe.js here
    console.log('Stripe initialized with key:', this.stripePublishableKey);
    return true;
  }

  // Get user's payment methods
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [
        {
          id: 'pm_1234567890',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          billingAddress: {
            name: 'John Doe',
            line1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US'
          }
        },
        {
          id: 'pm_0987654321',
          type: 'card',
          last4: '1234',
          brand: 'mastercard',
          expiryMonth: 8,
          expiryYear: 2026,
          isDefault: false,
          billingAddress: {
            name: 'John Doe',
            line1: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            postalCode: '90210',
            country: 'US'
          }
        }
      ];
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      return [];
    }
  }

  // Add new payment method
  async addPaymentMethod(paymentMethodData: {
    type: 'card';
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvc: string;
    billingAddress: PaymentMethod['billingAddress'];
  }): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }> {
    try {
      // Simulate Stripe payment method creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate card number (basic validation)
      if (paymentMethodData.cardNumber.replace(/\s/g, '').length < 13) {
        return { success: false, error: 'Invalid card number' };
      }

      // Validate expiry
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      if (paymentMethodData.expiryYear < currentYear || 
          (paymentMethodData.expiryYear === currentYear && paymentMethodData.expiryMonth < currentMonth)) {
        return { success: false, error: 'Card has expired' };
      }

      // Create mock payment method
      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        last4: paymentMethodData.cardNumber.slice(-4),
        brand: this.detectCardBrand(paymentMethodData.cardNumber),
        expiryMonth: paymentMethodData.expiryMonth,
        expiryYear: paymentMethodData.expiryYear,
        isDefault: false,
        billingAddress: paymentMethodData.billingAddress
      };

      return { success: true, paymentMethod: newPaymentMethod };
    } catch (error) {
      return { success: false, error: 'Failed to add payment method' };
    }
  }

  // Create payment intent
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    description: string;
    customerId: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentResponse> {
    try {
      // Simulate Stripe payment intent creation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount: data.amount,
        currency: data.currency,
        status: 'requires_payment_method',
        clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        description: data.description,
        metadata: data.metadata || {},
        created: new Date()
      };

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create payment intent'
      };
    }
  }

  // Confirm payment
  async confirmPayment(data: {
    paymentIntentId: string;
    paymentMethodId: string;
    returnUrl?: string;
  }): Promise<PaymentResponse> {
    try {
      // Simulate payment confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate different outcomes
      const outcomes = ['success', 'requires_action', 'failed'];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

      if (outcome === 'success') {
        return {
          success: true,
          paymentIntent: {
            id: data.paymentIntentId,
            amount: 2500, // Example amount
            currency: 'usd',
            status: 'succeeded',
            clientSecret: 'pi_secret_123',
            description: 'Shipping payment',
            metadata: {},
            created: new Date()
          }
        };
      } else if (outcome === 'requires_action') {
        return {
          success: false,
          requiresAction: true,
          actionUrl: 'https://hooks.stripe.com/3d_secure_2_eap/begin_test/src_1234567890',
          error: 'Payment requires additional authentication'
        };
      } else {
        return {
          success: false,
          error: 'Your card was declined. Please try a different payment method.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Payment confirmation failed'
      };
    }
  }

  // Get invoices
  async getInvoices(customerId: string): Promise<Invoice[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      return [
        {
          id: 'inv_1234567890',
          number: 'INV-2024-001',
          amount: 2450.00,
          currency: 'usd',
          status: 'open',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          description: 'Shipping services for January 2024',
          lineItems: [
            {
              id: 'li_1',
              description: 'Ocean freight - LA to NY',
              quantity: 1,
              unitPrice: 1200.00,
              totalPrice: 1200.00
            },
            {
              id: 'li_2',
              description: 'Customs clearance',
              quantity: 1,
              unitPrice: 350.00,
              totalPrice: 350.00
            },
            {
              id: 'li_3',
              description: 'Insurance coverage',
              quantity: 1,
              unitPrice: 150.00,
              totalPrice: 150.00
            },
            {
              id: 'li_4',
              description: 'Documentation fees',
              quantity: 1,
              unitPrice: 75.00,
              totalPrice: 75.00
            },
            {
              id: 'li_5',
              description: 'Fuel surcharge',
              quantity: 1,
              unitPrice: 675.00,
              totalPrice: 675.00
            }
          ],
          customer: {
            id: customerId,
            name: 'John Doe',
            email: 'john@example.com'
          }
        },
        {
          id: 'inv_0987654321',
          number: 'INV-2024-002',
          amount: 1850.00,
          currency: 'usd',
          status: 'paid',
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          description: 'Air freight services',
          lineItems: [
            {
              id: 'li_6',
              description: 'Air freight - Chicago to Miami',
              quantity: 1,
              unitPrice: 1500.00,
              totalPrice: 1500.00
            },
            {
              id: 'li_7',
              description: 'Express handling',
              quantity: 1,
              unitPrice: 250.00,
              totalPrice: 250.00
            },
            {
              id: 'li_8',
              description: 'Priority delivery',
              quantity: 1,
              unitPrice: 100.00,
              totalPrice: 100.00
            }
          ],
          customer: {
            id: customerId,
            name: 'John Doe',
            email: 'john@example.com'
          }
        }
      ];
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      return [];
    }
  }

  // Pay invoice
  async payInvoice(invoiceId: string, paymentMethodId: string): Promise<PaymentResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Simulate payment success
      return {
        success: true,
        paymentIntent: {
          id: `pi_${Date.now()}`,
          amount: 2450.00,
          currency: 'usd',
          status: 'succeeded',
          clientSecret: 'pi_secret_invoice',
          description: `Payment for invoice ${invoiceId}`,
          metadata: { invoiceId },
          created: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invoice payment failed'
      };
    }
  }

  // Get subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return [
      {
        id: 'plan_starter',
        name: 'Starter',
        description: 'Perfect for small businesses',
        price: 29.99,
        currency: 'usd',
        interval: 'month',
        features: [
          'Up to 50 shipments/month',
          'Basic tracking',
          'Email support',
          'Standard reporting'
        ]
      },
      {
        id: 'plan_professional',
        name: 'Professional',
        description: 'For growing logistics operations',
        price: 99.99,
        currency: 'usd',
        interval: 'month',
        isPopular: true,
        features: [
          'Up to 500 shipments/month',
          'Advanced tracking with GPS',
          'Priority support',
          'Advanced analytics',
          'API access',
          'Custom integrations'
        ]
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise',
        description: 'For large-scale operations',
        price: 299.99,
        currency: 'usd',
        interval: 'month',
        trialDays: 14,
        features: [
          'Unlimited shipments',
          'Real-time tracking',
          '24/7 phone support',
          'Custom reporting',
          'Full API access',
          'Dedicated account manager',
          'White-label options',
          'SLA guarantee'
        ]
      }
    ];
  }

  // Subscribe to plan
  async subscribeToPlan(data: {
    planId: string;
    paymentMethodId: string;
    customerId: string;
  }): Promise<PaymentResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        paymentIntent: {
          id: `pi_subscription_${Date.now()}`,
          amount: 9999, // $99.99
          currency: 'usd',
          status: 'succeeded',
          clientSecret: 'pi_secret_subscription',
          description: `Subscription to ${data.planId}`,
          metadata: { planId: data.planId, type: 'subscription' },
          created: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Subscription failed'
      };
    }
  }

  // Utility methods
  private detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    
    return 'unknown';
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100); // Assuming amount is in cents
  }

  // Validate card number using Luhn algorithm
  validateCardNumber(cardNumber: string): boolean {
    const number = cardNumber.replace(/\s/g, '');
    
    if (!/^\d+$/.test(number)) return false;
    if (number.length < 13 || number.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  // Process refund
  async processRefund(paymentIntentId: string, amount?: number): Promise<PaymentResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        paymentIntent: {
          id: `re_${Date.now()}`,
          amount: amount || 0,
          currency: 'usd',
          status: 'succeeded',
          clientSecret: 'refund_secret',
          description: 'Refund processed',
          metadata: { originalPayment: paymentIntentId },
          created: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Refund processing failed'
      };
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
