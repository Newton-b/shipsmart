import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable, Subject, interval } from 'rxjs';
import { map } from 'rxjs/operators';

// Import from our entities
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationPreferencesEntity } from '../entities/notification-preferences.entity';

export interface NotificationFilters {
  type?: string;
  priority?: string;
  status?: string;
  recipient?: string;
  unreadOnly?: boolean;
  page: number;
  limit: number;
}

export interface CreateNotificationDto {
  type: 'shipment_update' | 'delivery_alert' | 'customs_clearance' | 'document_required' | 'payment_due' | 'system_alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: { [key: string]: any };
  recipients: string[];
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  scheduledAt?: Date;
  expiresAt?: Date;
  createdBy: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: {
    shipmentUpdates: boolean;
    deliveryAlerts: boolean;
    customsClearance: boolean;
    documentRequired: boolean;
    paymentDue: boolean;
    systemAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

@Injectable()
export class NotificationSimpleService {
  private readonly logger = new Logger(NotificationSimpleService.name);
  private notificationStreams = new Map<string, Subject<any>>();
  private readonly SSE_PING_INTERVAL = 30000; // 30 seconds

  constructor(
    @InjectModel(NotificationEntity.name) private notificationModel: Model<NotificationEntity>,
    @InjectModel(NotificationPreferencesEntity.name) private preferencesModel: Model<NotificationPreferencesEntity>,
  ) {}

  // Create a new notification
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<any> {
    try {
      const notification = new this.notificationModel({
        ...createNotificationDto,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedNotification = await notification.save();
      
      // Emit to real-time streams
      this.emitToRecipients(savedNotification.toObject());
      
      // Process notification delivery
      await this.processNotificationDelivery(savedNotification.toObject());
      
      return savedNotification.toObject();
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Get notifications with filters and pagination
  async getNotifications(filters: NotificationFilters) {
    try {
      const { type, priority, status, recipient, unreadOnly, page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};
      
      if (type) query.type = type;
      if (priority) query.priority = priority;
      if (status) query.status = status;
      if (recipient) query.recipients = { $in: [recipient] };
      if (unreadOnly) query.readAt = { $exists: false };

      const [notifications, total] = await Promise.all([
        this.notificationModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.notificationModel.countDocuments(query),
      ]);

      return {
        data: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Get notification by ID
  async getNotificationById(id: string): Promise<any> {
    try {
      const notification = await this.notificationModel.findById(id).lean();
      if (!notification) {
        throw new Error('Notification not found');
      }
      return notification;
    } catch (error) {
      this.logger.error(`Failed to get notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(id: string, userId: string): Promise<any> {
    try {
      const notification = await this.notificationModel.findOneAndUpdate(
        { _id: id, recipients: { $in: [userId] } },
        { $set: { status: 'read', readAt: new Date() } },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found or user not authorized');
      }

      return notification.toObject();
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(ids: string[], userId: string): Promise<{ count: number }> {
    try {
      const result = await this.notificationModel.updateMany(
        { _id: { $in: ids }, recipients: { $in: [userId] } },
        { $set: { status: 'read', readAt: new Date() } }
      );

      return { count: result.modifiedCount };
    } catch (error) {
      this.logger.error(`Failed to mark notifications as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(id: string, userId: string): Promise<{ success: boolean }> {
    try {
      const result = await this.notificationModel.deleteOne({
        _id: id,
        $or: [
          { createdBy: userId },
          { recipients: { $in: [userId] } }
        ]
      });

      if (result.deletedCount === 0) {
        throw new Error('Notification not found or user not authorized');
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Get user notification preferences
  async getNotificationPreferences(userId: string): Promise<any> {
    try {
      let preferences = await this.preferencesModel.findOne({ userId }).lean();
      
      if (!preferences) {
        // Create default preferences if not exists
        preferences = await this.preferencesModel.create({
          userId,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          inAppNotifications: true,
          notificationTypes: {
            shipmentUpdates: true,
            deliveryAlerts: true,
            customsClearance: true,
            documentRequired: true,
            paymentDue: true,
            systemAlerts: false,
          },
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
            timezone: 'UTC',
          },
          frequency: 'immediate',
        });
      }

      return preferences;
    } catch (error) {
      this.logger.error(`Failed to get notification preferences: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Update user notification preferences
  async updateNotificationPreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<any> {
    try {
      const preferences = await this.preferencesModel.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return preferences.toObject();
    } catch (error) {
      this.logger.error(`Failed to update notification preferences: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string): Observable<any> {
    if (!this.notificationStreams.has(userId)) {
      this.notificationStreams.set(userId, new Subject<any>());
    }

    // Add ping to keep connection alive
    const ping$ = interval(this.SSE_PING_INTERVAL).pipe(
      map(() => ({
        type: 'ping',
        timestamp: new Date().toISOString(),
      }))
    );

    return new Observable<any>(subscriber => {
      const userStream = this.notificationStreams.get(userId);
      
      if (userStream) {
        const subscription = userStream.subscribe(subscriber);
        
        // Send initial ping
        subscriber.next({
          type: 'connected',
          timestamp: new Date().toISOString(),
        });
        
        // Set up periodic pings
        const pingInterval = setInterval(() => {
          subscriber.next({
            type: 'ping',
            timestamp: new Date().toISOString(),
          });
        }, this.SSE_PING_INTERVAL);
        
        return () => {
          subscription.unsubscribe();
          clearInterval(pingInterval);
          
          // Clean up if no more subscribers
          if (userStream.observers.length === 0) {
            this.notificationStreams.delete(userId);
          }
        };
      }
      
      return () => {};
    });
  }

  // Emit notification to specific recipients
  private emitToRecipients(notification: any): void {
    try {
      // Emit to all recipients who are currently connected
      for (const recipient of notification.recipients) {
        const userStream = this.notificationStreams.get(recipient);
        if (userStream) {
          userStream.next({
            type: 'notification',
            data: notification,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      this.logger.error(`Failed to emit notification to recipients: ${error.message}`, error.stack);
    }
  }

  // Process notification delivery based on channels
  private async processNotificationDelivery(notification: any): Promise<void> {
    try {
      // Get all recipients' preferences
      const preferences = await this.preferencesModel.find({
        userId: { $in: notification.recipients }
      });

      const preferencesMap = new Map(
        preferences.map(p => [p.userId, p])
      );

      // Process each recipient
      for (const recipient of notification.recipients) {
        const userPrefs = preferencesMap.get(recipient) || {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          inAppNotifications: true,
        };
        
        // Filter channels based on user preferences
        const channelsToUse = notification.channels.filter(channel => {
          switch (channel) {
            case 'email':
              return userPrefs.emailNotifications !== false;
            case 'sms':
              return userPrefs.smsNotifications !== false;
            case 'push':
              return userPrefs.pushNotifications !== false;
            case 'in_app':
              return userPrefs.inAppNotifications !== false;
            default:
              return false;
          }
        });

        // Skip if no channels are enabled
        if (channelsToUse.length === 0) continue;

        // Log delivery (in production, implement actual delivery)
        this.logger.log(`Delivering notification ${notification._id} to ${recipient} via ${channelsToUse.join(', ')}`);
      }

      // Update notification status
      await this.notificationModel.updateOne(
        { _id: notification._id },
        { $set: { status: 'sent', sentAt: new Date() } }
      );
    } catch (error) {
      this.logger.error(`Failed to process notification delivery: ${error.message}`, error.stack);
      
      // Update notification status to failed
      await this.notificationModel.updateOne(
        { _id: notification._id },
        { $set: { status: 'failed' } }
      );
    }
  }
}
