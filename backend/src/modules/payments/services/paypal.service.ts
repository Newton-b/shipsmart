import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string;
  private tokenExpiry: Date;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    this.baseUrl = this.configService.get<string>('PAYPAL_BASE_URL', 'https://api-m.sandbox.paypal.com');
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      this.logger.warn('PayPal credentials not configured, using mock implementation');
      return 'mock_access_token';
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));

      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get PayPal access token:', error);
      throw new Error('PayPal authentication failed');
    }
  }

  async createOrder(
    amount: number,
    currency: string = 'USD',
    metadata?: Record<string, any>
  ): Promise<PayPalOrderResponse> {
    if (!this.clientId || !this.clientSecret) {
      // Mock implementation for development
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

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`PayPal order created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create PayPal order:', error);
      throw new Error('Failed to create PayPal order');
    }
  }

  async captureOrder(orderId: string): Promise<PayPalCaptureResponse> {
    if (!this.clientId || !this.clientSecret) {
      // Mock implementation for development
      return this.captureMockOrder(orderId);
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`PayPal order captured: ${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to capture PayPal order ${orderId}:`, error);
      throw new Error('Failed to capture PayPal order');
    }
  }

  async refundCapture(
    captureId: string,
    amount?: number,
    currency: string = 'USD'
  ): Promise<any> {
    if (!this.clientId || !this.clientSecret) {
      // Mock implementation for development
      return this.createMockRefund(captureId, amount, currency);
    }

    try {
      const accessToken = await this.getAccessToken();

      const refundData: any = {};
      if (amount) {
        refundData.amount = {
          currency_code: currency,
          value: amount.toFixed(2),
        };
      }

      const response = await axios.post(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        refundData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`PayPal refund created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to refund PayPal capture ${captureId}:`, error);
      throw new Error('Failed to create PayPal refund');
    }
  }

  async getOrderDetails(orderId: string): Promise<any> {
    if (!this.clientId || !this.clientSecret) {
      // Mock implementation for development
      return this.getMockOrderDetails(orderId);
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get PayPal order details ${orderId}:`, error);
      throw new Error('Failed to get PayPal order details');
    }
  }

  // Mock implementations for development
  private createMockOrder(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): PayPalOrderResponse {
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

  private captureMockOrder(orderId: string): PayPalCaptureResponse {
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

  private createMockRefund(captureId: string, amount?: number, currency: string = 'USD') {
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

  private getMockOrderDetails(orderId: string) {
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
}
