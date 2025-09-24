import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export interface TrackingInfo {
    trackingNumber: string;
    status: string;
    statusDescription: string;
    estimatedDelivery?: Date;
    currentLocation?: string;
    events: TrackingEvent[];
}
export interface TrackingEvent {
    date: Date;
    location: string;
    description: string;
    status: string;
}
export interface ShippingRate {
    service: string;
    cost: number;
    currency: string;
    transitTime: string;
    deliveryDate?: Date;
}
export declare class UpsService {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly baseUrl;
    private readonly accessKey;
    private readonly username;
    private readonly password;
    constructor(configService: ConfigService, httpService: HttpService);
    trackShipment(trackingNumber: string): Promise<TrackingInfo>;
    getRates(origin: string, destination: string, weight: number, dimensions?: {
        length: number;
        width: number;
        height: number;
    }): Promise<ShippingRate[]>;
    private parseUpsTrackingResponse;
    private parseUpsRateResponse;
    private getMockTrackingInfo;
    private getMockRates;
    isConfigured(): boolean;
}
