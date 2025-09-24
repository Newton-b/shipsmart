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
exports.NotificationsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const notification_schema_1 = require("./schemas/notification.schema");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async create(createNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }
    async findAll(user, page, limit, status, type) {
        return this.notificationsService.findAll(user.id, page, limit, status, type);
    }
    async getUnreadCount(user) {
        const count = await this.notificationsService.getUnreadCount(user.id);
        return { unreadCount: count };
    }
    async markAllAsRead(user) {
        return this.notificationsService.markAllAsRead(user.id);
    }
    async deleteAll(user, status) {
        return this.notificationsService.deleteAll(user.id, status);
    }
    async generateMockNotifications(user, count) {
        return this.notificationsService.generateMockNotifications(user.id, count);
    }
    async findOne(id, user) {
        return this.notificationsService.findOne(id, user.id);
    }
    async markAsRead(id, user) {
        return this.notificationsService.markAsRead(id, user.id);
    }
    async markAsUnread(id, user) {
        return this.notificationsService.markAsUnread(id, user.id);
    }
    async remove(id, user) {
        await this.notificationsService.delete(id, user.id);
        return { message: 'Notification deleted successfully' };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new notification' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notification created successfully',
    }),
    openapi.ApiResponse({ status: 201, type: require("./schemas/notification.schema").Notification }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notifications' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: notification_schema_1.NotificationStatus }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: notification_schema_1.NotificationType }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notifications retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread notifications count' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Unread count retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Post)('mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'All notifications marked as read',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all notifications' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: notification_schema_1.NotificationStatus }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notifications deleted successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteAll", null);
__decorate([
    (0, common_1.Get)('mock/:count'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate mock notifications for testing' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Mock notifications generated',
    }),
    openapi.ApiResponse({ status: 200, type: [require("./schemas/notification.schema").Notification] }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Param)('count', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "generateMockNotifications", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200, type: require("./schemas/notification.schema").Notification }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification marked as read',
    }),
    openapi.ApiResponse({ status: 200, type: require("./schemas/notification.schema").Notification }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)(':id/unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as unread' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification marked as unread',
    }),
    openapi.ApiResponse({ status: 200, type: require("./schemas/notification.schema").Notification }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsUnread", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete notification' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notification deleted successfully',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "remove", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map