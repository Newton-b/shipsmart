import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ShipSmart Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      port: process.env.PORT || 3000,
    };
  }
}
