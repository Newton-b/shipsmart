import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CarrierKey } from './carrier-key.entity';

export type TrackingEventDocument = TrackingEvent & Document;

@Schema({
  timestamps: true,
  collection: 'tracking_events',
})
export class TrackingEvent {
  @Prop({ required: true, index: true })
  trackingNumber: string;

  @Prop({ required: true, index: true })
  carrierCode: string;

  @Prop({ required: true, index: true })
  status: string;

  @Prop()
  statusDescription?: string;

  @Prop({ required: true, index: true })
  eventTimestamp: Date;

  @Prop({ index: 'text' })
  location?: string;

  @Prop({ type: Number })
  latitude?: number;

  @Prop({ type: Number })
  longitude?: number;

  @Prop()
  description?: string;

  @Prop({ index: true })
  externalEventId?: string;

  @Prop({ default: false, index: true })
  isLatest: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'CarrierKey' })
  carrierKey?: Types.ObjectId;

  // Virtual fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const TrackingEventSchema = SchemaFactory.createForClass(TrackingEvent);

// Compound indexes for optimal query performance
TrackingEventSchema.index({ trackingNumber: 1, carrierCode: 1 });
TrackingEventSchema.index({ trackingNumber: 1, carrierCode: 1, isLatest: 1 });
TrackingEventSchema.index({ eventTimestamp: -1 });
TrackingEventSchema.index({ status: 1, eventTimestamp: -1 });
TrackingEventSchema.index({ carrierCode: 1, trackingNumber: 1, eventTimestamp: -1 });
TrackingEventSchema.index({ carrierCode: 1, externalEventId: 1 }, { sparse: true });
TrackingEventSchema.index({ status: 1 }, { partialFilterExpression: { status: 'DELIVERED' } });

// Geospatial index for location queries
TrackingEventSchema.index({ latitude: 1, longitude: 1 }, { sparse: true });

// Text search index
TrackingEventSchema.index({ location: 'text', description: 'text' });

// Pre-save middleware to ensure only one latest event per tracking number/carrier
TrackingEventSchema.pre('save', async function(next) {
  if (this.isLatest) {
    await this.model('TrackingEvent').updateMany(
      { 
        trackingNumber: this.trackingNumber, 
        carrierCode: this.carrierCode,
        _id: { $ne: this._id }
      },
      { isLatest: false }
    );
  }
  next();
});

// Static methods
TrackingEventSchema.statics.findLatestByTracking = function(trackingNumber: string, carrierCode?: string) {
  const query: any = { trackingNumber, isLatest: true };
  if (carrierCode) {
    query.carrierCode = carrierCode;
  }
  return this.findOne(query).populate('carrierKey');
};

TrackingEventSchema.statics.findHistoryByTracking = function(trackingNumber: string, carrierCode?: string) {
  const query: any = { trackingNumber };
  if (carrierCode) {
    query.carrierCode = carrierCode;
  }
  return this.find(query).sort({ eventTimestamp: -1 }).populate('carrierKey');
};
