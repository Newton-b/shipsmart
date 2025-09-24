import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Stripe Payment Method ID', required: false })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiProperty({ description: 'PayPal Order ID', required: false })
  @IsOptional()
  @IsString()
  paypalOrderId?: string;

  @ApiProperty({ description: 'PayPal Payer ID', required: false })
  @IsOptional()
  @IsString()
  paypalPayerId?: string;

  @ApiProperty({ description: 'Additional processing data', required: false })
  @IsOptional()
  additionalData?: Record<string, any>;
}
