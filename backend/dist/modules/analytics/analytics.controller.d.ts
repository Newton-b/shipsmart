import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboardStats(): Promise<import("./analytics.service").DashboardStats>;
    getRevenueAnalytics(period?: 'daily' | 'monthly' | 'yearly'): Promise<import("./analytics.service").RevenueAnalytics>;
    getCarrierPerformance(): Promise<import("./analytics.service").CarrierPerformance[]>;
    getGeographicAnalytics(): Promise<import("./analytics.service").GeographicAnalytics[]>;
    getShipmentTrends(days?: number): Promise<{
        date: string;
        created: number;
        delivered: number;
        inTransit: number;
    }[]>;
    generateRealtimeData(): Promise<import("./analytics.service").DashboardStats>;
}
