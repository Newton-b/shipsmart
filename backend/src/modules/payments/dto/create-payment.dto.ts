import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Payment amount in dollars', example: 99.99 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment type', enum: PaymentType, default: PaymentType.SHIPMENT })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType = PaymentType.SHIPMENT;

  @ApiProperty({ description: 'Payment description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'User ID making the payment' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Associated shipment ID', required: false })
  @IsOptional()
  @IsUUID()
  shipmentId?: string;

  @ApiProperty({ description: 'Billing name', required: false })
  @IsOptional()
  @IsString()
  billingName?: string;

  @ApiProperty({ description: 'Billing email', required: false })
  @IsOptional()
  @IsString()
  billingEmail?: string;

  @ApiProperty({ description: 'Billing address', required: false })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiProperty({ description: 'Billing city', required: false })
  @IsOptional()
  @IsString()
  billingCity?: string;

  @ApiProperty({ description: 'Billing state', required: false })
  @IsOptional()
  @IsString()
  billingState?: string;

  @ApiProperty({ description: 'Billing postal code', required: false })
  @IsOptional()
  @IsString()
  billingPostalCode?: string;

  @ApiProperty({ description: 'Billing country', required: false })
  @IsOptional()
  @IsString()
  billingCountry?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
