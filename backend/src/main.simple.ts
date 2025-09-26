import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('🚀 Starting ShipSmart Backend...');
    
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const port = process.env.PORT || 3000;
    logger.log(`📡 Port configured: ${port}`);

    // Enable CORS
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
    });
    logger.log('✅ CORS enabled');

    // Set global prefix
    app.setGlobalPrefix('api/v1');
    logger.log('✅ Global prefix set: api/v1');

    // Try to serve static files (optional)
    try {
      const frontendPath = join(__dirname, '..', '..', 'frontend', 'dist');
      const fs = require('fs');
      if (fs.existsSync(frontendPath)) {
        app.useStaticAssets(frontendPath);
        logger.log('✅ Static files configured');
        
        // Simple catch-all for SPA
        app.use('*', (req, res) => {
          if (req.originalUrl.startsWith('/api')) {
            return res.status(404).json({ message: 'API endpoint not found' });
          }
          const indexPath = join(frontendPath, 'index.html');
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.status(404).json({ message: 'Frontend not available' });
          }
        });
        logger.log('✅ SPA routing configured');
      } else {
        logger.warn('⚠️ Frontend files not found - API only mode');
      }
    } catch (error) {
      logger.warn(`⚠️ Frontend setup failed: ${error.message} - API only mode`);
    }

    // Start server
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🎉 ShipSmart Backend running successfully!`);
    logger.log(`🌐 Server: http://0.0.0.0:${port}`);
    logger.log(`🏥 Health: http://0.0.0.0:${port}/api/v1/health`);
    logger.log(`📚 Environment: ${process.env.NODE_ENV || 'production'}`);
    
  } catch (error) {
    logger.error('💥 Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
