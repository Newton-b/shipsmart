import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { getDatabaseConfig } from './config/database.config';
import { storageConfig } from './shared/config/storage.config';

// Controllers
import { TrackingController } from './controllers/tracking.controller';
import { ShippingRateController } from './controllers/shipping-rate.controller';
import { CustomerController } from './controllers/customer.controller';
import { InventoryController } from './controllers/inventory.controller';
// import { QuotationController } from './controllers/quotation.controller';
import { DocumentController } from './controllers/document.controller';
import { NotificationController } from './controllers/notification.controller';
import { NotificationTestController } from './controllers/notification-test.controller';

// Services
import { TrackingService } from './services/tracking.service';
import { ShippingRateService } from './services/shipping-rate.service';
import { CustomerService } from './services/customer.service';
import { InventoryService } from './services/inventory.service';
// import { QuotationService } from './services/quotation.service';
import { DocumentService } from './services/document.service';
import { NotificationService } from './services/notification.service';
import { NotificationSimpleService } from './services/notification-simple.service';
import { CarrierAdapterFactory } from './services/carrier-adapter.factory';

// Mongoose schemas
import { TrackingEvent, TrackingEventSchema } from './entities/tracking-event.entity';
import { CarrierKey, CarrierKeySchema } from './entities/carrier-key.entity';
import { Customer, CustomerSchema } from './entities/customer.entity';
import { InventoryItem, InventoryItemSchema } from './entities/inventory-item.entity';
import { Warehouse, WarehouseSchema } from './entities/warehouse.entity';
// import { QuoteRequest, QuoteRequestSchema } from './entities/quote-request.entity';
// import { PricingRule, PricingRuleSchema } from './entities/pricing-rule.entity';
import { DocumentEntity, DocumentSchema } from './entities/document.entity';
import { NotificationEntity, NotificationSchema } from './entities/notification.entity';
import { NotificationPreferencesEntity, NotificationPreferencesSchema } from './entities/notification-preferences.entity';

// Carrier adapters
import { UpsAdapter } from './adapters/ups-adapter';
import { FedexAdapter } from './adapters/fedex-adapter';
import { MaerskAdapter } from './adapters/maersk-adapter';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Event emitter for real-time notifications
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // File upload configuration
    MulterModule.register(storageConfig),

    // MongoDB connection
    MongooseModule.forRootAsync({
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Mongoose models
    MongooseModule.forFeature([
      { name: TrackingEvent.name, schema: TrackingEventSchema },
      { name: CarrierKey.name, schema: CarrierKeySchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: Warehouse.name, schema: WarehouseSchema },
      // { name: QuoteRequest.name, schema: QuoteRequestSchema },
      // { name: PricingRule.name, schema: PricingRuleSchema },
      { name: DocumentEntity.name, schema: DocumentSchema },
      { name: NotificationEntity.name, schema: NotificationSchema },
      { name: NotificationPreferencesEntity.name, schema: NotificationPreferencesSchema },
    ]),
  ],
  controllers: [
    TrackingController,
    ShippingRateController,
    CustomerController,
    InventoryController,
    // QuotationController,
    DocumentController,
    NotificationController,
    NotificationTestController,
  ],
  providers: [
    TrackingService,
    ShippingRateService,
    CustomerService,
    InventoryService,
    // QuotationService,
    DocumentService,
    NotificationService,
    NotificationSimpleService,
    CarrierAdapterFactory,
    UpsAdapter,
    FedexAdapter,
    MaerskAdapter,
  ],
})
export class AppModule {}
