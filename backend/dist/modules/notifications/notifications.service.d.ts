import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType, NotificationPriority, NotificationStatus } from './schemas/notification.schema';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { EmailService } from '../email/email.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsService {
    private readonly notificationModel;
    private readonly webSocketGateway;
    private readonly emailService;
    private readonly logger;
    constructor(notificationModel: Model<NotificationDocument>, webSocketGateway: WebSocketGateway, emailService: EmailService);
    create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    findAll(userId: string, page?: number, limit?: number, status?: NotificationStatus, type?: NotificationType): Promise<{
        notifications: Notification[];
        total: number;
        page: number;
        limit: number;
        unreadCount: number;
    }>;
    findOne(id: string, userId: string): Promise<Notification>;
    markAsRead(id: string, userId: string): Promise<Notification>;
    markAsUnread(id: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<{
        modifiedCount: number;
    }>;
    delete(id: string, userId: string): Promise<void>;
    deleteAll(userId: string, status?: NotificationStatus): Promise<{
        deletedCount: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    createShipmentNotification(userId: string, shipmentId: string, type: NotificationType, title: string, message: string, priority?: NotificationPriority, data?: Record<string, any>): Promise<Notification>;
    createPaymentNotification(userId: string, paymentId: string, title: string, message: string, priority?: NotificationPriority, data?: Record<string, any>): Promise<Notification>;
    createSystemAlert(userId: string, title: string, message: string, priority?: NotificationPriority, data?: Record<string, any>): Promise<Notification>;
    private sendEmailNotification;
    private sendPushNotification;
    cleanupExpiredNotifications(): Promise<void>;
    generateMockNotifications(userId: string, count?: number): Promise<Notification[]>;
}
