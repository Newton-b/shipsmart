import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class CarriersService {
  private readonly logger = new Logger(CarriersService.name);

  constructor(
    private readonly upsService: UpsService,
    private readonly fedexService: FedexService,
    private readonly dhlService: DhlService,
  ) {}

  async trackShipment(trackingNumber: string, carrier?: string): Promise<TrackingInfo> {
    this.logger.log(`Tracking shipment: ${trackingNumber} with carrier: ${carrier || 'auto-detect'}`);

    if (carrier) {
      return this.trackWithSpecificCarrier(trackingNumber, carrier);
    }

    // Try to auto-detect carrier based on tracking number format
    const detectedCarrier = this.detectCarrier(trackingNumber);
    if (detectedCarrier) {
      return this.trackWithSpecificCarrier(trackingNumber, detectedCarrier);
    }

    // If auto-detection fails, try all carriers
    const carriers = ['ups', 'fedex', 'dhl'];
    for (const carrierName of carriers) {
      try {
        const result = await this.trackWithSpecificCarrier(trackingNumber, carrierName);
        if (result && result.events.length > 0) {
          return result;
        }
      } catch (error) {
        this.logger.debug(`Failed to track with ${carrierName}: ${error.message}`);
      }
    }

    throw new Error('Unable to track shipment with any carrier');
  }

  private async trackWithSpecificCarrier(trackingNumber: string, carrier: string): Promise<TrackingInfo> {
    switch (carrier.toLowerCase()) {
      case 'ups':
        return this.upsService.trackShipment(trackingNumber);
      case 'fedex':
        return this.fedexService.trackShipment(trackingNumber);
      case 'dhl':
        return this.dhlService.trackShipment(trackingNumber);
      default:
        throw new Error(`Unsupported carrier: ${carrier}`);
    }
  }

  async getRates(
    origin: ShippingAddress,
    destination: ShippingAddress,
    packages: Package[],
    carriers?: string[]
  ): Promise<RateQuote[]> {
    const targetCarriers = carriers || ['ups', 'fedex', 'dhl'];
    const quotes: RateQuote[] = [];

    for (const carrier of targetCarriers) {
      try {
        const carrierQuotes = await this.getRatesFromCarrier(carrier, origin, destination, packages);
        quotes.push(...carrierQuotes);
      } catch (error) {
        this.logger.error(`Failed to get rates from ${carrier}: ${error.message}`);
      }
    }

    return quotes.sort((a, b) => a.cost - b.cost);
  }

  private async getRatesFromCarrier(
    carrier: string,
    origin: ShippingAddress,
    destination: ShippingAddress,
    packages: Package[]
  ): Promise<RateQuote[]> {
    switch (carrier.toLowerCase()) {
      case 'ups':
        return this.upsService.getRates(origin, destination, packages);
      case 'fedex':
        return this.fedexService.getRates(origin, destination, packages);
      case 'dhl':
        return this.dhlService.getRates(origin, destination, packages);
      default:
        throw new Error(`Unsupported carrier: ${carrier}`);
    }
  }

  async createShipment(
    carrier: string,
    origin: ShippingAddress,
    destination: ShippingAddress,
    packages: Package[],
    service: string,
    options?: any
  ): Promise<any> {
    switch (carrier.toLowerCase()) {
      case 'ups':
        return this.upsService.createShipment(origin, destination, packages, service, options);
      case 'fedex':
        return this.fedexService.createShipment(origin, destination, packages, service, options);
      case 'dhl':
        return this.dhlService.createShipment(origin, destination, packages, service, options);
      default:
        throw new Error(`Unsupported carrier: ${carrier}`);
    }
  }

  private detectCarrier(trackingNumber: string): string | null {
    // UPS tracking numbers
    if (/^1Z[0-9A-Z]{16}$/.test(trackingNumber)) {
      return 'ups';
    }

    // FedEx tracking numbers
    if (/^\d{12}$/.test(trackingNumber) || /^\d{14}$/.test(trackingNumber)) {
      return 'fedex';
    }

    // DHL tracking numbers
    if (/^\d{10}$/.test(trackingNumber) || /^\d{11}$/.test(trackingNumber)) {
      return 'dhl';
    }

    return null;
  }

  getSupportedCarriers(): string[] {
    return ['ups', 'fedex', 'dhl'];
  }

  async validateAddress(address: ShippingAddress, carrier?: string): Promise<{
    isValid: boolean;
    suggestions?: ShippingAddress[];
    errors?: string[];
  }> {
    // Use UPS as default for address validation
    const validationCarrier = carrier || 'ups';
    
    switch (validationCarrier.toLowerCase()) {
      case 'ups':
        return this.upsService.validateAddress(address);
      case 'fedex':
        return this.fedexService.validateAddress(address);
      case 'dhl':
        return this.dhlService.validateAddress(address);
      default:
        throw new Error(`Address validation not supported for carrier: ${carrier}`);
    }
  }
}
