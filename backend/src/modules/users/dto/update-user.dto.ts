import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Whether user account is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether user email is verified',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiProperty({
    description: 'User timezone',
    example: 'America/New_York',
    required: false,
  })
  @IsOptional()
  timezone?: string;

  @ApiProperty({
    description: 'User language preference',
    example: 'en',
    required: false,
  })
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'User notification preferences',
    example: {
      email: true,
      sms: false,
      push: true,
      shipmentUpdates: true,
      paymentAlerts: true,
      marketingEmails: false,
    },
    required: false,
  })
  @IsOptional()
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    shipmentUpdates: boolean;
    paymentAlerts: boolean;
    marketingEmails: boolean;
  };
}
