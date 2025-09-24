import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationType = 
  | 'shipment_update' 
  | 'delivery_alert' 
  | 'customs_clearance' 
  | 'document_required' 
  | 'payment_due' 
  | 'system_alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export type NotificationDocument = NotificationEntity & Document & {
  isRead: boolean;
  isExpired: boolean;
};

@Schema({ 
  collection: 'notifications',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class NotificationEntity {
  @Prop({ 
    type: String,
    enum: ['shipment_update', 'delivery_alert', 'customs_clearance', 'document_required', 'payment_due', 'system_alert'],
    required: true,
    index: true,
  })
  type: NotificationType;

  @Prop({ 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true,
  })
  priority: NotificationPriority;

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true, trim: true })
  message: string;

  @Prop({
    type: {
      trackingNumber: { type: String, default: null },
      shipmentId: { type: String, default: null },
      customerId: { type: String, default: null },
      documentId: { type: String, default: null },
      actionUrl: { type: String, default: null },
    },
    default: {},
  })
  data: {
    trackingNumber?: string;
    shipmentId?: string;
    customerId?: string;
    documentId?: string;
    actionUrl?: string;
    [key: string]: any;
  };

  @Prop({ type: [String], required: true, index: true })
  recipients: string[];

  @Prop({ 
    type: [String], 
    enum: ['email', 'sms', 'push', 'in_app'],
    required: true,
    index: true,
  })
  channels: NotificationChannel[];

  @Prop({ 
    type: String, 
    enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
    default: 'pending',
    index: true,
  })
  status: NotificationStatus;

  @Prop({ type: Date, index: true })
  scheduledAt?: Date;

  @Prop({ type: Date, index: true })
  sentAt?: Date;

  @Prop({ type: Date, index: true })
  readAt?: Date;

  @Prop({ type: Date, index: true })
  expiresAt?: Date;

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop({ type: Date, default: Date.now, index: true })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(NotificationEntity);

// Add indexes for common queries
NotificationSchema.index({ recipients: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ 'data.shipmentId': 1 });
NotificationSchema.index({ 'data.customerId': 1 });
NotificationSchema.index({ 'data.documentId': 1 });
NotificationSchema.index({ type: 1, status: 1, priority: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ status: 1, scheduledAt: 1 });

// Add virtual for isRead
NotificationSchema.virtual('isRead').get(function() {
  return !!this.readAt;
});

// Add virtual for isExpired
NotificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt ? this.expiresAt < new Date() : false;
});

// Add pre-save hook to update timestamps
NotificationSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

// Add method to get public notification data
NotificationSchema.methods.toJSON = function() {
  const notification = this.toObject();
  
  // Remove sensitive data
  delete notification.__v;
  
  return notification;
};

// Add static method to find unread notifications
NotificationSchema.statics.findUnreadByRecipient = function(recipientId: string) {
  return this.find({
    recipients: recipientId,
    readAt: { $exists: false },
    status: { $in: ['sent', 'delivered'] },
  }).sort({ createdAt: -1 });
};

// Add static method to mark notifications as read
NotificationSchema.statics.markAsRead = function(ids: string[], userId: string) {
  return this.updateMany(
    {
      _id: { $in: ids },
      recipients: userId,
      readAt: { $exists: false },
    },
    {
      $set: {
        status: 'read',
        readAt: new Date(),
      },
    }
  );
};


// Add virtual for isExpired
NotificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt ? this.expiresAt < new Date() : false;
});

// Add pre-save hook to update timestamps
NotificationSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});
