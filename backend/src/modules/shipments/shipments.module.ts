import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { AuthModule } from '../auth/auth.module';
import { CarriersModule } from '../carriers/carriers.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Shipment, TrackingEvent]),
    AuthModule,
    CarriersModule,
    WebSocketModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
