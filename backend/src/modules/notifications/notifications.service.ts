import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

import { 
  Notification, 
  NotificationDocument, 
  NotificationType, 
  NotificationPriority, 
  NotificationStatus 
} from './schemas/notification.schema';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { EmailService } from '../email/email.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly webSocketGateway: WebSocketGateway,
    private readonly emailService: EmailService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedNotification = await notification.save();

    // Send real-time notification via WebSocket
    this.webSocketGateway.sendNotificationToUser(
      createNotificationDto.userId,
      savedNotification.toObject()
    );

    // Send email notification if requested
    if (createNotificationDto.sendEmail) {
      this.sendEmailNotification(savedNotification);
    }

    // Send push notification if requested
    if (createNotificationDto.sendPush) {
      this.sendPushNotification(savedNotification);
    }

    this.logger.log(`Notification created: ${savedNotification._id} for user: ${createNotificationDto.userId}`);
    return savedNotification;
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: NotificationStatus,
    type?: NotificationType
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    unreadCount: number;
  }> {
    const query: any = { userId };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(query),
      this.notificationModel.countDocuments({ 
        userId, 
        status: NotificationStatus.UNREAD 
      }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      unreadCount,
    };
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findOne({ _id: id, userId })
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: id, userId },
        { 
          status: NotificationStatus.READ,
          readAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Broadcast updated unread count
    const unreadCount = await this.getUnreadCount(userId);
    this.webSocketGateway.sendUnreadCountToUser(userId, unreadCount);

    return notification;
  }

  async markAsUnread(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: id, userId },
        { 
          status: NotificationStatus.UNREAD,
          readAt: null,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Broadcast updated unread count
    const unreadCount = await this.getUnreadCount(userId);
    this.webSocketGateway.sendUnreadCountToUser(userId, unreadCount);

    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel
      .updateMany(
        { userId, status: NotificationStatus.UNREAD },
        { 
          status: NotificationStatus.READ,
          readAt: new Date(),
          updatedAt: new Date(),
        }
      )
      .exec();

    // Broadcast updated unread count (should be 0)
    this.webSocketGateway.sendUnreadCountToUser(userId, 0);

    return { modifiedCount: result.modifiedCount };
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.notificationModel
      .deleteOne({ _id: id, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }
  }

  async deleteAll(userId: string, status?: NotificationStatus): Promise<{ deletedCount: number }> {
    const query: any = { userId };
    
    if (status) {
      query.status = status;
    }

    const result = await this.notificationModel
      .deleteMany(query)
      .exec();

    return { deletedCount: result.deletedCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({ 
        userId, 
        status: NotificationStatus.UNREAD 
      })
      .exec();
  }

  async createShipmentNotification(
    userId: string,
    shipmentId: string,
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    data?: Record<string, any>
  ): Promise<Notification> {
    return this.create({
      userId,
      type,
      priority,
      title,
      message,
      shipmentId,
      data: data || {},
      sendEmail: priority === NotificationPriority.HIGH || priority === NotificationPriority.CRITICAL,
      sendPush: true,
      actionUrl: `/shipments/${shipmentId}`,
      actionText: 'View Shipment',
      icon: 'package',
    });
  }

  async createPaymentNotification(
    userId: string,
    paymentId: string,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    data?: Record<string, any>
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.PAYMENT_CONFIRMATION,
      priority,
      title,
      message,
      paymentId,
      data: data || {},
      sendEmail: true,
      sendPush: true,
      actionUrl: `/payments/${paymentId}`,
      actionText: 'View Payment',
      icon: 'credit-card',
    });
  }

  async createSystemAlert(
    userId: string,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.HIGH,
    data?: Record<string, any>
  ): Promise<Notification> {
    return this.create({
      userId,
      type: NotificationType.SYSTEM_ALERT,
      priority,
      title,
      message,
      data: data || {},
      sendEmail: priority === NotificationPriority.CRITICAL,
      sendPush: true,
      icon: 'alert-triangle',
    });
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      await this.emailService.sendNotificationEmail(
        notification.userId,
        notification.title,
        notification.message,
        notification.actionUrl
      );

      await this.notificationModel
        .updateOne(
          { _id: notification._id },
          { emailSent: true }
        )
        .exec();

      this.logger.log(`Email notification sent for: ${notification._id}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${notification._id}`, error);
    }
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // Push notification implementation would go here
      // For now, just mark as sent
      await this.notificationModel
        .updateOne(
          { _id: notification._id },
          { pushSent: true }
        )
        .exec();

      this.logger.log(`Push notification sent for: ${notification._id}`);
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${notification._id}`, error);
    }
  }

  // Clean up expired notifications
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const result = await this.notificationModel
        .deleteMany({
          expiresAt: { $lt: new Date() }
        })
        .exec();

      if (result.deletedCount > 0) {
        this.logger.log(`Cleaned up ${result.deletedCount} expired notifications`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup expired notifications:', error);
    }
  }

  // Generate mock notifications for development
  async generateMockNotifications(userId: string, count: number = 5): Promise<Notification[]> {
    const mockNotifications = [];
    const types = Object.values(NotificationType);
    const priorities = Object.values(NotificationPriority);

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      const notification = await this.create({
        userId,
        type,
        priority,
        title: `Mock ${type.replace('_', ' ')} notification`,
        message: `This is a mock notification of type ${type} with ${priority} priority`,
        data: { mock: true, timestamp: new Date().toISOString() },
        sendEmail: false,
        sendPush: false,
      });

      mockNotifications.push(notification);
    }

    return mockNotifications;
  }
}
