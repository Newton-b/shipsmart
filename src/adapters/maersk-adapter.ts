import axios, { AxiosInstance, AxiosResponse } from 'axios';
import CircuitBreaker from 'opossum';
import { CarrierAdapter } from './carrier-adapter.interface';
import {
  TrackingRequest,
  TrackingResponse,
  CarrierConfig,
  TrackingEventData,
  CarrierApiError,
  TrackingStatus,
} from '@/types/tracking.types';
import { TrackingResponseSchema } from '@/types/tracking.types';

interface MaerskTrackingResponse {
  data: Array<{
    container: {
      containerNumber: string;
      bookingReference: string;
      transportDocumentReference: string;
    };
    route: {
      routeDetails: Array<{
        fromLocation: {
          locationName: string;
          locationType: string;
          UNLocationCode: string;
        };
        toLocation: {
          locationName: string;
          locationType: string;
          UNLocationCode: string;
        };
      }>;
    };
    events: Array<{
      eventType: string;
      eventClassifierCode: string;
      eventDateTime: string;
      location: {
        locationName: string;
        locationType: string;
        UNLocationCode: string;
        facilityName: string;
        facilityTypeCode: string;
      };
      transportCall: {
        transportCallReference: string;
        carrierServiceCode: string;
        exportVoyageNumber: string;
        importVoyageNumber: string;
        transportCallSequenceNumber: number;
      };
      eventDescription: string;
      vesselName: string;
      vesselIMONumber: string;
      carrierBookingReference: string;
    }>;
    equipmentEvents: Array<{
      eventType: string;
      eventClassifierCode: string;
      eventDateTime: string;
      location: {
        locationName: string;
        locationType: string;
        UNLocationCode: string;
        facilityName: string;
        facilityTypeCode: string;
      };
      equipmentReference: string;
      ISOEquipmentCode: string;
      emptyIndicatorCode: string;
      eventDescription: string;
    }>;
  }>;
}

export class MaerskAdapter extends CarrierAdapter {
  private httpClient: AxiosInstance;
  private circuitBreaker: CircuitBreaker;

