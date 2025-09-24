import { ConfigService } from '@nestjs/config';
import { TrackingInfo, RateQuote, ShippingAddress, Package } from '../carriers.service';
export declare class FedexService {
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly secretKey;
    constructor(configService: ConfigService);
    trackShipment(trackingNumber: string): Promise<TrackingInfo>;
    getRates(origin: ShippingAddress, destination: ShippingAddress, packages: Package[]): Promise<RateQuote[]>;
    createShipment(origin: ShippingAddress, destination: ShippingAddress, packages: Package[], service: string, options?: any): Promise<any>;
    validateAddress(address: ShippingAddress): Promise<{
        isValid: boolean;
        suggestions?: ShippingAddress[];
        errors?: string[];
    }>;
    private getMockTrackingInfo;
    private getMockRates;
    private getMockShipmentResponse;
}
