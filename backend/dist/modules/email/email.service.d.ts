import { ConfigService } from '@nestjs/config';
export interface EmailOptions {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }>;
}
export declare class EmailService {
    private readonly configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    private initializeSMTP;
    private initializeSendGrid;
    private initializeAWSSES;
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendWelcomeEmail(email: string, name: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean>;
    sendShipmentNotificationEmail(email: string, trackingNumber: string, status: string, message: string): Promise<boolean>;
    sendPaymentConfirmationEmail(email: string, paymentId: string, amount: number, currency: string): Promise<boolean>;
    sendNotificationEmail(userId: string, title: string, message: string, actionUrl?: string): Promise<boolean>;
    private mockSendEmail;
    private generateWelcomeEmailTemplate;
    private generatePasswordResetEmailTemplate;
    private generateShipmentNotificationTemplate;
    private generatePaymentConfirmationTemplate;
    private generateNotificationEmailTemplate;
}
