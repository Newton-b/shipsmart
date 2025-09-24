import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WebSocketService } from './websocket.service';
export declare class WebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly webSocketService;
    private readonly jwtService;
    server: Server;
    private readonly logger;
    constructor(webSocketService: WebSocketService, jwtService: JwtService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        room: string;
    }, client: Socket): void;
    handleLeaveRoom(data: {
        room: string;
    }, client: Socket): void;
    handleSubscribeShipment(data: {
        shipmentId: string;
    }, client: Socket): void;
    handleSubscribeAnalytics(client: Socket): void;
    handleSubscribeNotifications(client: Socket): void;
    handlePing(client: Socket): void;
    broadcastShipmentUpdate(shipmentId: string, update: any): void;
    broadcastAnalyticsUpdate(data: any): void;
    broadcastNotification(userId: string, notification: any): void;
    broadcastGeneralUpdate(event: string, data: any): void;
}
