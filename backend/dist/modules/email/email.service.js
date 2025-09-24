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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.initializeTransporter();
    }
    initializeTransporter() {
        const emailProvider = this.configService.get('EMAIL_PROVIDER', 'smtp');
        switch (emailProvider.toLowerCase()) {
            case 'sendgrid':
                this.initializeSendGrid();
                break;
            case 'ses':
                this.initializeAWSSES();
                break;
            case 'smtp':
            default:
                this.initializeSMTP();
                break;
        }
    }
    initializeSMTP() {
        const host = this.configService.get('SMTP_HOST');
        const port = this.configService.get('SMTP_PORT', 587);
        const secure = this.configService.get('SMTP_SECURE', false);
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        if (!host || !user || !pass) {
            this.logger.warn('SMTP credentials not configured, email functionality will be mocked');
            return;
        }
        this.transporter = nodemailer.createTransporter({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
        });
        this.logger.log('SMTP transporter initialized');
    }
    initializeSendGrid() {
        const apiKey = this.configService.get('SENDGRID_API_KEY');
        if (!apiKey) {
            this.logger.warn('SendGrid API key not configured, email functionality will be mocked');
            return;
        }
        this.transporter = nodemailer.createTransporter({
            service: 'SendGrid',
            auth: {
                user: 'apikey',
                pass: apiKey,
            },
        });
        this.logger.log('SendGrid transporter initialized');
    }
    initializeAWSSES() {
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
        const region = this.configService.get('AWS_REGION', 'us-east-1');
        if (!accessKeyId || !secretAccessKey) {
            this.logger.warn('AWS SES credentials not configured, email functionality will be mocked');
            return;
        }
        this.transporter = nodemailer.createTransporter({
            SES: {
                aws: {
                    accessKeyId,
                    secretAccessKey,
                    region,
                },
            },
        });
        this.logger.log('AWS SES transporter initialized');
    }
    async sendEmail(options) {
        if (!this.transporter) {
            return this.mockSendEmail(options);
        }
        try {
            const fromEmail = this.configService.get('EMAIL_FROM', 'noreply@shipsmart.com');
            const fromName = this.configService.get('EMAIL_FROM_NAME', 'ShipSmart');
            const mailOptions = {
                from: `${fromName} <${fromEmail}>`,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                attachments: options.attachments,
            };
            const result = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully: ${result.messageId}`);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send email:', error);
            return false;
        }
    }
    async sendWelcomeEmail(email, name) {
        const subject = 'Welcome to ShipSmart!';
        const html = this.generateWelcomeEmailTemplate(name);
        return this.sendEmail({
            to: email,
            subject,
            html,
        });
    }
    async sendPasswordResetEmail(email, resetToken) {
        const subject = 'Reset Your ShipSmart Password';
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
        const html = this.generatePasswordResetEmailTemplate(resetUrl);
        return this.sendEmail({
            to: email,
            subject,
            html,
        });
    }
    async sendShipmentNotificationEmail(email, trackingNumber, status, message) {
        const subject = `Shipment Update: ${trackingNumber}`;
        const html = this.generateShipmentNotificationTemplate(trackingNumber, status, message);
        return this.sendEmail({
            to: email,
            subject,
            html,
        });
    }
    async sendPaymentConfirmationEmail(email, paymentId, amount, currency) {
        const subject = 'Payment Confirmation - ShipSmart';
        const html = this.generatePaymentConfirmationTemplate(paymentId, amount, currency);
        return this.sendEmail({
            to: email,
            subject,
            html,
        });
    }
    async sendNotificationEmail(userId, title, message, actionUrl) {
        const email = `user-${userId}@example.com`;
        const subject = `ShipSmart Notification: ${title}`;
        const html = this.generateNotificationEmailTemplate(title, message, actionUrl);
        return this.sendEmail({
            to: email,
            subject,
            html,
        });
    }
    mockSendEmail(options) {
        this.logger.log('Mock email sent:', {
            to: options.to,
            subject: options.subject,
            hasHtml: !!options.html,
            hasText: !!options.text,
            attachments: options.attachments?.length || 0,
        });
        return true;
    }
    generateWelcomeEmailTemplate(name) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ShipSmart</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
          <h1>Welcome to ShipSmart!</h1>
          <p style="font-size: 18px;">Your freight forwarding journey starts here</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa; margin-top: 20px; border-radius: 10px;">
          <h2>Hello ${name},</h2>
          <p>Thank you for joining ShipSmart! We're excited to help you streamline your shipping operations.</p>
          
          <h3>What you can do with ShipSmart:</h3>
          <ul>
            <li>Track shipments in real-time</li>
            <li>Compare rates from multiple carriers</li>
            <li>Manage your logistics operations</li>
            <li>Access detailed analytics and reports</li>
          </ul>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>Need help? Contact us at support@shipsmart.com</p>
        </div>
      </body>
      </html>
    `;
    }
    generatePasswordResetEmailTemplate(resetUrl) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your ShipSmart account password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;
    }
    generateShipmentNotificationTemplate(trackingNumber, status, message) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Shipment Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #e3f2fd; padding: 30px; border-radius: 10px;">
          <h2>Shipment Update</h2>
          <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p>${message}</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.configService.get('FRONTEND_URL')}/track/${trackingNumber}" 
               style="background: #2196f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Track Shipment
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    generatePaymentConfirmationTemplate(paymentId, amount, currency) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #e8f5e8; padding: 30px; border-radius: 10px;">
          <h2>Payment Confirmed</h2>
          <p>Your payment has been successfully processed.</p>
          
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>Amount:</strong> ${amount.toFixed(2)} ${currency}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${this.configService.get('FRONTEND_URL')}/payments/${paymentId}" 
               style="background: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Payment Details
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    generateNotificationEmailTemplate(title, message, actionUrl) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fff3cd; padding: 30px; border-radius: 10px;">
          <h2>${title}</h2>
          <p>${message}</p>
          
          ${actionUrl ? `
            <div style="text-align: center; margin-top: 30px;">
              <a href="${actionUrl}" 
                 style="background: #ffc107; color: #212529; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Details
              </a>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map