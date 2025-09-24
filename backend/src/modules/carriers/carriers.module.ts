import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { CarriersController } from './carriers.controller';
import { CarriersService } from './carriers.service';
import { UpsService } from './services/ups.service';
import { FedexService } from './services/fedex.service';
import { DhlService } from './services/dhl.service';
import { CarrierFactory } from './factories/carrier.factory';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [CarriersController],
  providers: [
    CarriersService,
    UpsService,
    FedexService,
    DhlService,
    CarrierFactory,
  ],
  exports: [CarriersService, CarrierFactory],
})
export class CarriersModule {}
