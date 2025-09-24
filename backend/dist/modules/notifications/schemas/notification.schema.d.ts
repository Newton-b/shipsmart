import { Document } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare enum NotificationType {
    SHIPMENT_UPDATE = "shipment_update",
    DELIVERY_ALERT = "delivery_alert",
    PAYMENT_CONFIRMATION = "payment_confirmation",
    SYSTEM_ALERT = "system_alert",
    CARRIER_UPDATE = "carrier_update",
    WEATHER_ALERT = "weather_alert",
    DELAY_NOTIFICATION = "delay_notification",
    CUSTOMS_CLEARANCE = "customs_clearance"
}
export declare enum NotificationPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum NotificationStatus {
    UNREAD = "unread",
    READ = "read",
    ARCHIVED = "archived"
}
export declare class Notification {
    _id: string;
    userId: string;
    type: NotificationType;
    priority: NotificationPriority;
    status: NotificationStatus;
    title: string;
    message: string;
    data: Record<string, any>;
    shipmentId?: string;
    paymentId?: string;
    actionUrl?: string;
    actionText?: string;
    icon?: string;
    sendEmail: boolean;
    sendPush: boolean;
    emailSent: boolean;
    pushSent: boolean;
    readAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification> & Notification & Required<{
    _id: string;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>> & import("mongoose").FlatRecord<Notification> & Required<{
    _id: string;
}>>;
