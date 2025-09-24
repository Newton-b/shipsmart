import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Shipment, ShipmentStatus } from '../shipments/entities/shipment.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { WebSocketGateway } from '../websocket/websocket.gateway';

export interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  customerSatisfaction: number;
  totalUsers: number;
  activeUsers: number;
  revenueGrowth: number;
  shipmentGrowth: number;
}

export interface RevenueAnalytics {
  daily: { date: string; revenue: number; shipments: number }[];
  monthly: { month: string; revenue: number; shipments: number }[];
  yearly: { year: string; revenue: number; shipments: number }[];
}

export interface CarrierPerformance {
  carrier: string;
  totalShipments: number;
  onTimeDeliveries: number;
  onTimeRate: number;
  averageDeliveryTime: number;
  totalRevenue: number;
}

export interface GeographicAnalytics {
  country: string;
  region: string;
  shipments: number;
  revenue: number;
  averageValue: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly webSocketGateway: WebSocketGateway,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalShipments,
      activeShipments,
      deliveredShipments,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      this.shipmentRepository.count(),
      this.shipmentRepository.count({
        where: {
          status: ShipmentStatus.IN_TRANSIT,
        },
      }),
      this.shipmentRepository.count({
        where: {
          status: ShipmentStatus.DELIVERED,
        },
      }),
      this.userRepository.count(),
      this.userRepository.count({
        where: { isActive: true },
      }),
    ]);

    // Calculate revenue
    const revenueResult = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('SUM(shipment.totalCost)', 'totalRevenue')
      .where('shipment.totalCost IS NOT NULL')
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.totalRevenue || '0');

    // Calculate average delivery time (in hours)
    const deliveryTimeResult = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select('AVG(EXTRACT(EPOCH FROM (shipment.actualDeliveryDate - shipment.shipDate)) / 3600)', 'avgDeliveryTime')
      .where('shipment.actualDeliveryDate IS NOT NULL')
      .andWhere('shipment.shipDate IS NOT NULL')
      .getRawOne();

    const averageDeliveryTime = parseFloat(deliveryTimeResult?.avgDeliveryTime || '72');

    // Calculate on-time delivery rate
    const onTimeDeliveries = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .where('shipment.actualDeliveryDate <= shipment.estimatedDeliveryDate')
      .andWhere('shipment.status = :status', { status: ShipmentStatus.DELIVERED })
      .getCount();

    const onTimeDeliveryRate = deliveredShipments > 0 ? (onTimeDeliveries / deliveredShipments) * 100 : 0;

    // Mock customer satisfaction (in real app, this would come from surveys/ratings)
    const customerSatisfaction = 4.2 + Math.random() * 0.6; // 4.2-4.8 range

    // Calculate growth rates (mock for now - in real app, compare with previous period)
    const revenueGrowth = 12.5 + Math.random() * 10; // 12.5-22.5% range
    const shipmentGrowth = 8.3 + Math.random() * 8; // 8.3-16.3% range

    return {
      totalShipments,
      activeShipments,
      deliveredShipments,
      totalRevenue,
      averageDeliveryTime,
      onTimeDeliveryRate,
      customerSatisfaction,
      totalUsers,
      activeUsers,
      revenueGrowth,
      shipmentGrowth,
    };
  }

  async getRevenueAnalytics(period: 'daily' | 'monthly' | 'yearly' = 'daily'): Promise<RevenueAnalytics> {
    const now = new Date();
    let dateFormat: string;
    let dateRange: Date;

    switch (period) {
      case 'daily':
        dateFormat = 'YYYY-MM-DD';
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        break;
      case 'monthly':
        dateFormat = 'YYYY-MM';
        dateRange = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        break;
      case 'yearly':
        dateFormat = 'YYYY';
        dateRange = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000); // Last 5 years
        break;
    }

    const dailyData = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select([
        `TO_CHAR(shipment.createdAt, '${dateFormat}') as date`,
        'SUM(shipment.totalCost) as revenue',
        'COUNT(*) as shipments',
      ])
      .where('shipment.createdAt >= :dateRange', { dateRange })
      .andWhere('shipment.totalCost IS NOT NULL')
      .groupBy(`TO_CHAR(shipment.createdAt, '${dateFormat}')`)
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      daily: period === 'daily' ? dailyData.map(item => ({
        date: item.date,
        revenue: parseFloat(item.revenue || '0'),
        shipments: parseInt(item.shipments || '0'),
      })) : [],
      monthly: period === 'monthly' ? dailyData.map(item => ({
        month: item.date,
        revenue: parseFloat(item.revenue || '0'),
        shipments: parseInt(item.shipments || '0'),
      })) : [],
      yearly: period === 'yearly' ? dailyData.map(item => ({
        year: item.date,
        revenue: parseFloat(item.revenue || '0'),
        shipments: parseInt(item.shipments || '0'),
      })) : [],
    };
  }

  async getCarrierPerformance(): Promise<CarrierPerformance[]> {
    const carrierStats = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select([
        'shipment.carrier as carrier',
        'COUNT(*) as totalShipments',
        'SUM(CASE WHEN shipment.actualDeliveryDate <= shipment.estimatedDeliveryDate THEN 1 ELSE 0 END) as onTimeDeliveries',
        'AVG(EXTRACT(EPOCH FROM (shipment.actualDeliveryDate - shipment.shipDate)) / 3600) as avgDeliveryTime',
        'SUM(shipment.totalCost) as totalRevenue',
      ])
      .where('shipment.status = :status', { status: ShipmentStatus.DELIVERED })
      .groupBy('shipment.carrier')
      .getRawMany();

    return carrierStats.map(stat => ({
      carrier: stat.carrier,
      totalShipments: parseInt(stat.totalShipments || '0'),
      onTimeDeliveries: parseInt(stat.onTimeDeliveries || '0'),
      onTimeRate: stat.totalShipments > 0 ? (stat.onTimeDeliveries / stat.totalShipments) * 100 : 0,
      averageDeliveryTime: parseFloat(stat.avgDeliveryTime || '72'),
      totalRevenue: parseFloat(stat.totalRevenue || '0'),
    }));
  }

  async getGeographicAnalytics(): Promise<GeographicAnalytics[]> {
    const geoStats = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select([
        'shipment.recipientCountry as country',
        'shipment.recipientState as region',
        'COUNT(*) as shipments',
        'SUM(shipment.totalCost) as revenue',
        'AVG(shipment.totalCost) as averageValue',
      ])
      .where('shipment.totalCost IS NOT NULL')
      .groupBy('shipment.recipientCountry, shipment.recipientState')
      .orderBy('revenue', 'DESC')
      .limit(20)
      .getRawMany();

    return geoStats.map(stat => ({
      country: stat.country || 'Unknown',
      region: stat.region || 'Unknown',
      shipments: parseInt(stat.shipments || '0'),
      revenue: parseFloat(stat.revenue || '0'),
      averageValue: parseFloat(stat.averageValue || '0'),
    }));
  }

  async getShipmentTrends(days: number = 30): Promise<{
    date: string;
    created: number;
    delivered: number;
    inTransit: number;
  }[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const trends = await this.shipmentRepository
      .createQueryBuilder('shipment')
      .select([
        `TO_CHAR(shipment.createdAt, 'YYYY-MM-DD') as date`,
        'COUNT(*) as created',
        `SUM(CASE WHEN shipment.status = '${ShipmentStatus.DELIVERED}' THEN 1 ELSE 0 END) as delivered`,
        `SUM(CASE WHEN shipment.status = '${ShipmentStatus.IN_TRANSIT}' THEN 1 ELSE 0 END) as inTransit`,
      ])
      .where('shipment.createdAt >= :startDate', { startDate })
      .andWhere('shipment.createdAt <= :endDate', { endDate })
      .groupBy(`TO_CHAR(shipment.createdAt, 'YYYY-MM-DD')`)
      .orderBy('date', 'ASC')
      .getRawMany();

    return trends.map(trend => ({
      date: trend.date,
      created: parseInt(trend.created || '0'),
      delivered: parseInt(trend.delivered || '0'),
      inTransit: parseInt(trend.inTransit || '0'),
    }));
  }

  // Real-time analytics updates
  @Cron(CronExpression.EVERY_30_SECONDS)
  async broadcastAnalyticsUpdate() {
    try {
      const stats = await this.getDashboardStats();
      this.webSocketGateway.broadcastAnalyticsUpdate(stats);
    } catch (error) {
      this.logger.error('Failed to broadcast analytics update:', error);
    }
  }

  // Generate mock real-time data for development
  generateMockRealtimeData() {
    const mockStats: DashboardStats = {
      totalShipments: 1247 + Math.floor(Math.random() * 10),
      activeShipments: 156 + Math.floor(Math.random() * 20),
      deliveredShipments: 1091 + Math.floor(Math.random() * 5),
      totalRevenue: 89750 + Math.random() * 5000,
      averageDeliveryTime: 68 + Math.random() * 8,
      onTimeDeliveryRate: 92 + Math.random() * 6,
      customerSatisfaction: 4.2 + Math.random() * 0.6,
      totalUsers: 342 + Math.floor(Math.random() * 5),
      activeUsers: 89 + Math.floor(Math.random() * 10),
      revenueGrowth: 12.5 + Math.random() * 10,
      shipmentGrowth: 8.3 + Math.random() * 8,
    };

    this.webSocketGateway.broadcastAnalyticsUpdate(mockStats);
    return mockStats;
  }
}