  constructor(config: CarrierConfig) {
    super(config);
    
    this.httpClient = axios.create({
      baseURL: config.baseUrl || 'https://api.maersk.com',
      timeout: config.timeout * 1000,
      headers: {
        'Content-Type': 'application/json',
        'Consumer-Key': config.apiKey,
        'Authorization': `Bearer ${config.apiSecret}`,
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
      console.warn(`Maersk Circuit breaker opened for carrier ${this.carrierCode}`);
    });

    this.circuitBreaker.on('halfOpen', () => {
      console.info(`Maersk Circuit breaker half-open for carrier ${this.carrierCode}`);
    });

    this.circuitBreaker.on('close', () => {
      console.info(`Maersk Circuit breaker closed for carrier ${this.carrierCode}`);
    });
  }

  async track(trackingNumber: string): Promise<TrackingResponse> {
    try {
      const response = await this.circuitBreaker.fire(trackingNumber);
      return this.transformResponse(response.data, trackingNumber);
    } catch (error) {
      console.error('Maersk tracking error:', error);
      throw new Error(`Failed to track Maersk shipment: ${error.message}`);
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

  private async makeApiCall(containerNumber: string): Promise<AxiosResponse<MaerskTrackingResponse>> {
    // Support both single container and comma-separated list
    const endpoint = containerNumber.includes(',') 
      ? `/track-and-trace-private/events?containerNumber=${containerNumber}`
      : `/track-and-trace-private/events?containerNumber=${containerNumber}`;
    
    return this.httpClient.get(endpoint);
  }

  private transformResponse(data: MaerskTrackingResponse, trackingNumber: string): TrackingResponse {
    const containerData = data.data?.[0];
    
    if (!containerData) {
      throw new CarrierApiError(
        'No tracking information found',
        404,
        this.carrierCode,
        trackingNumber,
      );
    }

    return this.transformContainerResponse(containerData, trackingNumber);
  }

  private transformContainerResponse(containerData: any, trackingNumber: string): TrackingResponse {
    // Combine transport events and equipment events
    const allEvents = [
      ...(containerData.events || []),
      ...(containerData.equipmentEvents || []),
    ];

    const events: TrackingEventData[] = allEvents.map(event => ({
      status: this.mapMaerskStatusToTrackingStatus(event.eventClassifierCode, event.eventType),
      description: event.eventDescription,
      location: {
        city: event.location?.locationName,
        country: event.location?.UNLocationCode?.substring(0, 2), // First 2 chars are country code
        address: event.location?.facilityName,
      },
      timestamp: new Date(event.eventDateTime),
      externalEventId: event.eventClassifierCode,
      rawData: event,
    }));

    // Sort events by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Determine origin and destination from route
    const route = containerData.route?.routeDetails?.[0];
    const origin = route?.fromLocation ? {
      city: route.fromLocation.locationName,
      country: route.fromLocation.UNLocationCode?.substring(0, 2),
    } : undefined;

    const destination = route?.toLocation ? {
      city: route.toLocation.locationName,
      country: route.toLocation.UNLocationCode?.substring(0, 2),
    } : undefined;

    // Check if delivered (container discharged at final destination)
    const isDelivered = events.some(event => 
      event.status === TrackingStatus.DELIVERED ||
      (event.rawData as any)?.eventClassifierCode === 'DIS' // Discharged
    );

    const response: TrackingResponse = {
      trackingNumber,
      carrierCode: this.carrierCode,
      carrierName: this.carrierName,
      currentStatus: events[0]?.status || TrackingStatus.PENDING,
      events,
      origin,
      destination,
      lastUpdated: new Date(),
      isDelivered,
      rawData: containerData,
    };

    // Validate response
    return TrackingResponseSchema.parse(response);
  }

  private mapMaerskStatusToTrackingStatus(classifierCode: string, eventType: string): TrackingStatus {
    // Maersk uses event classifier codes and event types
    const statusMap: Record<string, TrackingStatus> = {
      // Transport Events
      'DEP': TrackingStatus.IN_TRANSIT,    // Departed
      'ARR': TrackingStatus.IN_TRANSIT,    // Arrived
      'LOD': TrackingStatus.IN_TRANSIT,    // Loaded
      'DIS': TrackingStatus.DELIVERED,     // Discharged
      'GIN': TrackingStatus.IN_TRANSIT,    // Gate In
      'GOT': TrackingStatus.OUT_FOR_DELIVERY, // Gate Out
      
      // Equipment Events
      'STUF': TrackingStatus.IN_TRANSIT,   // Stuffed
      'STRP': TrackingStatus.IN_TRANSIT,   // Stripped
      'PICK': TrackingStatus.OUT_FOR_DELIVERY, // Picked up
      'DROP': TrackingStatus.DELIVERED,    // Dropped off
      'RETU': TrackingStatus.RETURNED,     // Returned
      
      // Special statuses
      'CANC': TrackingStatus.CANCELLED,    // Cancelled
      'HOLD': TrackingStatus.EXCEPTION,    // On hold
    };

    // First try classifier code, then event type
    return statusMap[classifierCode] || statusMap[eventType] || TrackingStatus.PENDING;
  }

  isTrackingNumberValid(trackingNumber: string): boolean {
    const patterns = this.getTrackingNumberPatterns();
    return patterns.some(pattern => pattern.test(trackingNumber));
  }

  getTrackingNumberPatterns(): RegExp[] {
    return [
      /^[A-Z]{4}\d{7}$/i,     // Standard container number (4 letters + 7 digits)
      /^[A-Z]{3}U\d{7}$/i,    // Container with U as 4th character
      /^MAEU\d{7}$/i,         // Maersk specific containers
      /^MSCU\d{7}$/i,         // MSC containers handled by Maersk
      /^SEGU\d{7}$/i,         // Safmarine containers
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Use a simple endpoint to check API availability
      const response = await this.httpClient.get('/track-and-trace-private/health', { 
        timeout: 5000,
        validateStatus: (status) => status < 500, // Accept 4xx but not 5xx
      });
      return response.status < 500;
    } catch (error) {
      console.error('Maersk health check failed:', error.message);
      return false;
    }
  }
}
