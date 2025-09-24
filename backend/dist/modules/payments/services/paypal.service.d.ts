import { ConfigService } from '@nestjs/config';
export interface PayPalOrderResponse {
    id: string;
    status: string;
    links: Array<{
        href: string;
        rel: string;
        method: string;
    }>;
}
export interface PayPalCaptureResponse {
    id: string;
    status: string;
    purchase_units: Array<{
        payments: {
            captures: Array<{
                id: string;
                status: string;
                amount: {
                    currency_code: string;
                    value: string;
                };
            }>;
        };
    }>;
}
export declare class PayPalService {
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly clientId;
    private readonly clientSecret;
    private accessToken;
    private tokenExpiry;
    constructor(configService: ConfigService);
    private getAccessToken;
    createOrder(amount: number, currency?: string, metadata?: Record<string, any>): Promise<PayPalOrderResponse>;
    captureOrder(orderId: string): Promise<PayPalCaptureResponse>;
    refundCapture(captureId: string, amount?: number, currency?: string): Promise<any>;
    getOrderDetails(orderId: string): Promise<any>;
    private createMockOrder;
    private captureMockOrder;
    private createMockRefund;
    private getMockOrderDetails;
}
