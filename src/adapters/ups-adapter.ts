import axios, { AxiosInstance, AxiosResponse } from 'axios';
import CircuitBreaker from 'opossum';
import { CarrierAdapter } from './carrier-adapter.interface';
import {
  TrackingResponse,
  CarrierConfig,
  TrackingEventData,
  TrackingStatus,
} from '../types/tracking.types';
import { TrackingResponseSchema } from '../types/tracking.types';

interface UpsTrackingResponse {
  trackResponse: {
    shipment: Array<{
      inquiryNumber: string;
      package: Array<{
        trackingNumber: string;
        deliveryDate: Array<{
          date: string;
        }>;
        activity: Array<{
          location: {
            address: {
              city: string;
              stateProvinceCode: string;
              countryCode: string;
              postalCode: string;
            };
          };
          status: {
            type: string;
            description: string;
            code: string;
          };
          date: string;
          time: string;
        }>;
      }>;
    }>;
  };
}

export class UpsAdapter extends CarrierAdapter {
  private httpClient: AxiosInstance;
  private circuitBreaker: CircuitBreaker;

  constructor(config: CarrierConfig) {
    super(config);
    
    this.httpClient = axios.create({
      baseURL: config.baseUrl || 'https://onlinetools.ups.com/api',
      timeout: config.timeout * 1000,
      headers: {
        'Content-Type': 'application/json',
        'AccessLicenseNumber': config.apiKey,
        'Username': config.apiSecret?.split(':')[0] || '',
        'Password': config.apiSecret?.split(':')[1] || '',
      },
    });

    // Circuit breaker configuration
    const circuitBreakerOptions = {
      timeout: config.timeout * 1000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
    };

    this.circuitBreaker = new CircuitBreaker(this.makeApiCall.bind(this), circuitBreakerOptions);
    
    this.circuitBreaker.on('open', () => {
      console.warn(`UPS Circuit breaker opened for carrier ${this.carrierCode}`);
    });

    this.circuitBreaker.on('halfOpen', () => {
      console.info(`UPS Circuit breaker half-open for carrier ${this.carrierCode}`);
    });

    this.circuitBreaker.on('close', () => {
      console.info(`UPS Circuit breaker closed for carrier ${this.carrierCode}`);
    });
  }

  async track(trackingNumber: string): Promise<TrackingResponse> {
    try {
      const response = await this.circuitBreaker.fire(trackingNumber);
      return this.transformResponse(response.data, trackingNumber);
    } catch (error) {
      console.error('UPS tracking error:', error);
      throw new Error(`Failed to track UPS shipment: ${error.message}`);
    }
  }

  async trackBatch(trackingNumbers: string[]): Promise<TrackingResponse[]> {
    const promises = trackingNumbers.map(trackingNumber =>
      this.track(trackingNumber)
        .catch(error => {
          console.error(`Batch tracking failed for ${trackingNumber}:`, error);
          return null;
        })
    );

    const results = await Promise.all(promises);
    return results.filter(result => result !== null) as TrackingResponse[];
  }

  private async makeApiCall(trackingNumber: string): Promise<AxiosResponse<UpsTrackingResponse>> {
    const requestData = {
      UPSSecurity: {
        UsernameToken: {
          Username: this.config.apiSecret?.split(':')[0] || '',
          Password: this.config.apiSecret?.split(':')[1] || '',
        },
        ServiceAccessToken: {
          AccessLicenseNumber: this.config.apiKey,
        },
      },
      TrackRequest: {
        Request: {
          RequestOption: '1',
          TransactionReference: {
            CustomerContext: 'ShipSmart Tracking',
          },
        },
        InquiryNumber: trackingNumber,
      },
    };

    return this.httpClient.post('/Track', requestData);
  }

  private transformResponse(data: UpsTrackingResponse, trackingNumber: string): TrackingResponse {
    const shipment = data.trackResponse.shipment[0];
    const packageInfo = shipment.package[0];
    
    const events: TrackingEventData[] = packageInfo.activity.map(activity => ({
      status: this.mapUpsStatusToTrackingStatus(activity.status.code),
      description: activity.status.description,
      location: {
        city: activity.location.address.city,
        state: activity.location.address.stateProvinceCode,
        country: activity.location.address.countryCode,
        postalCode: activity.location.address.postalCode,
      },
      timestamp: new Date(`${activity.date} ${activity.time}`),
      externalEventId: activity.status.code,
      rawData: activity,
    }));

    // Sort events by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const response: TrackingResponse = {
      trackingNumber,
      carrierCode: this.carrierCode,
      carrierName: this.carrierName,
      currentStatus: events[0]?.status || TrackingStatus.PENDING,
      events,
      estimatedDelivery: packageInfo.deliveryDate?.[0]?.date,
      lastUpdated: new Date(),
      isDelivered: events[0]?.status === TrackingStatus.DELIVERED,
      rawData: data,
    };

    // Validate response
    return TrackingResponseSchema.parse(response);
  }

  private mapUpsStatusToTrackingStatus(upsStatus: string): TrackingStatus {
    const statusMap: Record<string, TrackingStatus> = {
      'I': TrackingStatus.IN_TRANSIT,
      'D': TrackingStatus.DELIVERED,
      'X': TrackingStatus.EXCEPTION,
      'P': TrackingStatus.PENDING,
      'M': TrackingStatus.IN_TRANSIT,
      'O': TrackingStatus.OUT_FOR_DELIVERY,
    };

    return statusMap[upsStatus] || TrackingStatus.PENDING;
  }

  isTrackingNumberValid(trackingNumber: string): boolean {
    const patterns = this.getTrackingNumberPatterns();
    return patterns.some(pattern => pattern.test(trackingNumber));
  }

  getTrackingNumberPatterns(): RegExp[] {
    return [
      /^1Z[0-9A-Z]{16}$/i, // Standard UPS tracking number
      /^[0-9]{12}$/,       // UPS Mail Innovations
      /^T\d{10}$/i,        // UPS SurePost
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Use a test tracking number or ping endpoint
      const response = await this.httpClient.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('UPS health check failed:', error.message);
      return false;
    }
  }
}
