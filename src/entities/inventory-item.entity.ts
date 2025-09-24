import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

@Schema({ collection: 'inventory_items' })
export class InventoryItem {
  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ default: 0, min: 0 })
  reservedQuantity: number;

  @Prop({ required: true, min: 0 })
  availableQuantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  totalValue: number;

  @Prop({
    type: {
      warehouse: { type: String, required: true },
      zone: { type: String, required: true },
      aisle: { type: String, required: true },
      shelf: { type: String, required: true },
    },
    required: true,
  })
  location: {
    warehouse: string;
    zone: string;
    aisle: string;
    shelf: string;
  };

  @Prop({
    type: {
      length: { type: Number, required: true, min: 0 },
      width: { type: Number, required: true, min: 0 },
      height: { type: Number, required: true, min: 0 },
      weight: { type: Number, required: true, min: 0 },
    },
    required: true,
  })
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };

  @Prop({ enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'], default: 'in_stock' })
  status: string;

  @Prop({ required: true })
  supplier: string;

  @Prop({ default: Date.now })
  lastRestocked: Date;

  @Prop()
  expiryDate?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
