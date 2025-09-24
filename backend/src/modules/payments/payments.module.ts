import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './services/stripe.service';
import { PayPalService } from './services/paypal.service';
import { Payment } from './entities/payment.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Payment]),
    AuthModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService, PayPalService],
  exports: [PaymentsService, StripeService, PayPalService],
})
export class PaymentsModule {}
