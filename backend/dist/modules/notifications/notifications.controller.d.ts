import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../users/entities/user.entity';
import { NotificationStatus, NotificationType } from './schemas/notification.schema';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createNotificationDto: CreateNotificationDto): Promise<import("./schemas/notification.schema").Notification>;
    findAll(user: User, page?: number, limit?: number, status?: NotificationStatus, type?: NotificationType): Promise<{
        notifications: import("./schemas/notification.schema").Notification[];
        total: number;
        page: number;
        limit: number;
        unreadCount: number;
    }>;
    getUnreadCount(user: User): Promise<{
        unreadCount: number;
    }>;
    markAllAsRead(user: User): Promise<{
        modifiedCount: number;
    }>;
    deleteAll(user: User, status?: NotificationStatus): Promise<{
        deletedCount: number;
    }>;
    generateMockNotifications(user: User, count: number): Promise<import("./schemas/notification.schema").Notification[]>;
    findOne(id: string, user: User): Promise<import("./schemas/notification.schema").Notification>;
    markAsRead(id: string, user: User): Promise<import("./schemas/notification.schema").Notification>;
    markAsUnread(id: string, user: User): Promise<import("./schemas/notification.schema").Notification>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
}
