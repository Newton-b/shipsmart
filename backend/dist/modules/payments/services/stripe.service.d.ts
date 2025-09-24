import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export declare class StripeService {
    private readonly configService;
    private readonly stripe;
    private readonly logger;
    constructor(configService: ConfigService);
    createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, string>): Promise<Stripe.PaymentIntent>;
    confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent>;
    retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    createCustomer(email: string, name?: string, metadata?: Record<string, string>): Promise<Stripe.Customer>;
    createSetupIntent(customerId: string): Promise<Stripe.SetupIntent>;
    listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]>;
    createRefund(paymentIntentId: string, amount?: number, reason?: Stripe.RefundCreateParams.Reason): Promise<Stripe.Refund>;
    handleWebhook(payload: string, signature: string): Promise<Stripe.Event>;
    mockPaymentIntent(amount: number, currency?: string, metadata?: Record<string, string>): Promise<any>;
    mockConfirmPayment(paymentIntentId: string): Promise<any>;
}
