import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export interface Notification {
  id: string;
  type: 'shipment_update' | 'delivery_alert' | 'customs_clearance' | 'document_required' | 'payment_due' | 'system_alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data: {
    trackingNumber?: string;
    shipmentId?: string;
    customerId?: string;
    documentId?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  recipients: string[];
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationDto {
  type: string;
  priority: string;
  title: string;
  message: string;
  data?: { [key: string]: any };
  recipients: string[];
  channels: string[];
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
  createdAt: Date;
  updatedAt: Date;
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications with filtering' })
  @ApiQuery({ name: 'type', description: 'Filter by notification type', required: false })
  @ApiQuery({ name: 'priority', description: 'Filter by priority', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false })
  @ApiQuery({ name: 'recipient', description: 'Filter by recipient', required: false })
  @ApiQuery({ name: 'unreadOnly', description: 'Show only unread notifications', required: false })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @Query('type') type?: string,
    @Query('priority') priority?: string,
    @Query('status') status?: string,
    @Query('recipient') recipient?: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      
      return await this.notificationService.getNotifications({
        type,
        priority,
        status,
        recipient,
        unreadOnly: unreadOnly === 'true',
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotification(@Param('id') id: string): Promise<Notification> {
    try {
      const notification = await this.notificationService.getNotificationById(id);
      if (!notification) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      return notification;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to retrieve notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create and send a new notification' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['shipment_update', 'delivery_alert', 'customs_clearance', 'document_required', 'payment_due', 'system_alert'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        title: { type: 'string', description: 'Notification title' },
        message: { type: 'string', description: 'Notification message' },
        data: { type: 'object', description: 'Additional notification data' },
        recipients: { type: 'array', items: { type: 'string' }, description: 'Recipient user IDs' },
        channels: { type: 'array', items: { type: 'string', enum: ['email', 'sms', 'push', 'in_app'] } },
        scheduledAt: { type: 'string', format: 'date-time', description: 'Schedule notification for later' },
        expiresAt: { type: 'string', format: 'date-time', description: 'Notification expiry time' },
        createdBy: { type: 'string', description: 'Creator user ID' },
      },
      required: ['type', 'priority', 'title', 'message', 'recipients', 'channels', 'createdBy'],
    },
  })
  @ApiResponse({ status: 201, description: 'Notification created and sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid notification data' })
  async createNotification(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      this.validateNotificationData(createNotificationDto);
      return await this.notificationService.createNotification(createNotificationDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create notification',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID who read the notification' },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Param('id') id: string,
    @Body() readDto: { userId: string },
  ): Promise<Notification> {
    try {
      return await this.notificationService.markAsRead(id, readDto.userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to mark notification as read',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('bulk/read')
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notificationIds: { type: 'array', items: { type: 'string' } },
        userId: { type: 'string', description: 'User ID who read the notifications' },
      },
      required: ['notificationIds', 'userId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  async bulkMarkAsRead(
    @Body() bulkReadDto: { notificationIds: string[]; userId: string },
  ): Promise<{ updated: number }> {
    try {
      const updated = await this.notificationService.bulkMarkAsRead(
        bulkReadDto.notificationIds,
        bulkReadDto.userId
      );
      return { updated };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to mark notifications as read',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.notificationService.deleteNotification(id);
      if (!deleted) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('preferences/:userId')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved successfully' })
  async getNotificationPreferences(@Param('userId') userId: string): Promise<NotificationPreferences> {
    try {
      return await this.notificationService.getNotificationPreferences(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve notification preferences',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('preferences/:userId')
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  async updateNotificationPreferences(
    @Param('userId') userId: string,
    @Body() preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    try {
      return await this.notificationService.updateNotificationPreferences(userId, preferences);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update notification preferences',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Sse('stream/:userId')
  @ApiOperation({ summary: 'Server-Sent Events stream for real-time notifications' })
  @ApiParam({ name: 'userId', description: 'User ID for notification stream' })
  @ApiResponse({ status: 200, description: 'SSE stream established' })
  notificationStream(@Param('userId') userId: string): Observable<any> {
    return this.notificationService.getNotificationStream(userId);
  }

  @Post('send/shipment-update')
  @ApiOperation({ summary: 'Send shipment update notification' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trackingNumber: { type: 'string' },
        status: { type: 'string' },
        location: { type: 'string' },
        estimatedDelivery: { type: 'string', format: 'date-time' },
        recipients: { type: 'array', items: { type: 'string' } },
        createdBy: { type: 'string' },
      },
      required: ['trackingNumber', 'status', 'recipients', 'createdBy'],
    },
  })
  @ApiResponse({ status: 200, description: 'Shipment update notification sent' })
  async sendShipmentUpdateNotification(@Body() updateDto: any): Promise<Notification> {
    try {
      return await this.notificationService.sendShipmentUpdateNotification(updateDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send shipment update notification',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('send/delivery-alert')
  @ApiOperation({ summary: 'Send delivery alert notification' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trackingNumber: { type: 'string' },
        deliveryDate: { type: 'string', format: 'date-time' },
        deliveryAddress: { type: 'string' },
        recipients: { type: 'array', items: { type: 'string' } },
        createdBy: { type: 'string' },
      },
      required: ['trackingNumber', 'deliveryDate', 'recipients', 'createdBy'],
    },
  })
  @ApiResponse({ status: 200, description: 'Delivery alert notification sent' })
  async sendDeliveryAlertNotification(@Body() alertDto: any): Promise<Notification> {
    try {
      return await this.notificationService.sendDeliveryAlertNotification(alertDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send delivery alert notification',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Get notification analytics and statistics' })
  @ApiResponse({ status: 200, description: 'Notification analytics retrieved successfully' })
  async getNotificationAnalytics() {
    try {
      return await this.notificationService.getNotificationAnalytics();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve notification analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateNotificationData(data: CreateNotificationDto): void {
    const errors: string[] = [];

    if (!data.type?.trim()) errors.push('Notification type is required');
    if (!data.priority?.trim()) errors.push('Priority is required');
    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.message?.trim()) errors.push('Message is required');
    if (!data.recipients || data.recipients.length === 0) errors.push('At least one recipient is required');
    if (!data.channels || data.channels.length === 0) errors.push('At least one notification channel is required');
    if (!data.createdBy?.trim()) errors.push('Creator ID is required');

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}
