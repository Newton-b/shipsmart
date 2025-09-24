import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment, PaymentStatus, PaymentMethod, PaymentType } from './entities/payment.entity';
import { StripeService } from './services/stripe.service';
import { PayPalService } from './services/paypal.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly stripeService: StripeService,
    private readonly paypalService: PayPalService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    this.logger.log(`Payment created: ${savedPayment.id} for amount $${savedPayment.amountInDollars}`);

    return savedPayment;
  }

  async processPayment(paymentId: string, processPaymentDto: ProcessPaymentDto): Promise<Payment> {
    const payment = await this.findOne(paymentId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is not in pending status');
    }

    payment.status = PaymentStatus.PROCESSING;
    await this.paymentRepository.save(payment);

    try {
      let result: any;

      switch (payment.paymentMethod) {
        case PaymentMethod.CREDIT_CARD:
        case PaymentMethod.DEBIT_CARD:
          result = await this.processStripePayment(payment, processPaymentDto);
          break;
        case PaymentMethod.PAYPAL:
          result = await this.processPayPalPayment(payment, processPaymentDto);
          break;
        default:
          throw new BadRequestException(`Payment method ${payment.paymentMethod} not supported`);
      }

      // Update payment with successful result
      payment.status = PaymentStatus.COMPLETED;
      payment.processedAt = new Date();
      payment.transactionId = result.transactionId;
      payment.authorizationCode = result.authorizationCode;
      payment.processingFee = result.processingFee;
      payment.netAmount = payment.amount - (result.processingFee || 0);

      if (result.cardInfo) {
        payment.cardLast4 = result.cardInfo.last4;
        payment.cardBrand = result.cardInfo.brand;
        payment.cardExpiryMonth = result.cardInfo.expiryMonth;
        payment.cardExpiryYear = result.cardInfo.expiryYear;
      }

      await this.paymentRepository.save(payment);

      this.logger.log(`Payment processed successfully: ${payment.id}`);
      return payment;

    } catch (error) {
      // Update payment with failure
      payment.status = PaymentStatus.FAILED;
      payment.failedAt = new Date();
      payment.errorCode = error.code || 'UNKNOWN_ERROR';
      payment.errorMessage = error.message;

      await this.paymentRepository.save(payment);

      this.logger.error(`Payment processing failed: ${payment.id}`, error);
      throw error;
    }
  }

  private async processStripePayment(payment: Payment, processPaymentDto: ProcessPaymentDto) {
    if (payment.stripePaymentIntentId) {
      // Confirm existing payment intent
      const paymentIntent = await this.stripeService.confirmPaymentIntent(
        payment.stripePaymentIntentId,
        processPaymentDto.paymentMethodId,
      );

      return {
        transactionId: paymentIntent.id,
        authorizationCode: paymentIntent.charges?.data[0]?.authorization_code,
        processingFee: Math.round(payment.amount * 0.029 + 30), // Stripe fee: 2.9% + 30¢
        cardInfo: paymentIntent.charges?.data[0]?.payment_method_details?.card ? {
          last4: paymentIntent.charges.data[0].payment_method_details.card.last4,
          brand: paymentIntent.charges.data[0].payment_method_details.card.brand,
          expiryMonth: paymentIntent.charges.data[0].payment_method_details.card.exp_month,
          expiryYear: paymentIntent.charges.data[0].payment_method_details.card.exp_year,
        } : null,
      };
    } else {
      // Create new payment intent
      const paymentIntent = await this.stripeService.createPaymentIntent(
        payment.amountInDollars,
        payment.currency,
        {
          paymentId: payment.id,
          userId: payment.userId,
          shipmentId: payment.shipmentId,
        },
      );

      // Update payment with Stripe payment intent ID
      payment.stripePaymentIntentId = paymentIntent.id;
      await this.paymentRepository.save(payment);

      // If payment method is provided, confirm immediately
      if (processPaymentDto.paymentMethodId) {
        const confirmedIntent = await this.stripeService.confirmPaymentIntent(
          paymentIntent.id,
          processPaymentDto.paymentMethodId,
        );

        return {
          transactionId: confirmedIntent.id,
          authorizationCode: confirmedIntent.charges?.data[0]?.authorization_code,
          processingFee: Math.round(payment.amount * 0.029 + 30),
        };
      }

      return {
        clientSecret: paymentIntent.client_secret,
        transactionId: paymentIntent.id,
        processingFee: Math.round(payment.amount * 0.029 + 30),
      };
    }
  }

  private async processPayPalPayment(payment: Payment, processPaymentDto: ProcessPaymentDto) {
    // PayPal integration would go here
    // For now, return mock data
    return {
      transactionId: `pp_${Date.now()}`,
      authorizationCode: `AUTH_${Date.now()}`,
      processingFee: Math.round(payment.amount * 0.034 + 49), // PayPal fee: 3.4% + 49¢
    };
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string,
  ): Promise<Payment> {
    const payment = await this.findOne(paymentId);

    if (!payment.canRefund) {
      throw new BadRequestException('Payment cannot be refunded');
    }

    const refundAmount = amount || payment.remainingRefundAmount;

    if (refundAmount > payment.remainingRefundAmount) {
      throw new BadRequestException('Refund amount exceeds remaining refundable amount');
    }

    try {
      let refundResult: any;

      switch (payment.paymentMethod) {
        case PaymentMethod.CREDIT_CARD:
        case PaymentMethod.DEBIT_CARD:
          if (payment.stripePaymentIntentId) {
            refundResult = await this.stripeService.createRefund(
              payment.stripePaymentIntentId,
              refundAmount / 100,
              reason as any,
            );
          }
          break;
        case PaymentMethod.PAYPAL:
          // PayPal refund logic would go here
          refundResult = { id: `refund_${Date.now()}` };
          break;
      }

      // Update payment with refund information
      payment.refundedAmount += refundAmount;
      payment.refundReason = reason;
      payment.refundReference = refundResult?.id;
      payment.refundedAt = new Date();

      if (payment.refundedAmount >= payment.amount) {
        payment.status = PaymentStatus.REFUNDED;
      } else {
        payment.status = PaymentStatus.PARTIALLY_REFUNDED;
      }

      await this.paymentRepository.save(payment);

      this.logger.log(`Payment refunded: ${payment.id} - $${refundAmount / 100}`);
      return payment;

    } catch (error) {
      this.logger.error(`Refund failed for payment: ${payment.id}`, error);
      throw error;
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: string,
    status?: PaymentStatus,
  ): Promise<{ payments: Payment[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.shipment', 'shipment');

    if (userId) {
      queryBuilder.where('payment.userId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    const [payments, total] = await queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      payments,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'shipment'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalRevenue: number;
    successfulPayments: number;
    failedPayments: number;
    refundedAmount: number;
    averagePaymentAmount: number;
  }> {
    const [
      totalPayments,
      successfulPayments,
      failedPayments,
    ] = await Promise.all([
      this.paymentRepository.count(),
      this.paymentRepository.count({ where: { status: PaymentStatus.COMPLETED } }),
      this.paymentRepository.count({ where: { status: PaymentStatus.FAILED } }),
    ]);

    const revenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalRevenue')
      .addSelect('SUM(payment.refundedAmount)', 'refundedAmount')
      .addSelect('AVG(payment.amount)', 'averageAmount')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      totalPayments,
      totalRevenue: parseInt(revenueResult?.totalRevenue || '0'),
      successfulPayments,
      failedPayments,
      refundedAmount: parseInt(revenueResult?.refundedAmount || '0'),
      averagePaymentAmount: parseFloat(revenueResult?.averageAmount || '0'),
    };
  }
}
