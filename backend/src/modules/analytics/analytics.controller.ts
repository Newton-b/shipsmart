import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('revenue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    enum: ['daily', 'monthly', 'yearly'],
    description: 'Time period for analytics' 
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue analytics retrieved successfully',
  })
  async getRevenueAnalytics(
    @Query('period') period: 'daily' | 'monthly' | 'yearly' = 'daily',
  ) {
    return this.analyticsService.getRevenueAnalytics(period);
  }

  @Get('carriers')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Get carrier performance analytics' })
  @ApiResponse({
    status: 200,
    description: 'Carrier performance retrieved successfully',
  })
  async getCarrierPerformance() {
    return this.analyticsService.getCarrierPerformance();
  }

  @Get('geographic')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get geographic analytics' })
  @ApiResponse({
    status: 200,
    description: 'Geographic analytics retrieved successfully',
  })
  async getGeographicAnalytics() {
    return this.analyticsService.getGeographicAnalytics();
  }

  @Get('trends')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get shipment trends' })
  @ApiQuery({ 
    name: 'days', 
    required: false, 
    type: Number,
    description: 'Number of days to analyze (default: 30)' 
  })
  @ApiResponse({
    status: 200,
    description: 'Shipment trends retrieved successfully',
  })
  async getShipmentTrends(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.analyticsService.getShipmentTrends(days);
  }

  @Get('realtime')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @ApiOperation({ summary: 'Generate mock real-time analytics data (Development only)' })
  @ApiResponse({
    status: 200,
    description: 'Real-time analytics data generated',
  })
  async generateRealtimeData() {
    return this.analyticsService.generateMockRealtimeData();
  }
}
