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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationSimpleService } from '../services/notification-simple.service';

// Simplified interfaces for testing
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

@Controller('notifications-test')
@ApiTags('notifications-test')
export class NotificationTestController {
  constructor(private readonly notificationService: NotificationSimpleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications with filters' })
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
      return await this.notificationService.getNotifications({
        type,
        priority,
        status,
        recipient,
        unreadOnly: unreadOnly === 'true',
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single notification by ID' })
  async getNotification(@Param('id') id: string) {
    try {
      return await this.notificationService.getNotificationById(id);
    } catch (error) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      return await this.notificationService.createNotification(createNotificationDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @Body() readDto: { userId: string },
  ) {
    try {
      return await this.notificationService.markAsRead(id, readDto.userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('read-multiple')
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  async bulkMarkAsRead(
    @Body() bulkReadDto: { notificationIds: string[]; userId: string },
  ) {
    try {
      const result = await this.notificationService.markMultipleAsRead(
        bulkReadDto.notificationIds,
        bulkReadDto.userId,
      );
      return { updated: result.count };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async deleteNotification(@Param('id') id: string, @Body() body: { userId: string }) {
    try {
      await this.notificationService.deleteNotification(id, body.userId);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('preferences/:userId')
  @ApiOperation({ summary: 'Get user notification preferences' })
  async getNotificationPreferences(@Param('userId') userId: string) {
    try {
      return await this.notificationService.getNotificationPreferences(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('preferences/:userId')
  @ApiOperation({ summary: 'Update user notification preferences' })
  async updateNotificationPreferences(
    @Param('userId') userId: string,
    @Body() preferences: Partial<NotificationPreferences>,
  ) {
    try {
      return await this.notificationService.updateNotificationPreferences(userId, preferences);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Sse('stream/:userId')
  @ApiOperation({ summary: 'SSE endpoint for real-time notifications' })
  notificationStream(@Param('userId') userId: string): Observable<any> {
    return this.notificationService.subscribeToNotifications(userId).pipe(
      map(notification => ({
        data: JSON.stringify(notification),
      }))
    );
  }

  // Test endpoints for creating sample notifications
  @Post('test/shipment-update')
  @ApiOperation({ summary: 'Create a test shipment update notification' })
  async sendShipmentUpdateNotification(@Body() updateDto: any) {
    try {
      const notification: CreateNotificationDto = {
        type: 'shipment_update',
        priority: 'medium',
        title: 'Shipment Update',
        message: `Your shipment ${updateDto.trackingNumber} has been updated`,
        data: {
          trackingNumber: updateDto.trackingNumber,
          status: updateDto.status,
          location: updateDto.location,
        },
        recipients: updateDto.recipients || ['test-user-1'],
        channels: ['in_app', 'email'],
        createdBy: 'system',
      };

      return await this.notificationService.createNotification(notification);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('test/delivery-alert')
  @ApiOperation({ summary: 'Create a test delivery alert notification' })
  async sendDeliveryAlertNotification(@Body() alertDto: any) {
    try {
      const notification: CreateNotificationDto = {
        type: 'delivery_alert',
        priority: 'high',
        title: 'Delivery Alert',
        message: `Your package ${alertDto.trackingNumber} is out for delivery`,
        data: {
          trackingNumber: alertDto.trackingNumber,
          estimatedDelivery: alertDto.estimatedDelivery,
          carrier: alertDto.carrier,
        },
        recipients: alertDto.recipients || ['test-user-1'],
        channels: ['in_app', 'email', 'sms'],
        createdBy: 'system',
      };

      return await this.notificationService.createNotification(notification);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get notification analytics' })
  getNotificationAnalytics() {
    return {
      totalNotifications: 0,
      unreadCount: 0,
      byType: {
        shipment_update: 0,
        delivery_alert: 0,
        customs_clearance: 0,
        document_required: 0,
        payment_due: 0,
        system_alert: 0,
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      byStatus: {
        pending: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        read: 0,
      },
    };
  }

  // Utility method for testing
  private validateNotificationData(data: CreateNotificationDto): void {
    if (!data.type || !data.priority || !data.title || !data.message) {
      throw new Error('Missing required notification fields');
    }

    if (!data.recipients || data.recipients.length === 0) {
      throw new Error('At least one recipient is required');
    }

    if (!data.channels || data.channels.length === 0) {
      throw new Error('At least one notification channel is required');
    }
  }
}
