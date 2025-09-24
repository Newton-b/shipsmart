import { User } from '../../users/entities/user.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded",
    PARTIALLY_REFUNDED = "partially_refunded"
}
export declare enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    PAYPAL = "paypal",
    BANK_TRANSFER = "bank_transfer",
    WIRE_TRANSFER = "wire_transfer",
    CHECK = "check",
    CASH = "cash"
}
export declare enum PaymentType {
    SHIPMENT = "shipment",
    SUBSCRIPTION = "subscription",
    REFUND = "refund",
    FEE = "fee",
    ADJUSTMENT = "adjustment"
}
export declare class Payment {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentType: PaymentType;
    description?: string;
    referenceNumber?: string;
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    stripePaymentMethodId?: string;
    paypalOrderId?: string;
    paypalPayerId?: string;
    transactionId?: string;
    authorizationCode?: string;
    processingFee?: number;
    netAmount?: number;
    refundedAmount: number;
    refundReason?: string;
    refundReference?: string;
    billingName?: string;
    billingEmail?: string;
    billingAddress?: string;
    billingCity?: string;
    billingState?: string;
    billingPostalCode?: string;
    billingCountry?: string;
    cardLast4?: string;
    cardBrand?: string;
    cardExpiryMonth?: number;
    cardExpiryYear?: number;
    processedAt?: Date;
    failedAt?: Date;
    refundedAt?: Date;
    errorCode?: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
    user: User;
    userId: string;
    shipment?: Shipment;
    shipmentId?: string;
    createdAt: Date;
    updatedAt: Date;
    get amountInDollars(): number;
    get netAmountInDollars(): number;
    get refundedAmountInDollars(): number;
    get isCompleted(): boolean;
    get isFailed(): boolean;
    get isRefunded(): boolean;
    get canRefund(): boolean;
    get remainingRefundAmount(): number;
}
