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
var PayPalService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let PayPalService = PayPalService_1 = class PayPalService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PayPalService_1.name);
        this.clientId = this.configService.get('PAYPAL_CLIENT_ID');
        this.clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');
        this.baseUrl = this.configService.get('PAYPAL_BASE_URL', 'https://api-m.sandbox.paypal.com');
    }
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }
        if (!this.clientId || !this.clientSecret) {
            this.logger.warn('PayPal credentials not configured, using mock implementation');
            return 'mock_access_token';
        }
        try {
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            const response = await axios_1.default.post(`${this.baseUrl}/v1/oauth2/token`, 'grant_type=client_credentials', {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
            return this.accessToken;
        }
        catch (error) {
            this.logger.error('Failed to get PayPal access token:', error);
            throw new Error('PayPal authentication failed');
        }
    }
    async createOrder(amount, currency = 'USD', metadata) {
        if (!this.clientId || !this.clientSecret) {
            return this.createMockOrder(amount, currency, metadata);
        }
        try {
            const accessToken = await this.getAccessToken();
            const orderData = {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency,
                            value: amount.toFixed(2),
                        },
                        custom_id: metadata?.paymentId,
                        description: metadata?.description || 'ShipSmart Payment',
                    },
                ],
                application_context: {
                    return_url: `${this.configService.get('FRONTEND_URL')}/payment/success`,
                    cancel_url: `${this.configService.get('FRONTEND_URL')}/payment/cancel`,
                    brand_name: 'ShipSmart',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                },
            };
            const response = await axios_1.default.post(`${this.baseUrl}/v2/checkout/orders`, orderData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`PayPal order created: ${response.data.id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create PayPal order:', error);
            throw new Error('Failed to create PayPal order');
        }
    }
    async captureOrder(orderId) {
        if (!this.clientId || !this.clientSecret) {
            return this.captureMockOrder(orderId);
        }
        try {
            const accessToken = await this.getAccessToken();
            const response = await axios_1.default.post(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {}, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`PayPal order captured: ${orderId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to capture PayPal order ${orderId}:`, error);
            throw new Error('Failed to capture PayPal order');
        }
    }
    async refundCapture(captureId, amount, currency = 'USD') {
        if (!this.clientId || !this.clientSecret) {
            return this.createMockRefund(captureId, amount, currency);
        }
        try {
            const accessToken = await this.getAccessToken();
            const refundData = {};
            if (amount) {
                refundData.amount = {
                    currency_code: currency,
                    value: amount.toFixed(2),
                };
            }
            const response = await axios_1.default.post(`${this.baseUrl}/v2/payments/captures/${captureId}/refund`, refundData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`PayPal refund created: ${response.data.id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to refund PayPal capture ${captureId}:`, error);
            throw new Error('Failed to create PayPal refund');
        }
    }
    async getOrderDetails(orderId) {
        if (!this.clientId || !this.clientSecret) {
            return this.getMockOrderDetails(orderId);
        }
        try {
            const accessToken = await this.getAccessToken();
            const response = await axios_1.default.get(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get PayPal order details ${orderId}:`, error);
            throw new Error('Failed to get PayPal order details');
        }
    }
    createMockOrder(amount, currency, metadata) {
        const orderId = `MOCK_ORDER_${Date.now()}`;
        this.logger.log(`Mock PayPal order created: ${orderId} for $${amount} ${currency}`);
        return {
            id: orderId,
            status: 'CREATED',
            links: [
                {
                    href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
                    rel: 'approve',
                    method: 'GET',
                },
                {
                    href: `${this.baseUrl}/v2/checkout/orders/${orderId}`,
                    rel: 'self',
                    method: 'GET',
                },
            ],
        };
    }
    captureMockOrder(orderId) {
        const captureId = `MOCK_CAPTURE_${Date.now()}`;
        this.logger.log(`Mock PayPal order captured: ${orderId}`);
        return {
            id: orderId,
            status: 'COMPLETED',
            purchase_units: [
                {
                    payments: {
                        captures: [
                            {
                                id: captureId,
                                status: 'COMPLETED',
                                amount: {
                                    currency_code: 'USD',
                                    value: '100.00',
                                },
                            },
                        ],
                    },
                },
            ],
        };
    }
    createMockRefund(captureId, amount, currency = 'USD') {
        const refundId = `MOCK_REFUND_${Date.now()}`;
        this.logger.log(`Mock PayPal refund created: ${refundId} for capture ${captureId}`);
        return {
            id: refundId,
            status: 'COMPLETED',
            amount: {
                currency_code: currency,
                value: amount ? amount.toFixed(2) : '100.00',
            },
        };
    }
    getMockOrderDetails(orderId) {
        this.logger.log(`Mock PayPal order details retrieved: ${orderId}`);
        return {
            id: orderId,
            status: 'APPROVED',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: '100.00',
                    },
                },
            ],
        };
    }
};
exports.PayPalService = PayPalService;
exports.PayPalService = PayPalService = PayPalService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PayPalService);
//# sourceMappingURL=paypal.service.js.map