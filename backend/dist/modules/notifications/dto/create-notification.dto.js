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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNotificationDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const notification_schema_1 = require("../schemas/notification.schema");
class CreateNotificationDto {
    constructor() {
        this.priority = notification_schema_1.NotificationPriority.MEDIUM;
        this.sendEmail = false;
        this.sendPush = false;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String }, type: { required: true, enum: require("../schemas/notification.schema").NotificationType }, priority: { required: false, default: notification_schema_1.NotificationPriority.MEDIUM, enum: require("../schemas/notification.schema").NotificationPriority }, title: { required: true, type: () => String }, message: { required: true, type: () => String }, data: { required: false, type: () => Object }, shipmentId: { required: false, type: () => String }, paymentId: { required: false, type: () => String }, actionUrl: { required: false, type: () => String }, actionText: { required: false, type: () => String }, icon: { required: false, type: () => String }, sendEmail: { required: false, type: () => Boolean, default: false }, sendPush: { required: false, type: () => Boolean, default: false }, expiresAt: { required: false, type: () => Date } };
    }
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who receives the notification' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification type', enum: notification_schema_1.NotificationType }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(notification_schema_1.NotificationType),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification priority', enum: notification_schema_1.NotificationPriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(notification_schema_1.NotificationPriority),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification title' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification message' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notification data', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related shipment ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "shipmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related payment ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action URL for the notification', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "actionUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action button text', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "actionText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification icon', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to send email notification', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNotificationDto.prototype, "sendEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to send push notification', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNotificationDto.prototype, "sendPush", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the notification expires', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateNotificationDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=create-notification.dto.js.map