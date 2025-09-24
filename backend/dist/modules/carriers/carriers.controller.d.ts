import { CarriersService, ShippingAddress, Package } from './carriers.service';
export declare class CarriersController {
    private readonly carriersService;
    constructor(carriersService: CarriersService);
    getSupportedCarriers(): {
        carriers: string[];
    };
    trackShipment(trackingNumber: string, carrier?: string): Promise<import("./carriers.service").TrackingInfo>;
    getRates(rateRequest: {
        origin: ShippingAddress;
        destination: ShippingAddress;
        packages: Package[];
        carriers?: string[];
    }): Promise<import("./carriers.service").RateQuote[]>;
    createShipment(shipmentRequest: {
        carrier: string;
        origin: ShippingAddress;
        destination: ShippingAddress;
        packages: Package[];
        service: string;
        options?: any;
    }): Promise<any>;
    validateAddress(validationRequest: {
        address: ShippingAddress;
        carrier?: string;
    }): Promise<{
        isValid: boolean;
        suggestions?: ShippingAddress[];
        errors?: string[];
    }>;
}
