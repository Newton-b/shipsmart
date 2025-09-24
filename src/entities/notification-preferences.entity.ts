import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationPreferencesDocument = NotificationPreferencesEntity & Document;

@Schema({ collection: 'notification_preferences' })
export class NotificationPreferencesEntity {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ default: true })
  emailNotifications: boolean;

  @Prop({ default: false })
  smsNotifications: boolean;

  @Prop({ default: true })
  pushNotifications: boolean;

  @Prop({ default: true })
  inAppNotifications: boolean;

  @Prop({
    type: {
      shipmentUpdates: { type: Boolean, default: true },
      deliveryAlerts: { type: Boolean, default: true },
      customsClearance: { type: Boolean, default: true },
      documentRequired: { type: Boolean, default: true },
      paymentDue: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: false },
    },
    _id: false,
    default: {},
  })
  notificationTypes: {
    shipmentUpdates: boolean;
    deliveryAlerts: boolean;
    customsClearance: boolean;
    documentRequired: boolean;
    paymentDue: boolean;
    systemAlerts: boolean;
  };

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '22:00' },
      endTime: { type: String, default: '08:00' },
      timezone: { type: String, default: 'UTC' },
    },
    _id: false,
    default: {},
  })
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };

  @Prop({
    enum: ['immediate', 'hourly', 'daily', 'weekly'],
    default: 'immediate',
  })
  frequency: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const NotificationPreferencesSchema = SchemaFactory.createForClass(NotificationPreferencesEntity);

// Add compound index for common queries
NotificationPreferencesSchema.index({ userId: 1 }, { unique: true });
NotificationPreferencesSchema.index({ 'notificationTypes.shipmentUpdates': 1 });
NotificationPreferencesSchema.index({ 'notificationTypes.deliveryAlerts': 1 });
NotificationPreferencesSchema.index({ 'quietHours.enabled': 1 });
