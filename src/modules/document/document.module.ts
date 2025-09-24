import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentController } from '../../controllers/document.controller';
import { DocumentService } from '../../services/document.service';
import { DocumentEntity, DocumentSchema } from '../../entities/document.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentEntity.name, schema: DocumentSchema },
    ]),
    MulterModule.register({
      dest: './uploads/documents',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    NotificationModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
