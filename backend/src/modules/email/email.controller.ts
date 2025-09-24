import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { EmailService, EmailOptions } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send custom email (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
  })
  async sendEmail(@Body() emailOptions: EmailOptions) {
    const success = await this.emailService.sendEmail(emailOptions);
    return {
      success,
      message: success ? 'Email sent successfully' : 'Failed to send email',
    };
  }

  @Post('welcome')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send welcome email (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Welcome email sent successfully',
  })
  async sendWelcomeEmail(
    @Body() welcomeData: { email: string; name: string },
  ) {
    const success = await this.emailService.sendWelcomeEmail(
      welcomeData.email,
      welcomeData.name,
    );
    return {
      success,
      message: success ? 'Welcome email sent successfully' : 'Failed to send welcome email',
    };
  }

  @Post('shipment-notification')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Send shipment notification email' })
  @ApiResponse({
    status: 200,
    description: 'Shipment notification sent successfully',
  })
  async sendShipmentNotification(
    @Body() notificationData: {
      email: string;
      trackingNumber: string;
      status: string;
      message: string;
    },
  ) {
    const success = await this.emailService.sendShipmentNotificationEmail(
      notificationData.email,
      notificationData.trackingNumber,
      notificationData.status,
      notificationData.message,
    );
    return {
      success,
      message: success ? 'Shipment notification sent successfully' : 'Failed to send notification',
    };
  }

  @Post('payment-confirmation')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: 'Send payment confirmation email' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmation sent successfully',
  })
  async sendPaymentConfirmation(
    @Body() paymentData: {
      email: string;
      paymentId: string;
      amount: number;
      currency: string;
    },
  ) {
    const success = await this.emailService.sendPaymentConfirmationEmail(
      paymentData.email,
      paymentData.paymentId,
      paymentData.amount,
      paymentData.currency,
    );
    return {
      success,
      message: success ? 'Payment confirmation sent successfully' : 'Failed to send confirmation',
    };
  }
}
