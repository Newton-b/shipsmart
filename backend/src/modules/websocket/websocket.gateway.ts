import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

import { WebSocketService } from './websocket.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
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
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.webSocketService.server = server;
    this.logger.log('🔌 WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (token) {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
        client.join(`user:${payload.sub}`);
        
        this.logger.log(`✅ Client connected: ${client.id} (User: ${payload.email})`);
        
        // Send connection confirmation
        client.emit('connected', {
          message: 'Connected to ShipSmart real-time server',
          userId: payload.sub,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Allow anonymous connections for public data
        this.logger.log(`🔓 Anonymous client connected: ${client.id}`);
        client.emit('connected', {
          message: 'Connected to ShipSmart real-time server (anonymous)',
          timestamp: new Date().toISOString(),
        });
      }

      // Join general room for public updates
      client.join('general');
      
    } catch (error) {
      this.logger.warn(`❌ Invalid token for client ${client.id}: ${error.message}`);
      client.emit('error', { message: 'Invalid authentication token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`❌ Client disconnected: ${client.id} (User: ${user.email})`);
    } else {
      this.logger.log(`❌ Anonymous client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('join-room')
  @UseGuards(WsJwtGuard)
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = data;
    client.join(room);
    client.emit('joined-room', { room, message: `Joined room: ${room}` });
    this.logger.log(`Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage('leave-room')
  @UseGuards(WsJwtGuard)
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = data;
    client.leave(room);
    client.emit('left-room', { room, message: `Left room: ${room}` });
    this.logger.log(`Client ${client.id} left room: ${room}`);
  }

  @SubscribeMessage('subscribe-shipment')
  @UseGuards(WsJwtGuard)
  handleSubscribeShipment(
    @MessageBody() data: { shipmentId: string },
    @ConnectedSocket() client: Socket,
  ) {
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

  @SubscribeMessage('subscribe-analytics')
  @UseGuards(WsJwtGuard)
  handleSubscribeAnalytics(@ConnectedSocket() client: Socket) {
    client.join('analytics');
    client.emit('subscribed', { 
      type: 'analytics', 
      message: 'Subscribed to analytics updates' 
    });
    this.logger.log(`Client ${client.id} subscribed to analytics`);
  }

  @SubscribeMessage('subscribe-notifications')
  @UseGuards(WsJwtGuard)
  handleSubscribeNotifications(@ConnectedSocket() client: Socket) {
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

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { 
      timestamp: new Date().toISOString(),
      message: 'Server is alive' 
    });
  }

  // Server-side methods for broadcasting updates
  broadcastShipmentUpdate(shipmentId: string, update: any) {
    this.server.to(`shipment:${shipmentId}`).emit('shipment-update', {
      shipmentId,
      update,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastAnalyticsUpdate(data: any) {
    this.server.to('analytics').emit('analytics-update', {
      data,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastNotification(userId: string, notification: any) {
    this.server.to(`notifications:${userId}`).emit('notification', {
      notification,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastGeneralUpdate(event: string, data: any) {
    this.server.to('general').emit(event, {
      data,
      timestamp: new Date().toISOString(),
    });
  }
}
