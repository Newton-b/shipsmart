import { PaymentMethod, PaymentType } from '../entities/payment.entity';
export declare class CreatePaymentDto {
    amount: number;
    currency?: string;
    paymentMethod: PaymentMethod;
    paymentType?: PaymentType;
    description?: string;
    userId: string;
    shipmentId?: string;
    billingName?: string;
    billingEmail?: string;
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;
    billingPostalCode?: string;
    billingCountry?: string;
    metadata?: Record<string, any>;
}
