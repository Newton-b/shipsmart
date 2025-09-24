import { EmailService, EmailOptions } from './email.service';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendEmail(emailOptions: EmailOptions): Promise<{
        success: boolean;
        message: string;
    }>;
    sendWelcomeEmail(welcomeData: {
        email: string;
        name: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendShipmentNotification(notificationData: {
        email: string;
        trackingNumber: string;
        status: string;
        message: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendPaymentConfirmation(paymentData: {
        email: string;
        paymentId: string;
        amount: number;
        currency: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
