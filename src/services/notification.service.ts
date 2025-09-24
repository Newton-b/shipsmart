import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable, Subject, fromEvent, interval } from 'rxjs';
import { map, filter, switchMap, takeUntil } from 'rxjs/operators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification, CreateNotificationDto, NotificationPreferences } from '../controllers/notification.controller';
import { NotificationEntity, NotificationDocument } from '../entities/notification.entity';
import { NotificationPreferencesEntity, NotificationPreferencesDocument } from '../entities/notification-preferences.entity';
import { EventEmitter } from 'events';

export interface NotificationFilters {
  type?: string;
  priority?: string;
  status?: string;
  recipient?: string;
  unreadOnly?: boolean;
  page: number;
  limit: number;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private notificationStreams = new Map<string, Subject<Notification>>();
  private readonly eventEmitter = new EventEmitter();
  private readonly SSE_PING_INTERVAL = 30000; // 30 seconds

  constructor(
    @InjectModel('Notification') private notificationModel: Model<NotificationDocument>,
    @InjectModel('NotificationPreferences') private preferencesModel: Model<NotificationPreferencesDocument>,
    private eventEmitter2: EventEmitter2,
  ) {}

  onModuleInit() {
    // Set up event listeners for real-time notifications
    this.eventEmitter2.on('notification.created', (notification: Notification) => {
      this.emitToRecipients(notification);
    });
  }

  // Create a new notification
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = new this.notificationModel({
        ...createNotificationDto,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedNotification = await notification.save();
      
      // Emit event for real-time updates
      this.eventEmitter2.emit('notification.created', savedNotification);
      
      // Process notification delivery based on channels
      await this.processNotificationDelivery(savedNotification);
      
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

  async getNotificationById(id: string): Promise<Notification | null> {
    return await this.notificationModel.findById(id).exec();
  }

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      data: createNotificationDto.data || {},
      status: createNotificationDto.scheduledAt ? 'pending' : 'sent',
      sentAt: createNotificationDto.scheduledAt ? undefined : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedNotification = await notification.save();

    // Send notification immediately if not scheduled
    if (!createNotificationDto.scheduledAt) {
      await this.sendNotification(savedNotification);
    }

    // Emit to real-time streams
    this.emitToStreams(savedNotification);

    return savedNotification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: id, recipients: { $in: [userId] } },
        { 
          status: 'read',
          readAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!notification) {
      throw new Error('Notification not found or user not authorized');
    }

    return notification;
  }

  async bulkMarkAsRead(notificationIds: string[], userId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany(
        { 
          _id: { $in: notificationIds },
          recipients: { $in: [userId] },
          readAt: { $exists: false }
        },
        {
          status: 'read',
          readAt: new Date(),
          updatedAt: new Date(),
        }
      )
      .exec();

    return result.modifiedCount;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await this.notificationModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    let preferences = await this.preferencesModel.findOne({ userId }).exec();
    
    if (!preferences) {
      // Create default preferences
      preferences = new this.preferencesModel({
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      preferences = await preferences.save();
    }
    
    return preferences;
  }

  async updateNotificationPreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const preferences = await this.preferencesModel
      .findOneAndUpdate(
        { userId },
        { ...updates, updatedAt: new Date() },
        { new: true, upsert: true }
      )
      .exec();

    return preferences;
  }

  getNotificationStream(userId: string): Observable<any> {
    if (!this.notificationStreams.has(userId)) {
      const stream = new Subject<any>();
      this.notificationStreams.set(userId, stream);
      
      // Send periodic heartbeat to keep connection alive
      const heartbeat = interval(30000).pipe(
        map(() => ({
          data: JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          }),
        }))
      );
      
      // Merge heartbeat with actual notifications
      return new Observable(observer => {
        const heartbeatSub = heartbeat.subscribe(observer);
        const streamSub = stream.subscribe(observer);
        
        return () => {
          heartbeatSub.unsubscribe();
          streamSub.unsubscribe();
          this.notificationStreams.delete(userId);
        };
      });
    }
    
