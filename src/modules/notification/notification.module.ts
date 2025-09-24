import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from '../../controllers/notification.controller';
import { NotificationService } from '../../services/notification.service';
import { NotificationEntity, NotificationSchema } from '../../entities/notification.entity';
import { NotificationPreferencesEntity, NotificationPreferencesSchema } from '../../entities/notification-preferences.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationEntity.name, schema: NotificationSchema },
      { name: NotificationPreferencesEntity.name, schema: NotificationPreferencesSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
