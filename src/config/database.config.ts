import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { TrackingEvent } from '@/entities/tracking-event.entity';
import { CarrierKey } from '@/entities/carrier-key.entity';

export const getDatabaseConfig = (configService: ConfigService): MongooseModuleOptions => {
  const uri = configService.get<string>('MONGODB_URI') || 
    `mongodb://${configService.get('DB_HOST', 'localhost')}:${configService.get('DB_PORT', 27017)}/${configService.get('DB_NAME', 'shipment_tracking')}`;

  return {
    uri,
    connectionFactory: (connection) => {
      connection.on('connected', () => {
        console.log('Connected to MongoDB');
      });
      connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });
      return connection;
    },
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    authSource: configService.get('DB_AUTH_SOURCE', 'admin'),
    ...(configService.get('DB_USERNAME') && {
      auth: {
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
      },
    }),
    ...(configService.get('NODE_ENV') === 'production' && {
      ssl: true,
    }),
  };
};

// For migrations
export default getDatabaseConfig;
