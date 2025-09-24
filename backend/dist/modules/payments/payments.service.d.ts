import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { StripeService } from './services/stripe.service';
import { PayPalService } from './services/paypal.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
export declare class PaymentsService {
    private readonly paymentRepository;
    private readonly stripeService;
    private readonly paypalService;
    private readonly logger;
    constructor(paymentRepository: Repository<Payment>, stripeService: StripeService, paypalService: PayPalService);
    createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment>;
    processPayment(paymentId: string, processPaymentDto: ProcessPaymentDto): Promise<Payment>;
    private processStripePayment;
    private processPayPalPayment;
    refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Payment>;
    findAll(page?: number, limit?: number, userId?: string, status?: PaymentStatus): Promise<{
        payments: Payment[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Payment>;
    getPaymentStats(): Promise<{
        totalPayments: number;
        totalRevenue: number;
        successfulPayments: number;
        failedPayments: number;
        refundedAmount: number;
        averagePaymentAmount: number;
    }>;
}
