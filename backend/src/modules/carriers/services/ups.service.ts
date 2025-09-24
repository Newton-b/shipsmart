import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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

@Injectable()
export class UpsService {
  private readonly logger = new Logger(UpsService.name);
  private readonly baseUrl = 'https://onlinetools.ups.com/api';
  private readonly accessKey: string;
  private readonly username: string;
  private readonly password: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.accessKey = this.configService.get('UPS_ACCESS_KEY');
    this.username = this.configService.get('UPS_USERNAME');
    this.password = this.configService.get('UPS_PASSWORD');

    if (!this.accessKey || !this.username || !this.password) {
      this.logger.warn('UPS credentials not configured - using mock data');
    }
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    if (!this.accessKey) {
      return this.getMockTrackingInfo(trackingNumber);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/track/v1/details/${trackingNumber}`, {
          headers: {
            'AccessLicenseNumber': this.accessKey,
            'Username': this.username,
            'Password': this.password,
            'Content-Type': 'application/json',
          },
        }),
      );

      return this.parseUpsTrackingResponse(response.data);
    } catch (error) {
      this.logger.error(`UPS tracking failed for ${trackingNumber}:`, error.message);
      return this.getMockTrackingInfo(trackingNumber);
    }
  }

  async getRates(
    origin: string,
    destination: string,
    weight: number,
    dimensions?: { length: number; width: number; height: number },
  ): Promise<ShippingRate[]> {
    if (!this.accessKey) {
      return this.getMockRates();
    }

    try {
      const rateRequest = {
        RateRequest: {
          Request: {
            RequestOption: 'Rate',
          },
          Shipment: {
            Shipper: {
              Address: {
                City: origin.split(',')[0],
                StateProvinceCode: origin.split(',')[1]?.trim(),
                CountryCode: 'US',
              },
            },
            ShipTo: {
              Address: {
                City: destination.split(',')[0],
                StateProvinceCode: destination.split(',')[1]?.trim(),
                CountryCode: 'US',
              },
            },
            Package: {
              PackagingType: {
                Code: '02', // Customer Supplied Package
              },
              Dimensions: dimensions ? {
                UnitOfMeasurement: {
                  Code: 'CM',
                },
                Length: dimensions.length.toString(),
                Width: dimensions.width.toString(),
                Height: dimensions.height.toString(),
              } : undefined,
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: 'KGS',
                },
                Weight: weight.toString(),
              },
            },
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/rating/v1/Rate`, rateRequest, {
          headers: {
            'AccessLicenseNumber': this.accessKey,
            'Username': this.username,
            'Password': this.password,
            'Content-Type': 'application/json',
          },
        }),
      );

      return this.parseUpsRateResponse(response.data);
    } catch (error) {
      this.logger.error('UPS rate request failed:', error.message);
      return this.getMockRates();
    }
  }

  private parseUpsTrackingResponse(data: any): TrackingInfo {
    const trackResponse = data.TrackResponse;
    const shipment = trackResponse.Shipment[0];
    const package_ = shipment.Package[0];

    const events: TrackingEvent[] = package_.Activity?.map((activity: any) => ({
      date: new Date(activity.Date + 'T' + activity.Time),
      location: `${activity.ActivityLocation.Address.City}, ${activity.ActivityLocation.Address.StateProvinceCode}`,
      description: activity.Status.Description,
      status: activity.Status.Code,
    })) || [];

    return {
      trackingNumber: package_.TrackingNumber,
      status: package_.CurrentStatus?.Code || 'unknown',
      statusDescription: package_.CurrentStatus?.Description || 'Status unknown',
      estimatedDelivery: package_.DeliveryDate ? new Date(package_.DeliveryDate) : undefined,
      currentLocation: events[0]?.location,
      events: events.reverse(), // Most recent first
    };
  }

  private parseUpsRateResponse(data: any): ShippingRate[] {
    const rateResponse = data.RateResponse;
    
    return rateResponse.RatedShipment?.map((shipment: any) => ({
      service: shipment.Service.Code,
      cost: parseFloat(shipment.TotalCharges.MonetaryValue),
      currency: shipment.TotalCharges.CurrencyCode,
      transitTime: shipment.GuaranteedDelivery?.BusinessDaysInTransit || 'Unknown',
      deliveryDate: shipment.GuaranteedDelivery?.DeliveryByTime ? 
        new Date(shipment.GuaranteedDelivery.DeliveryByTime) : undefined,
    })) || [];
  }

  private getMockTrackingInfo(trackingNumber: string): TrackingInfo {
    const mockEvents: TrackingEvent[] = [
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        location: 'Atlanta, GA',
        description: 'Package received at UPS facility',
        status: 'received',
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        location: 'Louisville, KY',
        description: 'Package departed facility',
        status: 'in_transit',
      },
      {
        date: new Date(),
        location: 'Chicago, IL',
        description: 'Out for delivery',
        status: 'out_for_delivery',
      },
    ];

    return {
      trackingNumber,
      status: 'out_for_delivery',
      statusDescription: 'Out for delivery',
      estimatedDelivery: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      currentLocation: 'Chicago, IL',
      events: mockEvents,
    };
  }

  private getMockRates(): ShippingRate[] {
    return [
      {
        service: 'UPS Ground',
        cost: 12.50,
        currency: 'USD',
        transitTime: '3-5 business days',
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        service: 'UPS 2nd Day Air',
        cost: 25.75,
        currency: 'USD',
        transitTime: '2 business days',
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        service: 'UPS Next Day Air',
        cost: 45.00,
        currency: 'USD',
        transitTime: '1 business day',
        deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  isConfigured(): boolean {
    return !!(this.accessKey && this.username && this.password);
  }
}
