import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationEntity, NotificationSchema } from '../entities/notification.entity';
import { NotificationPreferencesEntity, NotificationPreferencesSchema } from '../entities/notification-preferences.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forFeature([
      { name: NotificationEntity.name, schema: NotificationSchema },
      { name: NotificationPreferencesEntity.name, schema: NotificationPreferencesSchema },
    ]),
  ],
  exports: [
    ConfigModule,
    MongooseModule,
  ],
})
export class SharedModule {}
