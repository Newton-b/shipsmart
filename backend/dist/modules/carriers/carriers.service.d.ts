import { UpsService } from './services/ups.service';
import { FedexService } from './services/fedex.service';
import { DhlService } from './services/dhl.service';
export interface TrackingInfo {
    trackingNumber: string;
    carrier: string;
    status: string;
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
export interface RateQuote {
    carrier: string;
    service: string;
    cost: number;
    currency: string;
    transitTime: number;
    deliveryDate?: Date;
}
export interface ShippingAddress {
    name: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
}
export interface Package {
    weight: number;
    length: number;
    width: number;
    height: number;
    value?: number;
    description?: string;
}
export declare class CarriersService {
    private readonly upsService;
    private readonly fedexService;
    private readonly dhlService;
    private readonly logger;
    constructor(upsService: UpsService, fedexService: FedexService, dhlService: DhlService);
    trackShipment(trackingNumber: string, carrier?: string): Promise<TrackingInfo>;
    private trackWithSpecificCarrier;
    getRates(origin: ShippingAddress, destination: ShippingAddress, packages: Package[], carriers?: string[]): Promise<RateQuote[]>;
    private getRatesFromCarrier;
    createShipment(carrier: string, origin: ShippingAddress, destination: ShippingAddress, packages: Package[], service: string, options?: any): Promise<any>;
    private detectCarrier;
    getSupportedCarriers(): string[];
    validateAddress(address: ShippingAddress, carrier?: string): Promise<{
        isValid: boolean;
        suggestions?: ShippingAddress[];
        errors?: string[];
    }>;
}
