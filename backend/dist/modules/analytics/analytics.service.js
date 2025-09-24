"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyticsService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const shipment_entity_1 = require("../shipments/entities/shipment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(shipmentRepository, userRepository, webSocketGateway) {
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.webSocketGateway = webSocketGateway;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async getDashboardStats() {
        const [totalShipments, activeShipments, deliveredShipments, totalUsers, activeUsers,] = await Promise.all([
            this.shipmentRepository.count(),
            this.shipmentRepository.count({
                where: {
                    status: shipment_entity_1.ShipmentStatus.IN_TRANSIT,
                },
            }),
            this.shipmentRepository.count({
                where: {
                    status: shipment_entity_1.ShipmentStatus.DELIVERED,
                },
            }),
            this.userRepository.count(),
            this.userRepository.count({
                where: { isActive: true },
            }),
        ]);
        const revenueResult = await this.shipmentRepository
            .createQueryBuilder('shipment')
            .select('SUM(shipment.totalCost)', 'totalRevenue')
            .where('shipment.totalCost IS NOT NULL')
            .getRawOne();
        const totalRevenue = parseFloat(revenueResult?.totalRevenue || '0');
        const deliveryTimeResult = await this.shipmentRepository
            .createQueryBuilder('shipment')
            .select('AVG(EXTRACT(EPOCH FROM (shipment.actualDeliveryDate - shipment.shipDate)) / 3600)', 'avgDeliveryTime')
            .where('shipment.actualDeliveryDate IS NOT NULL')
            .andWhere('shipment.shipDate IS NOT NULL')
            .getRawOne();
        const averageDeliveryTime = parseFloat(deliveryTimeResult?.avgDeliveryTime || '72');
        const onTimeDeliveries = await this.shipmentRepository
            .createQueryBuilder('shipment')
            .where('shipment.actualDeliveryDate <= shipment.estimatedDeliveryDate')
            .andWhere('shipment.status = :status', { status: shipment_entity_1.ShipmentStatus.DELIVERED })
            .getCount();
        const onTimeDeliveryRate = deliveredShipments > 0 ? (onTimeDeliveries / deliveredShipments) * 100 : 0;
        const customerSatisfaction = 4.2 + Math.random() * 0.6;
        const revenueGrowth = 12.5 + Math.random() * 10;
        const shipmentGrowth = 8.3 + Math.random() * 8;
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
    async getRevenueAnalytics(period = 'daily') {
        const now = new Date();
        let dateFormat;
        let dateRange;
        switch (period) {
            case 'daily':
                dateFormat = 'YYYY-MM-DD';
                dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                dateFormat = 'YYYY-MM';
                dateRange = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
                break;
            case 'yearly':
                dateFormat = 'YYYY';
                dateRange = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
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
    async getCarrierPerformance() {
        const carrierStats = await this.shipmentRepository
            .createQueryBuilder('shipment')
            .select([
            'shipment.carrier as carrier',
            'COUNT(*) as totalShipments',
            'SUM(CASE WHEN shipment.actualDeliveryDate <= shipment.estimatedDeliveryDate THEN 1 ELSE 0 END) as onTimeDeliveries',
            'AVG(EXTRACT(EPOCH FROM (shipment.actualDeliveryDate - shipment.shipDate)) / 3600) as avgDeliveryTime',
            'SUM(shipment.totalCost) as totalRevenue',
        ])
            .where('shipment.status = :status', { status: shipment_entity_1.ShipmentStatus.DELIVERED })
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
    async getGeographicAnalytics() {
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
    async getShipmentTrends(days = 30) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
        const trends = await this.shipmentRepository
            .createQueryBuilder('shipment')
            .select([
            `TO_CHAR(shipment.createdAt, 'YYYY-MM-DD') as date`,
            'COUNT(*) as created',
            `SUM(CASE WHEN shipment.status = '${shipment_entity_1.ShipmentStatus.DELIVERED}' THEN 1 ELSE 0 END) as delivered`,
            `SUM(CASE WHEN shipment.status = '${shipment_entity_1.ShipmentStatus.IN_TRANSIT}' THEN 1 ELSE 0 END) as inTransit`,
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
    async broadcastAnalyticsUpdate() {
        try {
            const stats = await this.getDashboardStats();
            this.webSocketGateway.broadcastAnalyticsUpdate(stats);
        }
        catch (error) {
            this.logger.error('Failed to broadcast analytics update:', error);
        }
    }
    generateMockRealtimeData() {
        const mockStats = {
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
};
exports.AnalyticsService = AnalyticsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsService.prototype, "broadcastAnalyticsUpdate", null);
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shipment_entity_1.Shipment)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, websocket_gateway_1.WebSocketGateway])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map