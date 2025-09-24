import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsObject, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType, NotificationPriority } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID who receives the notification' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Notification type', enum: NotificationType })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Notification priority', enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.MEDIUM;

  @ApiProperty({ description: 'Notification title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ description: 'Additional notification data', required: false })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ description: 'Related shipment ID', required: false })
  @IsOptional()
  @IsString()
  shipmentId?: string;

  @ApiProperty({ description: 'Related payment ID', required: false })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiProperty({ description: 'Action URL for the notification', required: false })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiProperty({ description: 'Action button text', required: false })
  @IsOptional()
  @IsString()
  actionText?: string;

  @ApiProperty({ description: 'Notification icon', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Whether to send email notification', default: false })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean = false;

  @ApiProperty({ description: 'Whether to send push notification', default: false })
  @IsOptional()
  @IsBoolean()
  sendPush?: boolean = false;

  @ApiProperty({ description: 'When the notification expires', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
