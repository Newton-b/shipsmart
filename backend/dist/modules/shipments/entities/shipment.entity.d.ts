import { User } from '../../users/entities/user.entity';
import { TrackingEvent } from './tracking-event.entity';
export declare enum ShipmentStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    EXCEPTION = "exception",
    CANCELLED = "cancelled"
}
export declare enum ShipmentType {
    OCEAN = "ocean",
    AIR = "air",
    GROUND = "ground",
    EXPRESS = "express"
}
export declare enum ShipmentPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare class Shipment {
    id: string;
    trackingNumber: string;
    status: ShipmentStatus;
    type: ShipmentType;
    priority: ShipmentPriority;
    carrier: string;
    serviceType?: string;
    senderName: string;
    senderCompany?: string;
    senderAddress: string;
    senderCity: string;
    senderState: string;
    senderPostalCode: string;
    senderCountry: string;
    senderPhone?: string;
    senderEmail?: string;
    recipientName: string;
    recipientCompany?: string;
    recipientAddress: string;
    recipientCity: string;
    recipientState: string;
    recipientPostalCode: string;
    recipientCountry: string;
    recipientPhone?: string;
    recipientEmail?: string;
    description?: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
    value?: number;
    pieces: number;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    pickupDate?: Date;
    shipDate?: Date;
    shippingCost?: number;
    insuranceCost?: number;
    totalCost?: number;
    specialInstructions?: string;
    referenceNumber?: string;
    isFragile: boolean;
    requiresSignature: boolean;
    isInsured: boolean;
    metadata?: Record<string, any>;
    user: User;
    userId: string;
    trackingEvents: TrackingEvent[];
    createdAt: Date;
    updatedAt: Date;
    get fullSenderAddress(): string;
    get fullRecipientAddress(): string;
    get isDelivered(): boolean;
    get isInTransit(): boolean;
    get estimatedDaysRemaining(): number | null;
}
