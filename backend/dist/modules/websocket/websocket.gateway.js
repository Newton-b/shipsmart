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
var WebSocketGateway_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
Object.defineProperty(exports, "WebSocketGateway", { enumerable: true, get: function () { return websockets_1.WebSocketGateway; } });
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const websocket_service_1 = require("./websocket.service");
const ws_jwt_guard_1 = require("./guards/ws-jwt.guard");
let WebSocketGateway = WebSocketGateway_1 = class WebSocketGateway {
    constructor(webSocketService, jwtService) {
        this.webSocketService = webSocketService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(WebSocketGateway_1.name);
    }
    afterInit(server) {
        this.webSocketService.server = server;
        this.logger.log('🔌 WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
            if (token) {
                const payload = this.jwtService.verify(token);
                client.data.user = payload;
                client.join(`user:${payload.sub}`);
                this.logger.log(`✅ Client connected: ${client.id} (User: ${payload.email})`);
                client.emit('connected', {
                    message: 'Connected to ShipSmart real-time server',
                    userId: payload.sub,
                    timestamp: new Date().toISOString(),
                });
            }
            else {
                this.logger.log(`🔓 Anonymous client connected: ${client.id}`);
                client.emit('connected', {
                    message: 'Connected to ShipSmart real-time server (anonymous)',
                    timestamp: new Date().toISOString(),
                });
            }
            client.join('general');
        }
        catch (error) {
            this.logger.warn(`❌ Invalid token for client ${client.id}: ${error.message}`);
            client.emit('error', { message: 'Invalid authentication token' });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const user = client.data.user;
        if (user) {
            this.logger.log(`❌ Client disconnected: ${client.id} (User: ${user.email})`);
        }
        else {
            this.logger.log(`❌ Anonymous client disconnected: ${client.id}`);
        }
    }
    handleJoinRoom(data, client) {
        const { room } = data;
        client.join(room);
        client.emit('joined-room', { room, message: `Joined room: ${room}` });
        this.logger.log(`Client ${client.id} joined room: ${room}`);
    }
    handleLeaveRoom(data, client) {
        const { room } = data;
        client.leave(room);
        client.emit('left-room', { room, message: `Left room: ${room}` });
        this.logger.log(`Client ${client.id} left room: ${room}`);
    }
    handleSubscribeShipment(data, client) {
        const { shipmentId } = data;
        const room = `shipment:${shipmentId}`;
        client.join(room);
        client.emit('subscribed', {
            type: 'shipment',
            id: shipmentId,
            message: `Subscribed to shipment updates: ${shipmentId}`
        });
        this.logger.log(`Client ${client.id} subscribed to shipment: ${shipmentId}`);
    }
    handleSubscribeAnalytics(client) {
        client.join('analytics');
        client.emit('subscribed', {
            type: 'analytics',
            message: 'Subscribed to analytics updates'
        });
        this.logger.log(`Client ${client.id} subscribed to analytics`);
    }
    handleSubscribeNotifications(client) {
        const user = client.data.user;
        if (user) {
            const room = `notifications:${user.sub}`;
            client.join(room);
            client.emit('subscribed', {
                type: 'notifications',
                message: 'Subscribed to personal notifications'
            });
            this.logger.log(`Client ${client.id} subscribed to notifications`);
        }
    }
    handlePing(client) {
        client.emit('pong', {
            timestamp: new Date().toISOString(),
            message: 'Server is alive'
        });
    }
    broadcastShipmentUpdate(shipmentId, update) {
        this.server.to(`shipment:${shipmentId}`).emit('shipment-update', {
            shipmentId,
            update,
            timestamp: new Date().toISOString(),
        });
    }
    broadcastAnalyticsUpdate(data) {
        this.server.to('analytics').emit('analytics-update', {
            data,
            timestamp: new Date().toISOString(),
        });
    }
    broadcastNotification(userId, notification) {
        this.server.to(`notifications:${userId}`).emit('notification', {
            notification,
            timestamp: new Date().toISOString(),
        });
    }
    broadcastGeneralUpdate(event, data) {
        this.server.to('general').emit(event, {
            data,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.WebSocketGateway = WebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_c = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _c : Object)
], websockets_1.WebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], websockets_1.WebSocketGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-room'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_e = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _e : Object]),
    __metadata("design:returntype", void 0)
], websockets_1.WebSocketGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe-shipment'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_f = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _f : Object]),
    __metadata("design:returntype", void 0)
], websockets_1.WebSocketGateway.prototype, "handleSubscribeShipment", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe-analytics'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _g : Object]),
    __metadata("design:returntype", void 0)
], websockets_1.WebSocketGateway.prototype, "handleSubscribeAnalytics", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe-notifications'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _h : Object]),
    __metadata("design:returntype", void 0)
], websockets_1.WebSocketGateway.prototype, "handleSubscribeNotifications", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _j : Object]),
    __metadata("design:returntype", void 0)
], websockets_1.WebSocketGateway.prototype, "handlePing", null);
exports.WebSocketGateway = websockets_1.WebSocketGateway = WebSocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:5173',
                'https://shipsmart.vercel.app',
                'https://shipsmart-frontend.vercel.app',
            ],
            credentials: true,
        },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof websocket_service_1.WebSocketService !== "undefined" && websocket_service_1.WebSocketService) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object])
], websockets_1.WebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map