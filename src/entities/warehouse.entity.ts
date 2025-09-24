import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WarehouseDocument = Warehouse & Document;

@Schema({ collection: 'warehouses' })
export class Warehouse {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

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

  @Prop({ required: true, min: 0 })
  capacity: number;

  @Prop({ default: 0, min: 0, max: 100 })
  utilization: number;

  @Prop({ type: [String], default: [] })
  zones: string[];

  @Prop({ required: true })
  manager: string;

  @Prop({
    type: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    required: true,
  })
  contact: {
    phone: string;
    email: string;
  };

  @Prop({
    type: {
      open: { type: String, required: true },
      close: { type: String, required: true },
      timezone: { type: String, required: true },
    },
    required: true,
  })
  operatingHours: {
    open: string;
    close: string;
    timezone: string;
  };

  @Prop({ enum: ['active', 'inactive', 'maintenance'], default: 'active' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);
