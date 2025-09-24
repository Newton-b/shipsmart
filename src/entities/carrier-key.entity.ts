import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CarrierKeyDocument = CarrierKey & Document;

@Schema({
  timestamps: true,
  collection: 'carrier_keys',
})
export class CarrierKey {
  @Prop({ required: true, unique: true, index: true })
  carrierCode: string;

  @Prop({ required: true, enum: ['UPS', 'FEDEX', 'MAERSK', 'DHL', 'USPS', 'GENERIC_REST', 'GENERIC_GRAPHQL'], index: true })
  carrierType: string;

  @Prop({ required: true })
  carrierName: string;

  @Prop({ required: true })
  apiKey: string;

  @Prop()
  apiSecret?: string;

  @Prop({ required: true })
  baseUrl: string;

  @Prop()
  trackingNumberPattern?: string;

  @Prop({ default: 1000 })
  rateLimitPerMinute: number;

  @Prop({ default: 30000 })
  timeout: number;

  @Prop({ default: 3 })
  retries: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  config: Record<string, any>;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ index: true })
  lastUsedAt?: Date;

  @Prop({ index: true })
  expiresAt?: Date;

  // Virtual fields
  createdAt?: Date;
  updatedAt?: Date;

  // Instance methods
  validateTrackingNumber(trackingNumber: string): boolean {
    if (!this.trackingNumberPattern) return true;
    const regex = new RegExp(this.trackingNumberPattern);
    return regex.test(trackingNumber);
  }

  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  isRateLimited(requestsInLastMinute: number): boolean {
    return requestsInLastMinute >= this.rateLimitPerMinute;
  }

  isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  canBeUsed(): boolean {
    return this.isActive && !this.isExpired();
  }
}

export const CarrierKeySchema = SchemaFactory.createForClass(CarrierKey);

// Indexes for optimal query performance
CarrierKeySchema.index({ carrierCode: 1, isActive: 1 });
CarrierKeySchema.index({ carrierType: 1, isActive: 1 });
CarrierKeySchema.index({ lastUsedAt: -1, usageCount: -1 });
CarrierKeySchema.index({ expiresAt: 1 }, { sparse: true });

// Add instance methods to schema
CarrierKeySchema.methods.validateTrackingNumber = function(trackingNumber: string): boolean {
  if (!this.trackingNumberPattern) return true;
  const regex = new RegExp(this.trackingNumberPattern);
  return regex.test(trackingNumber);
};

CarrierKeySchema.methods.incrementUsage = function(): void {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
};

CarrierKeySchema.methods.isRateLimited = function(requestsInLastMinute: number): boolean {
  return requestsInLastMinute >= this.rateLimitPerMinute;
};

CarrierKeySchema.methods.isExpired = function(): boolean {
  return this.expiresAt ? new Date() > this.expiresAt : false;
};

CarrierKeySchema.methods.canBeUsed = function(): boolean {
  return this.isActive && !this.isExpired();
};

// Static methods
CarrierKeySchema.statics.findActiveByCarrier = function(carrierCode: string) {
  return this.findOne({ carrierCode, isActive: true });
};

CarrierKeySchema.statics.findActiveCarriers = function() {
  return this.find({ isActive: true }).select('carrierCode carrierName carrierType');
};
