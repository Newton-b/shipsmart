import { Shipment } from './shipment.entity';
export declare enum TrackingEventType {
    CREATED = "created",
    CONFIRMED = "confirmed",
    PICKED_UP = "picked_up",
    DEPARTED = "departed",
    ARRIVED = "arrived",
    IN_TRANSIT = "in_transit",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    EXCEPTION = "exception",
    DELAYED = "delayed",
    CANCELLED = "cancelled",
    RETURNED = "returned"
}
export declare class TrackingEvent {
    id: string;
    eventType: TrackingEventType;
    description: string;
    location?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    eventDate: Date;
    timezone?: string;
    carrierEventCode?: string;
    details?: Record<string, any>;
    source: string;
    isException: boolean;
    exceptionReason?: string;
    shipment: Shipment;
    shipmentId: string;
    createdAt: Date;
    get fullLocation(): string;
    get isDeliveryEvent(): boolean;
    get isExceptionEvent(): boolean;
}
