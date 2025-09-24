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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const notification_schema_1 = require("./schemas/notification.schema");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const email_service_1 = require("../email/email.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(notificationModel, webSocketGateway, emailService) {
        this.notificationModel = notificationModel;
        this.webSocketGateway = webSocketGateway;
        this.emailService = emailService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async create(createNotificationDto) {
        const notification = new this.notificationModel({
            ...createNotificationDto,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const savedNotification = await notification.save();
        this.webSocketGateway.sendNotificationToUser(createNotificationDto.userId, savedNotification.toObject());
        if (createNotificationDto.sendEmail) {
            this.sendEmailNotification(savedNotification);
        }
        if (createNotificationDto.sendPush) {
            this.sendPushNotification(savedNotification);
        }
        this.logger.log(`Notification created: ${savedNotification._id} for user: ${createNotificationDto.userId}`);
        return savedNotification;
    }
    async findAll(userId, page = 1, limit = 20, status, type) {
        const query = { userId };
        if (status) {
            query.status = status;
        }
        if (type) {
            query.type = type;
        }
        const [notifications, total, unreadCount] = await Promise.all([
            this.notificationModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            this.notificationModel.countDocuments(query),
            this.notificationModel.countDocuments({
                userId,
                status: notification_schema_1.NotificationStatus.UNREAD
            }),
        ]);
        return {
            notifications,
            total,
            page,
            limit,
            unreadCount,
        };
    }
    async findOne(id, userId) {
        const notification = await this.notificationModel
            .findOne({ _id: id, userId })
            .exec();
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return notification;
    }
    async markAsRead(id, userId) {
        const notification = await this.notificationModel
            .findOneAndUpdate({ _id: id, userId }, {
            status: notification_schema_1.NotificationStatus.READ,
            readAt: new Date(),
            updatedAt: new Date(),
        }, { new: true })
            .exec();
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        const unreadCount = await this.getUnreadCount(userId);
        this.webSocketGateway.sendUnreadCountToUser(userId, unreadCount);
        return notification;
    }
    async markAsUnread(id, userId) {
        const notification = await this.notificationModel
            .findOneAndUpdate({ _id: id, userId }, {
            status: notification_schema_1.NotificationStatus.UNREAD,
            readAt: null,
            updatedAt: new Date(),
        }, { new: true })
            .exec();
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        const unreadCount = await this.getUnreadCount(userId);
        this.webSocketGateway.sendUnreadCountToUser(userId, unreadCount);
        return notification;
    }
    async markAllAsRead(userId) {
        const result = await this.notificationModel
            .updateMany({ userId, status: notification_schema_1.NotificationStatus.UNREAD }, {
            status: notification_schema_1.NotificationStatus.READ,
            readAt: new Date(),
            updatedAt: new Date(),
        })
            .exec();
        this.webSocketGateway.sendUnreadCountToUser(userId, 0);
        return { modifiedCount: result.modifiedCount };
    }
    async delete(id, userId) {
        const result = await this.notificationModel
            .deleteOne({ _id: id, userId })
            .exec();
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Notification not found');
        }
    }
    async deleteAll(userId, status) {
        const query = { userId };
        if (status) {
            query.status = status;
        }
        const result = await this.notificationModel
            .deleteMany(query)
            .exec();
        return { deletedCount: result.deletedCount };
    }
    async getUnreadCount(userId) {
        return this.notificationModel
            .countDocuments({
            userId,
            status: notification_schema_1.NotificationStatus.UNREAD
        })
            .exec();
    }
    async createShipmentNotification(userId, shipmentId, type, title, message, priority = notification_schema_1.NotificationPriority.MEDIUM, data) {
        return this.create({
            userId,
            type,
            priority,
            title,
            message,
            shipmentId,
            data: data || {},
            sendEmail: priority === notification_schema_1.NotificationPriority.HIGH || priority === notification_schema_1.NotificationPriority.CRITICAL,
            sendPush: true,
            actionUrl: `/shipments/${shipmentId}`,
            actionText: 'View Shipment',
            icon: 'package',
        });
    }
    async createPaymentNotification(userId, paymentId, title, message, priority = notification_schema_1.NotificationPriority.MEDIUM, data) {
        return this.create({
            userId,
            type: notification_schema_1.NotificationType.PAYMENT_CONFIRMATION,
            priority,
            title,
            message,
            paymentId,
            data: data || {},
            sendEmail: true,
            sendPush: true,
            actionUrl: `/payments/${paymentId}`,
            actionText: 'View Payment',
            icon: 'credit-card',
        });
    }
    async createSystemAlert(userId, title, message, priority = notification_schema_1.NotificationPriority.HIGH, data) {
        return this.create({
            userId,
            type: notification_schema_1.NotificationType.SYSTEM_ALERT,
            priority,
            title,
            message,
            data: data || {},
            sendEmail: priority === notification_schema_1.NotificationPriority.CRITICAL,
            sendPush: true,
            icon: 'alert-triangle',
        });
    }
    async sendEmailNotification(notification) {
        try {
            await this.emailService.sendNotificationEmail(notification.userId, notification.title, notification.message, notification.actionUrl);
            await this.notificationModel
                .updateOne({ _id: notification._id }, { emailSent: true })
                .exec();
            this.logger.log(`Email notification sent for: ${notification._id}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email notification: ${notification._id}`, error);
        }
    }
    async sendPushNotification(notification) {
        try {
            await this.notificationModel
                .updateOne({ _id: notification._id }, { pushSent: true })
                .exec();
            this.logger.log(`Push notification sent for: ${notification._id}`);
        }
        catch (error) {
            this.logger.error(`Failed to send push notification: ${notification._id}`, error);
        }
    }
    async cleanupExpiredNotifications() {
        try {
            const result = await this.notificationModel
                .deleteMany({
                expiresAt: { $lt: new Date() }
            })
                .exec();
            if (result.deletedCount > 0) {
                this.logger.log(`Cleaned up ${result.deletedCount} expired notifications`);
            }
        }
        catch (error) {
            this.logger.error('Failed to cleanup expired notifications:', error);
        }
    }
    async generateMockNotifications(userId, count = 5) {
        const mockNotifications = [];
        const types = Object.values(notification_schema_1.NotificationType);
        const priorities = Object.values(notification_schema_1.NotificationPriority);
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            const notification = await this.create({
                userId,
                type,
                priority,
                title: `Mock ${type.replace('_', ' ')} notification`,
                message: `This is a mock notification of type ${type} with ${priority} priority`,
                data: { mock: true, timestamp: new Date().toISOString() },
                sendEmail: false,
                sendPush: false,
            });
            mockNotifications.push(notification);
        }
        return mockNotifications;
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "cleanupExpiredNotifications", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        websocket_gateway_1.WebSocketGateway,
        email_service_1.EmailService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map