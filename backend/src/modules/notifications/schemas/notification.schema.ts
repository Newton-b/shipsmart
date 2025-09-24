import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  SHIPMENT_UPDATE = 'shipment_update',
  DELIVERY_ALERT = 'delivery_alert',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  SYSTEM_ALERT = 'system_alert',
  CARRIER_UPDATE = 'carrier_update',
  WEATHER_ALERT = 'weather_alert',
  DELAY_NOTIFICATION = 'delay_notification',
  CUSTOMS_CLEARANCE = 'customs_clearance',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Notification {
  @ApiProperty({ description: 'Notification ID' })
  _id: string;

  @ApiProperty({ description: 'User ID who receives the notification' })
  @Prop({ required: true, index: true })
  userId: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @Prop({ 
    required: true, 
    enum: NotificationType,
    index: true 
  })
  type: NotificationType;

  @ApiProperty({ description: 'Notification priority', enum: NotificationPriority })
  @Prop({ 
    required: true, 
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM 
  })
  priority: NotificationPriority;

  @ApiProperty({ description: 'Notification status', enum: NotificationStatus })
  @Prop({ 
    required: true, 
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
    index: true 
  })
  status: NotificationStatus;

  @ApiProperty({ description: 'Notification title' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @Prop({ required: true })
  message: string;

  @ApiProperty({ description: 'Additional notification data' })
  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @ApiProperty({ description: 'Related shipment ID' })
  @Prop({ index: true })
  shipmentId?: string;

  @ApiProperty({ description: 'Related payment ID' })
  @Prop({ index: true })
  paymentId?: string;

  @ApiProperty({ description: 'Action URL for the notification' })
  @Prop()
  actionUrl?: string;

  @ApiProperty({ description: 'Action button text' })
  @Prop()
  actionText?: string;

  @ApiProperty({ description: 'Notification icon' })
  @Prop()
  icon?: string;

  @ApiProperty({ description: 'Whether to send email notification' })
  @Prop({ default: false })
  sendEmail: boolean;

  @ApiProperty({ description: 'Whether to send push notification' })
  @Prop({ default: false })
  sendPush: boolean;

  @ApiProperty({ description: 'Whether email was sent' })
  @Prop({ default: false })
  emailSent: boolean;

  @ApiProperty({ description: 'Whether push notification was sent' })
  @Prop({ default: false })
  pushSent: boolean;

  @ApiProperty({ description: 'When the notification was read' })
  @Prop()
  readAt?: Date;

  @ApiProperty({ description: 'When the notification expires' })
  @Prop()
  expiresAt?: Date;

  @ApiProperty({ description: 'Notification creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Notification last update timestamp' })
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for better query performance
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ userId: 1, type: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
NotificationSchema.index({ shipmentId: 1 });
NotificationSchema.index({ paymentId: 1 });
