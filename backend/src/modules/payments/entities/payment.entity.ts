import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  WIRE_TRANSFER = 'wire_transfer',
  CHECK = 'check',
  CASH = 'cash',
}

export enum PaymentType {
  SHIPMENT = 'shipment',
  SUBSCRIPTION = 'subscription',
  REFUND = 'refund',
  FEE = 'fee',
  ADJUSTMENT = 'adjustment',
}

@Entity('payments')
@Index(['userId'])
@Index(['shipmentId'])
@Index(['status'])
@Index(['paymentMethod'])
@Index(['stripePaymentIntentId'])
export class Payment {
  @ApiProperty({ description: 'Payment ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Payment amount in cents' })
  @Column({ type: 'bigint' })
  amount: number;

  @ApiProperty({ description: 'Currency code (ISO 4217)' })
  @Column({ length: 3, default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Index()
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  @Index()
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment type', enum: PaymentType })
  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.SHIPMENT,
  })
  paymentType: PaymentType;

  @ApiProperty({ description: 'Payment description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Payment reference number' })
  @Column({ length: 100, nullable: true })
  referenceNumber?: string;

  // Stripe Integration
  @ApiProperty({ description: 'Stripe Payment Intent ID' })
  @Column({ length: 255, nullable: true })
  @Index()
  stripePaymentIntentId?: string;

  @ApiProperty({ description: 'Stripe Customer ID' })
  @Column({ length: 255, nullable: true })
  stripeCustomerId?: string;

  @ApiProperty({ description: 'Stripe Payment Method ID' })
  @Column({ length: 255, nullable: true })
  stripePaymentMethodId?: string;

  // PayPal Integration
  @ApiProperty({ description: 'PayPal Order ID' })
  @Column({ length: 255, nullable: true })
  paypalOrderId?: string;

  @ApiProperty({ description: 'PayPal Payer ID' })
  @Column({ length: 255, nullable: true })
  paypalPayerId?: string;

  // Transaction Details
  @ApiProperty({ description: 'Transaction ID from payment processor' })
  @Column({ length: 255, nullable: true })
  transactionId?: string;

  @ApiProperty({ description: 'Authorization code' })
  @Column({ length: 100, nullable: true })
  authorizationCode?: string;

  @ApiProperty({ description: 'Processing fee in cents' })
  @Column({ type: 'int', nullable: true })
  processingFee?: number;

  @ApiProperty({ description: 'Net amount after fees in cents' })
  @Column({ type: 'bigint', nullable: true })
  netAmount?: number;

  // Refund Information
  @ApiProperty({ description: 'Refunded amount in cents' })
  @Column({ type: 'bigint', default: 0 })
  refundedAmount: number;

  @ApiProperty({ description: 'Refund reason' })
  @Column({ type: 'text', nullable: true })
  refundReason?: string;

  @ApiProperty({ description: 'Refund reference' })
  @Column({ length: 255, nullable: true })
  refundReference?: string;

  // Billing Information
  @ApiProperty({ description: 'Billing name' })
  @Column({ length: 255, nullable: true })
  billingName?: string;

  @ApiProperty({ description: 'Billing email' })
  @Column({ length: 255, nullable: true })
  billingEmail?: string;

  @ApiProperty({ description: 'Billing address' })
  @Column({ type: 'text', nullable: true })
  billingAddress?: string;

  @ApiProperty({ description: 'Billing city' })
  @Column({ length: 100, nullable: true })
  billingCity?: string;

  @ApiProperty({ description: 'Billing state/province' })
  @Column({ length: 100, nullable: true })
  billingState?: string;

  @ApiProperty({ description: 'Billing postal code' })
  @Column({ length: 20, nullable: true })
  billingPostalCode?: string;

  @ApiProperty({ description: 'Billing country' })
  @Column({ length: 100, nullable: true })
  billingCountry?: string;

  // Card Information (last 4 digits only for security)
  @ApiProperty({ description: 'Last 4 digits of card' })
  @Column({ length: 4, nullable: true })
  cardLast4?: string;

  @ApiProperty({ description: 'Card brand (Visa, MasterCard, etc.)' })
  @Column({ length: 50, nullable: true })
  cardBrand?: string;

  @ApiProperty({ description: 'Card expiry month' })
  @Column({ type: 'int', nullable: true })
  cardExpiryMonth?: number;

  @ApiProperty({ description: 'Card expiry year' })
  @Column({ type: 'int', nullable: true })
  cardExpiryYear?: number;

  // Timestamps
  @ApiProperty({ description: 'Payment processed at' })
  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @ApiProperty({ description: 'Payment failed at' })
  @Column({ type: 'timestamp', nullable: true })
  failedAt?: Date;

  @ApiProperty({ description: 'Payment refunded at' })
  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date;

  // Error Information
  @ApiProperty({ description: 'Error code from payment processor' })
  @Column({ length: 100, nullable: true })
  errorCode?: string;

  @ApiProperty({ description: 'Error message' })
  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  // Additional metadata
  @ApiProperty({ description: 'Additional payment metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @ApiProperty({ description: 'User who made the payment' })
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Associated shipment' })
  @ManyToOne(() => Shipment, { eager: false, nullable: true })
  @JoinColumn({ name: 'shipmentId' })
  shipment?: Shipment;

  @Column({ name: 'shipmentId', nullable: true })
  @Index()
  shipmentId?: string;

  @ApiProperty({ description: 'Payment creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Payment last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get amountInDollars(): number {
    return this.amount / 100;
  }

  get netAmountInDollars(): number {
    return this.netAmount ? this.netAmount / 100 : 0;
  }

  get refundedAmountInDollars(): number {
    return this.refundedAmount / 100;
  }

  get isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  get isRefunded(): boolean {
    return this.status === PaymentStatus.REFUNDED || this.status === PaymentStatus.PARTIALLY_REFUNDED;
  }

  get canRefund(): boolean {
    return this.status === PaymentStatus.COMPLETED && this.refundedAmount < this.amount;
  }

  get remainingRefundAmount(): number {
    return this.amount - this.refundedAmount;
  }
}
