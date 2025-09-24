import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!secretKey) {
      this.logger.warn('Stripe secret key not configured - payments will be mocked');
      return;
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    this.logger.log('✅ Stripe service initialized');
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Payment intent created: ${paymentIntent.id} for $${amount}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create payment intent:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        paymentMethodId ? { payment_method: paymentMethodId } : undefined,
      );

      this.logger.log(`Payment intent confirmed: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to confirm payment intent:', error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to retrieve payment intent:', error);
      throw new BadRequestException('Payment not found');
    }
  }

  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Customer> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: metadata || {},
      });

      this.logger.log(`Customer created: ${customer.id} (${email})`);
      return customer;
    } catch (error) {
      this.logger.error('Failed to create customer:', error);
      throw new BadRequestException('Failed to create customer');
    }
  }

  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Setup intent created: ${setupIntent.id} for customer ${customerId}`);
      return setupIntent;
    } catch (error) {
      this.logger.error('Failed to create setup intent:', error);
      throw new BadRequestException('Failed to create setup intent');
    }
  }

  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      this.logger.error('Failed to list payment methods:', error);
      throw new BadRequestException('Failed to retrieve payment methods');
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason,
  ): Promise<Stripe.Refund> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason,
      });

      this.logger.log(`Refund created: ${refund.id} for payment ${paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error('Failed to create refund:', error);
      throw new BadRequestException('Failed to process refund');
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<Stripe.Event> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      this.logger.log(`Webhook received: ${event.type}`);
      return event;
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  // Mock methods for development when Stripe is not configured
  async mockPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>,
  ): Promise<any> {
    const mockPaymentIntent = {
      id: `pi_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      client_secret: `pi_mock_${Date.now()}_secret_mock`,
      metadata: metadata || {},
      created: Math.floor(Date.now() / 1000),
    };

    this.logger.log(`Mock payment intent created: ${mockPaymentIntent.id} for $${amount}`);
    return mockPaymentIntent;
  }

  async mockConfirmPayment(paymentIntentId: string): Promise<any> {
    const mockConfirmedPayment = {
      id: paymentIntentId,
      status: 'succeeded',
      amount_received: 1000, // Mock amount
      currency: 'usd',
      created: Math.floor(Date.now() / 1000),
    };

    this.logger.log(`Mock payment confirmed: ${paymentIntentId}`);
    return mockConfirmedPayment;
  }
}
