import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'administrator',
  END_USER = 'end_user',
  CARRIER = 'carrier',
  DRIVER = 'driver',
  DISPATCHER = 'dispatcher',
  CUSTOMER_SERVICE = 'customer_service',
  FINANCE = 'finance',
}

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @ApiProperty({ description: 'User ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true, length: 255 })
  @Index()
  email: string;

  @Exclude()
  @Column({ length: 255 })
  password: string;

  @ApiProperty({ description: 'User first name' })
  @Column({ length: 100 })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @Column({ length: 100 })
  lastName: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.END_USER,
  })
  role: UserRole;

  @ApiProperty({ description: 'User phone number' })
  @Column({ length: 20, nullable: true })
  phone?: string;

  @ApiProperty({ description: 'User company name' })
  @Column({ length: 255, nullable: true })
  company?: string;

  @ApiProperty({ description: 'User address' })
  @Column({ type: 'text', nullable: true })
  address?: string;

  @ApiProperty({ description: 'User city' })
  @Column({ length: 100, nullable: true })
  city?: string;

  @ApiProperty({ description: 'User state/province' })
  @Column({ length: 100, nullable: true })
  state?: string;

  @ApiProperty({ description: 'User postal code' })
  @Column({ length: 20, nullable: true })
  postalCode?: string;

  @ApiProperty({ description: 'User country' })
  @Column({ length: 100, nullable: true })
  country?: string;

  @ApiProperty({ description: 'User avatar URL' })
  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @ApiProperty({ description: 'Whether user account is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Whether user email is verified' })
  @Column({ default: false })
  emailVerified: boolean;

  @ApiProperty({ description: 'User timezone' })
  @Column({ length: 50, default: 'UTC' })
  timezone: string;

  @ApiProperty({ description: 'User language preference' })
  @Column({ length: 10, default: 'en' })
  language: string;

  @ApiProperty({ description: 'User notification preferences' })
  @Column({ type: 'jsonb', nullable: true })
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    shipmentUpdates: boolean;
    paymentAlerts: boolean;
    marketingEmails: boolean;
  };

  @Exclude()
  @Column({ type: 'text', nullable: true })
  resetToken?: string;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date;

  @ApiProperty({ description: 'Last login timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations will be added as we create other entities
  // @OneToMany(() => Shipment, shipment => shipment.user)
  // shipments: Shipment[];

  // @OneToMany(() => Payment, payment => payment.user)
  // payments: Payment[];

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Methods
  toJSON() {
    const { password, resetToken, resetTokenExpiry, ...result } = this;
    return result;
  }
}
