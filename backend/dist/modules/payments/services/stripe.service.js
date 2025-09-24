"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
let StripeService = StripeService_1 = class StripeService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StripeService_1.name);
        const secretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!secretKey) {
            this.logger.warn('Stripe secret key not configured - payments will be mocked');
            return;
        }
        this.stripe = new stripe_1.default(secretKey, {
            apiVersion: '2023-10-16',
            typescript: true,
        });
        this.logger.log('✅ Stripe service initialized');
    }
    async createPaymentIntent(amount, currency = 'usd', metadata) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe not configured');
        }
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                metadata: metadata || {},
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            this.logger.log(`Payment intent created: ${paymentIntent.id} for $${amount}`);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error('Failed to create payment intent:', error);
            throw new common_1.BadRequestException('Failed to create payment intent');
        }
    }
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe not configured');
        }
        try {
            const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, paymentMethodId ? { payment_method: paymentMethodId } : undefined);
            this.logger.log(`Payment intent confirmed: ${paymentIntentId}`);
            return paymentIntent;
        }
        catch (error) {
            this.logger.error('Failed to confirm payment intent:', error);
            throw new common_1.BadRequestException('Failed to confirm payment');
        }
    }
    async retrievePaymentIntent(paymentIntentId) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe not configured');
        }
        try {
            return await this.stripe.paymentIntents.retrieve(paymentIntentId);
        }
        catch (error) {
            this.logger.error('Failed to retrieve payment intent:', error);
            throw new common_1.BadRequestException('Payment not found');
        }
    }
    async createCustomer(email, name, metadata) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe not configured');
        }
        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
                metadata: metadata || {},
            });
            this.logger.log(`Customer created: ${customer.id} (${email})`);
            return customer;
        }
        catch (error) {
            this.logger.error('Failed to create customer:', error);
            throw new common_1.BadRequestException('Failed to create customer');
        }
    }
    async createSetupIntent(customerId) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe not configured');
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
        }
        catch (error) {
            this.logger.error('Failed to create setup intent:', error);
            throw new common_1.BadRequestException('Failed to create setup intent');
        }
    }
    async listPaymentMethods(customerId) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe not configured');
        }
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card',
            });
            return paymentMethods.data;
        }
        catch (error) {
            this.logger.error('Failed to list payment methods:', error);
            throw new common_1.BadRequestException('Failed to retrieve payment methods');
        }
    }
    async createRefund(paymentIntentId, amount, reason) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe not configured');
        }
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined,
                reason,
            });
            this.logger.log(`Refund created: ${refund.id} for payment ${paymentIntentId}`);
            return refund;
        }
        catch (error) {
            this.logger.error('Failed to create refund:', error);
            throw new common_1.BadRequestException('Failed to process refund');
        }
    }
    async handleWebhook(payload, signature) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe not configured');
        }
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            this.logger.log(`Webhook received: ${event.type}`);
            return event;
        }
        catch (error) {
            this.logger.error('Webhook signature verification failed:', error);
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
    }
    async mockPaymentIntent(amount, currency = 'usd', metadata) {
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
    async mockConfirmPayment(paymentIntentId) {
        const mockConfirmedPayment = {
            id: paymentIntentId,
            status: 'succeeded',
            amount_received: 1000,
            currency: 'usd',
            created: Math.floor(Date.now() / 1000),
        };
        this.logger.log(`Mock payment confirmed: ${paymentIntentId}`);
        return mockConfirmedPayment;
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map