import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PricingRuleDocument = PricingRule & Document;

@Schema({ collection: 'pricing_rules' })
export class PricingRule {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ enum: ['ocean', 'air', 'ground', 'all'], required: true })
  serviceType: string;

  @Prop({ enum: ['base_rate', 'surcharge', 'discount', 'minimum'], required: true })
  ruleType: string;

  @Prop({
    type: {
      minWeight: { type: Number, min: 0 },
      maxWeight: { type: Number, min: 0 },
      origins: { type: [String], default: [] },
      destinations: { type: [String], default: [] },
      commodities: { type: [String], default: [] },
      customerTypes: { type: [String], default: [] },
    },
    default: {},
  })
  conditions: {
    minWeight?: number;
    maxWeight?: number;
    origins?: string[];
    destinations?: string[];
    commodities?: string[];
    customerTypes?: string[];
  };

  @Prop({
    type: {
      type: { type: String, enum: ['fixed', 'percentage', 'per_kg', 'per_cbm'], required: true },
      value: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, default: 'USD' },
    },
    required: true,
  })
  calculation: {
    type: string;
    value: number;
    currency: string;
  };

  @Prop({ default: 1, min: 1 })
  priority: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  validFrom: Date;

  @Prop()
  validUntil?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PricingRuleSchema = SchemaFactory.createForClass(PricingRule);
