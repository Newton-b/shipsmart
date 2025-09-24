import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentStatus } from './entities/payment.entity';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(createPaymentDto: CreatePaymentDto): Promise<import("./entities/payment.entity").Payment>;
    processPayment(id: string, processPaymentDto: ProcessPaymentDto): Promise<import("./entities/payment.entity").Payment>;
    refundPayment(id: string, refundData: {
        amount?: number;
        reason?: string;
    }): Promise<import("./entities/payment.entity").Payment>;
    findAll(page?: number, limit?: number, userId?: string, status?: PaymentStatus): Promise<{
        payments: import("./entities/payment.entity").Payment[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPaymentStats(): Promise<{
        totalPayments: number;
        totalRevenue: number;
        successfulPayments: number;
        failedPayments: number;
        refundedAmount: number;
        averagePaymentAmount: number;
    }>;
    findOne(id: string): Promise<import("./entities/payment.entity").Payment>;
}
