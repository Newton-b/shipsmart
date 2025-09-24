"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const compression_1 = require("compression");
const app_module_1 = require("./app.module");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3001;
    const nodeEnv = configService.get('NODE_ENV') || 'development';
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "wss:", "ws:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://shipsmart.vercel.app',
            'https://shipsmart-frontend.vercel.app',
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.setGlobalPrefix('api/v1');
    if (nodeEnv === 'development') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('ShipSmart API')
            .setDescription('Real-time freight forwarding platform API')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
            .addTag('Authentication', 'User authentication and authorization')
            .addTag('Shipments', 'Shipment management and tracking')
            .addTag('Payments', 'Payment processing and billing')
            .addTag('Analytics', 'Business analytics and reporting')
            .addTag('Notifications', 'Real-time notifications')
            .addTag('WebSocket', 'Real-time communication')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
        logger.log(`📚 Swagger documentation available at http://localhost:${port}/api/docs`);
    }
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
    const logger = new common_1.Logger('Bootstrap');
    logger.error('Failed to start application', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map