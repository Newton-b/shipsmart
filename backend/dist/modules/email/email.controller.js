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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_service_1 = require("./email.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let EmailController = class EmailController {
    constructor(emailService) {
        this.emailService = emailService;
    }
    async sendEmail(emailOptions) {
        const success = await this.emailService.sendEmail(emailOptions);
        return {
            success,
            message: success ? 'Email sent successfully' : 'Failed to send email',
        };
    }
    async sendWelcomeEmail(welcomeData) {
        const success = await this.emailService.sendWelcomeEmail(welcomeData.email, welcomeData.name);
        return {
            success,
            message: success ? 'Welcome email sent successfully' : 'Failed to send welcome email',
        };
    }
    async sendShipmentNotification(notificationData) {
        const success = await this.emailService.sendShipmentNotificationEmail(notificationData.email, notificationData.trackingNumber, notificationData.status, notificationData.message);
        return {
            success,
            message: success ? 'Shipment notification sent successfully' : 'Failed to send notification',
        };
    }
    async sendPaymentConfirmation(paymentData) {
        const success = await this.emailService.sendPaymentConfirmationEmail(paymentData.email, paymentData.paymentId, paymentData.amount, paymentData.currency);
        return {
            success,
            message: success ? 'Payment confirmation sent successfully' : 'Failed to send confirmation',
        };
    }
};
exports.EmailController = EmailController;
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Send custom email (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Email sent successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('welcome'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Send welcome email (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Welcome email sent successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendWelcomeEmail", null);
__decorate([
    (0, common_1.Post)('shipment-notification'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.DISPATCHER),
    (0, swagger_1.ApiOperation)({ summary: 'Send shipment notification email' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Shipment notification sent successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendShipmentNotification", null);
__decorate([
    (0, common_1.Post)('payment-confirmation'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: 'Send payment confirmation email' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment confirmation sent successfully',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailController.prototype, "sendPaymentConfirmation", null);
exports.EmailController = EmailController = __decorate([
    (0, swagger_1.ApiTags)('Email'),
    (0, common_1.Controller)('email'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailController);
//# sourceMappingURL=email.controller.js.map