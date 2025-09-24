import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TrackingEvent } from './tracking-event.entity';

export enum ShipmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  CANCELLED = 'cancelled',
}

export enum ShipmentType {
  OCEAN = 'ocean',
  AIR = 'air',
  GROUND = 'ground',
  EXPRESS = 'express',
}

export enum ShipmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('shipments')
@Index(['trackingNumber'], { unique: true })
@Index(['userId'])
@Index(['status'])
@Index(['carrier'])
export class Shipment {
  @ApiProperty({ description: 'Shipment ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Tracking number' })
  @Column({ unique: true, length: 100 })
  @Index()
  trackingNumber: string;

  @ApiProperty({ description: 'Shipment status', enum: ShipmentStatus })
  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @ApiProperty({ description: 'Shipment type', enum: ShipmentType })
  @Column({
    type: 'enum',
    enum: ShipmentType,
    default: ShipmentType.GROUND,
  })
  type: ShipmentType;

  @ApiProperty({ description: 'Shipment priority', enum: ShipmentPriority })
  @Column({
    type: 'enum',
    enum: ShipmentPriority,
    default: ShipmentPriority.MEDIUM,
  })
  priority: ShipmentPriority;

  @ApiProperty({ description: 'Carrier name' })
  @Column({ length: 100 })
  @Index()
  carrier: string;

  @ApiProperty({ description: 'Carrier service type' })
  @Column({ length: 100, nullable: true })
  serviceType?: string;

  // Sender Information
  @ApiProperty({ description: 'Sender name' })
  @Column({ length: 255 })
  senderName: string;

  @ApiProperty({ description: 'Sender company' })
  @Column({ length: 255, nullable: true })
  senderCompany?: string;

  @ApiProperty({ description: 'Sender address' })
  @Column({ type: 'text' })
  senderAddress: string;

  @ApiProperty({ description: 'Sender city' })
  @Column({ length: 100 })
  senderCity: string;

  @ApiProperty({ description: 'Sender state/province' })
  @Column({ length: 100 })
  senderState: string;

  @ApiProperty({ description: 'Sender postal code' })
  @Column({ length: 20 })
  senderPostalCode: string;

  @ApiProperty({ description: 'Sender country' })
  @Column({ length: 100 })
  senderCountry: string;

  @ApiProperty({ description: 'Sender phone' })
  @Column({ length: 20, nullable: true })
  senderPhone?: string;

  @ApiProperty({ description: 'Sender email' })
  @Column({ length: 255, nullable: true })
  senderEmail?: string;

  // Recipient Information
  @ApiProperty({ description: 'Recipient name' })
  @Column({ length: 255 })
  recipientName: string;

  @ApiProperty({ description: 'Recipient company' })
  @Column({ length: 255, nullable: true })
  recipientCompany?: string;

  @ApiProperty({ description: 'Recipient address' })
  @Column({ type: 'text' })
  recipientAddress: string;

  @ApiProperty({ description: 'Recipient city' })
  @Column({ length: 100 })
  recipientCity: string;

  @ApiProperty({ description: 'Recipient state/province' })
  @Column({ length: 100 })
  recipientState: string;

  @ApiProperty({ description: 'Recipient postal code' })
  @Column({ length: 20 })
  recipientPostalCode: string;

  @ApiProperty({ description: 'Recipient country' })
  @Column({ length: 100 })
  recipientCountry: string;

  @ApiProperty({ description: 'Recipient phone' })
  @Column({ length: 20, nullable: true })
  recipientPhone?: string;

  @ApiProperty({ description: 'Recipient email' })
  @Column({ length: 255, nullable: true })
  recipientEmail?: string;

  // Package Information
  @ApiProperty({ description: 'Package description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Package weight in kg' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;

  @ApiProperty({ description: 'Package length in cm' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length?: number;

  @ApiProperty({ description: 'Package width in cm' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width?: number;

  @ApiProperty({ description: 'Package height in cm' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height?: number;

  @ApiProperty({ description: 'Package value in USD' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value?: number;

  @ApiProperty({ description: 'Number of pieces' })
  @Column({ type: 'int', default: 1 })
  pieces: number;

  // Shipping Information
  @ApiProperty({ description: 'Estimated delivery date' })
  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryDate?: Date;

  @ApiProperty({ description: 'Actual delivery date' })
  @Column({ type: 'timestamp', nullable: true })
  actualDeliveryDate?: Date;

  @ApiProperty({ description: 'Pickup date' })
  @Column({ type: 'timestamp', nullable: true })
  pickupDate?: Date;

  @ApiProperty({ description: 'Ship date' })
  @Column({ type: 'timestamp', nullable: true })
  shipDate?: Date;

  // Cost Information
  @ApiProperty({ description: 'Shipping cost in USD' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shippingCost?: number;

  @ApiProperty({ description: 'Insurance cost in USD' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  insuranceCost?: number;

  @ApiProperty({ description: 'Total cost in USD' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost?: number;

  // Additional Information
  @ApiProperty({ description: 'Special instructions' })
  @Column({ type: 'text', nullable: true })
  specialInstructions?: string;

  @ApiProperty({ description: 'Reference number' })
  @Column({ length: 100, nullable: true })
  referenceNumber?: string;

  @ApiProperty({ description: 'Is fragile package' })
  @Column({ default: false })
  isFragile: boolean;

  @ApiProperty({ description: 'Requires signature' })
  @Column({ default: false })
  requiresSignature: boolean;

  @ApiProperty({ description: 'Is insured' })
  @Column({ default: false })
  isInsured: boolean;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @ApiProperty({ description: 'User who created the shipment' })
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Tracking events', type: [TrackingEvent] })
  @OneToMany(() => TrackingEvent, (event) => event.shipment, { cascade: true })
  trackingEvents: TrackingEvent[];

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get fullSenderAddress(): string {
    return `${this.senderAddress}, ${this.senderCity}, ${this.senderState} ${this.senderPostalCode}, ${this.senderCountry}`;
  }

  get fullRecipientAddress(): string {
    return `${this.recipientAddress}, ${this.recipientCity}, ${this.recipientState} ${this.recipientPostalCode}, ${this.recipientCountry}`;
  }

  get isDelivered(): boolean {
    return this.status === ShipmentStatus.DELIVERED;
  }

  get isInTransit(): boolean {
    return [
      ShipmentStatus.PICKED_UP,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.OUT_FOR_DELIVERY,
    ].includes(this.status);
  }

  get estimatedDaysRemaining(): number | null {
    if (!this.estimatedDeliveryDate || this.isDelivered) {
      return null;
    }
    const now = new Date();
    const diffTime = this.estimatedDeliveryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
