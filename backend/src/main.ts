import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
// import * as helmet from 'helmet';
// import * as compression from 'compression';
import { join } from 'path';
import { AppModule } from './app.module';
// import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3001;
  const nodeEnv = configService.get('NODE_ENV') || 'development';

  // Security middleware - temporarily disabled for deployment
  // app.use(helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       styleSrc: ["'self'", "'unsafe-inline'"],
  //       scriptSrc: ["'self'"],
  //       imgSrc: ["'self'", "data:", "https:"],
  //       connectSrc: ["'self'", "wss:", "ws:"],
  //     },
  //   },
  //   crossOriginEmbedderPolicy: false,
  // }));

  // Compression middleware - temporarily disabled for deployment
  // app.use(compression());

  // Serve static files from frontend build (for Railway deployment)
  const frontendPath = join(__dirname, '..', '..', 'frontend', 'dist');
  const indexPath = join(frontendPath, 'index.html');
  
  // Check if frontend files exist
  const fs = require('fs');
  if (fs.existsSync(frontendPath)) {
    logger.log(`✅ Frontend dist directory found: ${frontendPath}`);
    if (fs.existsSync(indexPath)) {
      logger.log(`✅ index.html found: ${indexPath}`);
    } else {
      logger.error(`❌ index.html NOT found: ${indexPath}`);
    }
  } else {
    logger.error(`❌ Frontend dist directory NOT found: ${frontendPath}`);
  }
  
  app.useStaticAssets(frontendPath);
  app.setBaseViewsDir(frontendPath);
  logger.log(`📁 Serving static files from: ${frontendPath}`);

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://shipsmart.vercel.app',
      'https://shipsmart-frontend.vercel.app',
      // Add Railway domains
      /\.railway\.app$/,
      process.env.CORS_ORIGIN,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // WebSocket adapter - temporarily disabled for deployment
  // app.useWebSocketAdapter(new IoAdapter(app));

  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');

  // Catch-all handler for SPA routing (serve index.html for non-API routes)
  // This must be AFTER the API routes are defined but handles all non-API requests
  const { Request, Response } = require('express');
  app.use('*', (req: typeof Request, res: typeof Response) => {
    // Don't serve index.html for API routes
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    // Serve index.html for all other routes (SPA routing)
    const indexPath = join(__dirname, '..', '..', 'frontend', 'dist', 'index.html');
    logger.log(`📄 Serving index.html from: ${indexPath} for route: ${req.originalUrl}`);
    res.sendFile(indexPath);
  });

  // Swagger documentation (only in development)
  if (nodeEnv === 'development') {
    const config = new DocumentBuilder()
      .setTitle('ShipSmart API')
      .setDescription('Real-time freight forwarding platform API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Shipments', 'Shipment management and tracking')
      .addTag('Payments', 'Payment processing and billing')
      .addTag('Analytics', 'Business analytics and reporting')
      .addTag('Notifications', 'Real-time notifications')
      .addTag('WebSocket', 'Real-time communication')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/docs`);
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  await app.listen(port);

  logger.log(`🚀 ShipSmart Backend running on http://localhost:${port}`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`📡 WebSocket server ready for real-time connections`);
  
  if (nodeEnv === 'development') {
    logger.log(`🔧 Development mode: Hot reload enabled`);
  }
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error);
  process.exit(1);
});
