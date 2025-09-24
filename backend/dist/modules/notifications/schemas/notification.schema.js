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
exports.NotificationSchema = exports.Notification = exports.NotificationStatus = exports.NotificationPriority = exports.NotificationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
var NotificationType;
(function (NotificationType) {
    NotificationType["SHIPMENT_UPDATE"] = "shipment_update";
    NotificationType["DELIVERY_ALERT"] = "delivery_alert";
    NotificationType["PAYMENT_CONFIRMATION"] = "payment_confirmation";
    NotificationType["SYSTEM_ALERT"] = "system_alert";
    NotificationType["CARRIER_UPDATE"] = "carrier_update";
    NotificationType["WEATHER_ALERT"] = "weather_alert";
    NotificationType["DELAY_NOTIFICATION"] = "delay_notification";
    NotificationType["CUSTOMS_CLEARANCE"] = "customs_clearance";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["CRITICAL"] = "critical";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["UNREAD"] = "unread";
    NotificationStatus["READ"] = "read";
    NotificationStatus["ARCHIVED"] = "archived";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification ID' }),
    __metadata("design:type", String)
], Notification.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who receives the notification' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification type', enum: NotificationType }),
    (0, mongoose_1.Prop)({
        required: true,
        enum: NotificationType,
        index: true
    }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification priority', enum: NotificationPriority }),
    (0, mongoose_1.Prop)({
        required: true,
        enum: NotificationPriority,
        default: NotificationPriority.MEDIUM
    }),
    __metadata("design:type", String)
], Notification.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification status', enum: NotificationStatus }),
    (0, mongoose_1.Prop)({
        required: true,
        enum: NotificationStatus,
        default: NotificationStatus.UNREAD,
        index: true
    }),
    __metadata("design:type", String)
], Notification.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification title' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification message' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notification data' }),
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Notification.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related shipment ID' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], Notification.prototype, "shipmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Related payment ID' }),
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], Notification.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action URL for the notification' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "actionUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action button text' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "actionText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification icon' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to send email notification' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "sendEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether to send push notification' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "sendPush", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether email was sent' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "emailSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether push notification was sent' }),
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "pushSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the notification was read' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the notification expires' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification creation timestamp' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification last update timestamp' }),
    __metadata("design:type", Date)
], Notification.prototype, "updatedAt", void 0);
exports.Notification = Notification = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Notification);
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(Notification);
exports.NotificationSchema.index({ userId: 1, status: 1 });
exports.NotificationSchema.index({ userId: 1, type: 1 });
exports.NotificationSchema.index({ userId: 1, createdAt: -1 });
exports.NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.NotificationSchema.index({ shipmentId: 1 });
exports.NotificationSchema.index({ paymentId: 1 });
//# sourceMappingURL=notification.schema.js.map