    return this.notificationStreams.get(userId).asObservable();
  }

  async sendShipmentUpdateNotification(updateDto: {
    trackingNumber: string;
    status: string;
    location?: string;
    estimatedDelivery?: Date;
    recipients: string[];
    createdBy: string;
  }): Promise<Notification> {
    const notification = await this.createNotification({
      type: 'shipment_update',
      priority: 'medium',
      title: `Shipment Update: ${updateDto.trackingNumber}`,
      message: `Your shipment ${updateDto.trackingNumber} status has been updated to: ${updateDto.status}`,
      data: {
        trackingNumber: updateDto.trackingNumber,
        status: updateDto.status,
        location: updateDto.location,
        estimatedDelivery: updateDto.estimatedDelivery,
        actionUrl: `/tracking/${updateDto.trackingNumber}`,
      },
      recipients: updateDto.recipients,
      channels: ['email', 'in_app', 'push'],
      createdBy: updateDto.createdBy,
    });

    return notification;
  }

  async sendDeliveryAlertNotification(alertDto: {
    trackingNumber: string;
    deliveryDate: Date;
    deliveryAddress?: string;
    recipients: string[];
    createdBy: string;
  }): Promise<Notification> {
    const notification = await this.createNotification({
      type: 'delivery_alert',
      priority: 'high',
      title: `Delivery Alert: ${alertDto.trackingNumber}`,
      message: `Your shipment ${alertDto.trackingNumber} is scheduled for delivery on ${alertDto.deliveryDate.toLocaleDateString()}`,
      data: {
        trackingNumber: alertDto.trackingNumber,
        deliveryDate: alertDto.deliveryDate,
        deliveryAddress: alertDto.deliveryAddress,
        actionUrl: `/tracking/${alertDto.trackingNumber}`,
      },
      recipients: alertDto.recipients,
      channels: ['email', 'sms', 'in_app', 'push'],
      createdBy: alertDto.createdBy,
    });

    return notification;
  }

  async getNotificationAnalytics() {
    // Mock analytics data - in real implementation, this would aggregate from notifications collection
    return {
      totalNotifications: 2847,
      sentToday: 156,
      unreadCount: 342,
      deliveryRate: 94.8,
      openRate: 67.3,
      clickRate: 23.7,
      typeBreakdown: [
        { type: 'Shipment Updates', count: 1245, percentage: 43.7 },
        { type: 'Delivery Alerts', count: 687, percentage: 24.1 },
        { type: 'Customs Clearance', count: 398, percentage: 14.0 },
        { type: 'Document Required', count: 287, percentage: 10.1 },
        { type: 'Payment Due', count: 156, percentage: 5.5 },
        { type: 'System Alerts', count: 74, percentage: 2.6 },
      ],
      channelPerformance: [
        { channel: 'Email', sent: 2847, delivered: 2698, opened: 1817, clicked: 542 },
        { channel: 'In-App', sent: 2847, delivered: 2847, opened: 2156, clicked: 892 },
        { channel: 'Push', sent: 1823, delivered: 1734, opened: 1245, clicked: 387 },
        { channel: 'SMS', sent: 456, delivered: 445, opened: 398, clicked: 156 },
      ],
      priorityBreakdown: [
        { priority: 'Critical', count: 23, percentage: 0.8 },
        { priority: 'High', count: 287, percentage: 10.1 },
        { priority: 'Medium', count: 1834, percentage: 64.4 },
        { priority: 'Low', count: 703, percentage: 24.7 },
      ],
      monthlyTrends: [
        { month: 'Jan', sent: 2156, delivered: 2045, opened: 1378 },
        { month: 'Feb', sent: 2398, delivered: 2287, opened: 1542 },
        { month: 'Mar', sent: 2687, delivered: 2534, opened: 1698 },
        { month: 'Apr', sent: 2456, delivered: 2334, opened: 1587 },
        { month: 'May', sent: 2789, delivered: 2645, opened: 1789 },
        { month: 'Jun', sent: 2847, delivered: 2698, opened: 1817 },
      ],
      responseMetrics: {
        averageResponseTime: 2.3, // minutes
        peakSendingHour: 14, // 2 PM
        optimalSendingDay: 'Tuesday',
        unsubscribeRate: 0.8, // percentage
      },
    };
  }

  private async sendNotification(notification: Notification): Promise<void> {
    // In a real implementation, this would integrate with email services (SendGrid, AWS SES),
    // SMS services (Twilio), push notification services (Firebase), etc.
    
    console.log(`Sending notification: ${notification.title} to ${notification.recipients.length} recipients`);
    
    // Simulate sending to different channels
    for (const channel of notification.channels) {
      switch (channel) {
        case 'email':
          await this.sendEmailNotification(notification);
          break;
        case 'sms':
          await this.sendSmsNotification(notification);
          break;
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'in_app':
          // In-app notifications are handled by the real-time stream
          break;
      }
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    // Mock email sending
    console.log(`📧 Email sent: ${notification.title}`);
  }

  private async sendSmsNotification(notification: Notification): Promise<void> {
    // Mock SMS sending
    console.log(`📱 SMS sent: ${notification.title}`);
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // Mock push notification sending
    console.log(`🔔 Push notification sent: ${notification.title}`);
  }

  private emitToStreams(notification: Notification): void {
    // Emit to all relevant user streams
    for (const recipient of notification.recipients) {
      const stream = this.notificationStreams.get(recipient);
      if (stream) {
        stream.next({
          data: JSON.stringify({
            type: 'notification',
            notification,
            timestamp: new Date().toISOString(),
          }),
        });
      }
    }
  }

  async processScheduledNotifications(): Promise<number> {
    const now = new Date();
    const scheduledNotifications = await this.notificationModel
      .find({
        status: 'pending',
        scheduledAt: { $lte: now },
      })
      .exec();

    let processed = 0;
    for (const notification of scheduledNotifications) {
      try {
        await this.sendNotification(notification);
        await this.notificationModel
          .findByIdAndUpdate(notification._id, {
            status: 'sent',
            sentAt: now,
            updatedAt: now,
          })
          .exec();
        processed++;
      } catch (error) {
        console.error(`Failed to send scheduled notification ${notification._id}:`, error);
        await this.notificationModel
          .findByIdAndUpdate(notification._id, {
            status: 'failed',
            updatedAt: now,
          })
          .exec();
      }
    }

    return processed;
  }

  async cleanupExpiredNotifications(): Promise<number> {
    const now = new Date();
    const result = await this.notificationModel
      .deleteMany({
        expiresAt: { $lt: now },
      })
      .exec();

    return result.deletedCount;
  }

  async getUserUnreadCount(userId: string): Promise<number> {
    return await this.notificationModel
      .countDocuments({
        recipients: { $in: [userId] },
        readAt: { $exists: false },
      })
      .exec();
  }

  // Get notification by ID
  async getNotificationById(id: string): Promise<Notification> {
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
  async markAsRead(id: string, userId: string): Promise<Notification> {
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
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      let preferences = await this.preferencesModel.findOne({ userId }).lean();
      
      if (!preferences) {
        // Create default preferences if not exists
        preferences = await this.preferencesModel.create({
          userId,
          // Default values will be set by the schema
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
  ): Promise<NotificationPreferences> {
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
  subscribeToNotifications(userId: string): Observable<Notification> {
    if (!this.notificationStreams.has(userId)) {
      this.notificationStreams.set(userId, new Subject<Notification>());
    }

    // Add ping to keep connection alive
    const ping$ = interval(this.SSE_PING_INTERVAL).pipe(
      map(() => ({
        type: 'ping',
        timestamp: new Date().toISOString(),
      }))
    );

    return new Observable<Notification>(subscriber => {
      const userStream = this.notificationStreams.get(userId);
      
      if (userStream) {
        const subscription = userStream.subscribe(subscriber);
        const pingSubscription = ping$.subscribe(subscriber);
        
        return () => {
          subscription.unsubscribe();
          pingSubscription.unsubscribe();
          
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
  private async emitToRecipients(notification: Notification): Promise<void> {
    try {
      // Emit to all recipients who are currently connected
      for (const recipient of notification.recipients) {
        const userStream = this.notificationStreams.get(recipient);
        if (userStream) {
          userStream.next(notification);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to emit notification to recipients: ${error.message}`, error.stack);
    }
  }

  // Process notification delivery based on channels
  private async processNotificationDelivery(notification: Notification): Promise<void> {
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
        const userPrefs = preferencesMap.get(recipient) || {};
        
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

        // TODO: Implement actual delivery for each channel
        // This is where you would integrate with email/SMS/push services
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
      
      throw error;
    }
  }
}
