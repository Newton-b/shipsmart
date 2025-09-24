import { NotificationType, NotificationPriority } from '../schemas/notification.schema';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    priority?: NotificationPriority;
    title: string;
    message: string;
    data?: Record<string, any>;
    shipmentId?: string;
    paymentId?: string;
    actionUrl?: string;
    actionText?: string;
    icon?: string;
    sendEmail?: boolean;
    sendPush?: boolean;
    expiresAt?: Date;
}
