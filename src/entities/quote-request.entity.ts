import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuoteRequestDocument = QuoteRequest & Document;

@Schema({ collection: 'quote_requests' })
export class QuoteRequest {
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ enum: ['ocean', 'air', 'ground'], required: true })
  serviceType: string;

  @Prop({ required: true })
  packageType: string;

  @Prop({ required: true, min: 0 })
  weight: number;

  @Prop({
    type: {
      length: { type: Number, required: true, min: 0 },
      width: { type: Number, required: true, min: 0 },
      height: { type: Number, required: true, min: 0 },
    },
    required: true,
  })
  dimensions: {
    length: number;
    width: number;
    height: number;
  };

  @Prop({ required: true })
  commodity: string;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ enum: ['standard', 'express', 'urgent', 'critical'], default: 'standard' })
  urgency: string;

  @Prop({ enum: ['EXW', 'FOB', 'CIF', 'DDP'], default: 'EXW' })
  incoterms: string;

  @Prop({ type: [String], default: [] })
  additionalServices: string[];

  @Prop({ default: '' })
  specialRequirements: string;

  @Prop({ enum: ['pending', 'quoted', 'accepted', 'rejected', 'expired'], default: 'pending' })
  status: string;

  @Prop({ min: 0 })
  quotedPrice?: number;

  @Prop()
  validUntil?: Date;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const QuoteRequestSchema = SchemaFactory.createForClass(QuoteRequest);
