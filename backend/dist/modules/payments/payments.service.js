"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const stripe_service_1 = require("./services/stripe.service");
const paypal_service_1 = require("./services/paypal.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentRepository, stripeService, paypalService) {
        this.paymentRepository = paymentRepository;
        this.stripeService = stripeService;
        this.paypalService = paypalService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async createPayment(createPaymentDto) {
        const payment = this.paymentRepository.create({
            ...createPaymentDto,
            status: payment_entity_1.PaymentStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const savedPayment = await this.paymentRepository.save(payment);
        this.logger.log(`Payment created: ${savedPayment.id} for amount $${savedPayment.amountInDollars}`);
        return savedPayment;
    }
    async processPayment(paymentId, processPaymentDto) {
        const payment = await this.findOne(paymentId);
        if (payment.status !== payment_entity_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Payment is not in pending status');
        }
        payment.status = payment_entity_1.PaymentStatus.PROCESSING;
        await this.paymentRepository.save(payment);
        try {
            let result;
            switch (payment.paymentMethod) {
                case payment_entity_1.PaymentMethod.CREDIT_CARD:
                case payment_entity_1.PaymentMethod.DEBIT_CARD:
                    result = await this.processStripePayment(payment, processPaymentDto);
                    break;
                case payment_entity_1.PaymentMethod.PAYPAL:
                    result = await this.processPayPalPayment(payment, processPaymentDto);
                    break;
                default:
                    throw new common_1.BadRequestException(`Payment method ${payment.paymentMethod} not supported`);
            }
            payment.status = payment_entity_1.PaymentStatus.COMPLETED;
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
        }
        catch (error) {
            payment.status = payment_entity_1.PaymentStatus.FAILED;
            payment.failedAt = new Date();
            payment.errorCode = error.code || 'UNKNOWN_ERROR';
            payment.errorMessage = error.message;
            await this.paymentRepository.save(payment);
            this.logger.error(`Payment processing failed: ${payment.id}`, error);
            throw error;
        }
    }
    async processStripePayment(payment, processPaymentDto) {
        if (payment.stripePaymentIntentId) {
            const paymentIntent = await this.stripeService.confirmPaymentIntent(payment.stripePaymentIntentId, processPaymentDto.paymentMethodId);
            return {
                transactionId: paymentIntent.id,
                authorizationCode: paymentIntent.charges?.data[0]?.authorization_code,
                processingFee: Math.round(payment.amount * 0.029 + 30),
                cardInfo: paymentIntent.charges?.data[0]?.payment_method_details?.card ? {
                    last4: paymentIntent.charges.data[0].payment_method_details.card.last4,
                    brand: paymentIntent.charges.data[0].payment_method_details.card.brand,
                    expiryMonth: paymentIntent.charges.data[0].payment_method_details.card.exp_month,
                    expiryYear: paymentIntent.charges.data[0].payment_method_details.card.exp_year,
                } : null,
            };
        }
        else {
            const paymentIntent = await this.stripeService.createPaymentIntent(payment.amountInDollars, payment.currency, {
                paymentId: payment.id,
                userId: payment.userId,
                shipmentId: payment.shipmentId,
            });
            payment.stripePaymentIntentId = paymentIntent.id;
            await this.paymentRepository.save(payment);
            if (processPaymentDto.paymentMethodId) {
                const confirmedIntent = await this.stripeService.confirmPaymentIntent(paymentIntent.id, processPaymentDto.paymentMethodId);
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
    async processPayPalPayment(payment, processPaymentDto) {
        return {
            transactionId: `pp_${Date.now()}`,
            authorizationCode: `AUTH_${Date.now()}`,
            processingFee: Math.round(payment.amount * 0.034 + 49),
        };
    }
    async refundPayment(paymentId, amount, reason) {
        const payment = await this.findOne(paymentId);
        if (!payment.canRefund) {
            throw new common_1.BadRequestException('Payment cannot be refunded');
        }
        const refundAmount = amount || payment.remainingRefundAmount;
        if (refundAmount > payment.remainingRefundAmount) {
            throw new common_1.BadRequestException('Refund amount exceeds remaining refundable amount');
        }
        try {
            let refundResult;
            switch (payment.paymentMethod) {
                case payment_entity_1.PaymentMethod.CREDIT_CARD:
                case payment_entity_1.PaymentMethod.DEBIT_CARD:
                    if (payment.stripePaymentIntentId) {
                        refundResult = await this.stripeService.createRefund(payment.stripePaymentIntentId, refundAmount / 100, reason);
                    }
                    break;
                case payment_entity_1.PaymentMethod.PAYPAL:
                    refundResult = { id: `refund_${Date.now()}` };
                    break;
            }
            payment.refundedAmount += refundAmount;
            payment.refundReason = reason;
            payment.refundReference = refundResult?.id;
            payment.refundedAt = new Date();
            if (payment.refundedAmount >= payment.amount) {
                payment.status = payment_entity_1.PaymentStatus.REFUNDED;
            }
            else {
                payment.status = payment_entity_1.PaymentStatus.PARTIALLY_REFUNDED;
            }
            await this.paymentRepository.save(payment);
            this.logger.log(`Payment refunded: ${payment.id} - $${refundAmount / 100}`);
            return payment;
        }
        catch (error) {
            this.logger.error(`Refund failed for payment: ${payment.id}`, error);
            throw error;
        }
    }
    async findAll(page = 1, limit = 10, userId, status) {
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
    async findOne(id) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['user', 'shipment'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async getPaymentStats() {
        const [totalPayments, successfulPayments, failedPayments,] = await Promise.all([
            this.paymentRepository.count(),
            this.paymentRepository.count({ where: { status: payment_entity_1.PaymentStatus.COMPLETED } }),
            this.paymentRepository.count({ where: { status: payment_entity_1.PaymentStatus.FAILED } }),
        ]);
        const revenueResult = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'totalRevenue')
            .addSelect('SUM(payment.refundedAmount)', 'refundedAmount')
            .addSelect('AVG(payment.amount)', 'averageAmount')
            .where('payment.status = :status', { status: payment_entity_1.PaymentStatus.COMPLETED })
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, stripe_service_1.StripeService,
        paypal_service_1.PayPalService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map