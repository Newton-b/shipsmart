import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ collection: 'customers' })
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  company: string;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    required: true,
  })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop({ enum: ['active', 'inactive', 'pending'], default: 'active' })
  status: string;

  @Prop({ enum: ['shipper', 'consignee', 'both'], required: true })
  type: string;

  @Prop({ default: 0 })
  creditLimit: number;

  @Prop({ default: 'Net 30' })
  paymentTerms: string;

  @Prop({ type: [String], default: [] })
  preferredServices: string[];

  @Prop({ default: 0 })
  totalShipments: number;

  @Prop({ default: 0 })
  totalValue: number;

  @Prop({ default: Date.now })
  lastActivity: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
