import { Repository } from 'typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';
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
    daily: {
        date: string;
        revenue: number;
        shipments: number;
    }[];
    monthly: {
        month: string;
        revenue: number;
        shipments: number;
    }[];
    yearly: {
        year: string;
        revenue: number;
        shipments: number;
    }[];
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
export declare class AnalyticsService {
    private readonly shipmentRepository;
    private readonly userRepository;
    private readonly webSocketGateway;
    private readonly logger;
    constructor(shipmentRepository: Repository<Shipment>, userRepository: Repository<User>, webSocketGateway: WebSocketGateway);
    getDashboardStats(): Promise<DashboardStats>;
    getRevenueAnalytics(period?: 'daily' | 'monthly' | 'yearly'): Promise<RevenueAnalytics>;
    getCarrierPerformance(): Promise<CarrierPerformance[]>;
    getGeographicAnalytics(): Promise<GeographicAnalytics[]>;
    getShipmentTrends(days?: number): Promise<{
        date: string;
        created: number;
        delivered: number;
        inTransit: number;
    }[]>;
    broadcastAnalyticsUpdate(): Promise<void>;
    generateMockRealtimeData(): DashboardStats;
}
