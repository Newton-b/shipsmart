import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Shipment } from './shipment.entity';

export enum TrackingEventType {
  CREATED = 'created',
  CONFIRMED = 'confirmed',
  PICKED_UP = 'picked_up',
  DEPARTED = 'departed',
  ARRIVED = 'arrived',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

@Entity('tracking_events')
@Index(['shipmentId'])
@Index(['eventType'])
@Index(['eventDate'])
export class TrackingEvent {
  @ApiProperty({ description: 'Event ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Event type', enum: TrackingEventType })
  @Column({
    type: 'enum',
    enum: TrackingEventType,
  })
  eventType: TrackingEventType;

  @ApiProperty({ description: 'Event description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Event location' })
  @Column({ length: 255, nullable: true })
  location?: string;

  @ApiProperty({ description: 'Event city' })
  @Column({ length: 100, nullable: true })
  city?: string;

  @ApiProperty({ description: 'Event state/province' })
  @Column({ length: 100, nullable: true })
  state?: string;

  @ApiProperty({ description: 'Event country' })
  @Column({ length: 100, nullable: true })
  country?: string;

  @ApiProperty({ description: 'Event postal code' })
  @Column({ length: 20, nullable: true })
  postalCode?: string;

  @ApiProperty({ description: 'Event date and time' })
  @Column({ type: 'timestamp' })
  @Index()
  eventDate: Date;

  @ApiProperty({ description: 'Event timezone' })
  @Column({ length: 50, nullable: true })
  timezone?: string;

  @ApiProperty({ description: 'Carrier event code' })
  @Column({ length: 50, nullable: true })
  carrierEventCode?: string;

  @ApiProperty({ description: 'Additional event details' })
  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any>;

  @ApiProperty({ description: 'Event source (carrier, system, manual)' })
  @Column({ length: 50, default: 'carrier' })
  source: string;

  @ApiProperty({ description: 'Is this event an exception' })
  @Column({ default: false })
  isException: boolean;

  @ApiProperty({ description: 'Exception reason if applicable' })
  @Column({ type: 'text', nullable: true })
  exceptionReason?: string;

  // Relations
  @ApiProperty({ description: 'Associated shipment' })
  @ManyToOne(() => Shipment, (shipment) => shipment.trackingEvents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column({ name: 'shipmentId' })
  @Index()
  shipmentId: string;

  @ApiProperty({ description: 'Event creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  // Virtual properties
  get fullLocation(): string {
    const parts = [this.location, this.city, this.state, this.country].filter(Boolean);
    return parts.join(', ');
  }

  get isDeliveryEvent(): boolean {
    return this.eventType === TrackingEventType.DELIVERED;
  }

  get isExceptionEvent(): boolean {
    return this.eventType === TrackingEventType.EXCEPTION || this.isException;
  }
}
