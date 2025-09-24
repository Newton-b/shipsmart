interface TrackingResponse {
  trackingNumber: string;
  carrierCode: string;
  carrierName: string;
  currentStatus: string;
  events: Array<{
    status: string;
    description?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    };
    timestamp: string;
    estimatedDelivery?: string;
    signedBy?: string;
    externalEventId?: string;
  }>;
  estimatedDelivery?: string;
  actualDelivery?: string;
  origin?: {
    city?: string;
    state?: string;
    country?: string;
  };
  destination?: {
    city?: string;
    state?: string;
    country?: string;
  };
  lastUpdated: string;
  isDelivered: boolean;
}

interface BatchTrackingRequest {
  trackingNumbers: string[];
  carrierCode?: string;
}

interface CarrierInfo {
  carrierCode: string;
  carrierName: string;
  carrierType: string;
  isActive: boolean;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  carriers: Array<{
    carrierCode: string;
    isHealthy: boolean;
    lastChecked: string;
  }>;
  database: {
    status: string;
  };
  cache: {
    status: string;
  };
}

class TrackingApi {
  private readonly baseUrl = 'http://localhost:3001/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async trackShipment(trackingNumber: string, carrierCode?: string): Promise<TrackingResponse> {
    const params = new URLSearchParams({ trackingNumber });
    if (carrierCode) {
      params.append('carrierCode', carrierCode);
    }
    
    return this.request<TrackingResponse>(`/tracking/track?${params}`);
  }

  async trackBatch(request: BatchTrackingRequest): Promise<TrackingResponse[]> {
    return this.request<TrackingResponse[]>('/tracking/batch', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAvailableCarriers(): Promise<CarrierInfo[]> {
    return this.request<CarrierInfo[]>('/tracking/carriers');
  }

  async getHealthStatus(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/tracking/health');
  }

  createEventSource(trackingNumber: string, carrierCode?: string): EventSource {
    const params = new URLSearchParams();
    if (carrierCode) {
      params.append('carrierCode', carrierCode);
    }
    
    const url = `${this.baseUrl}/tracking/events/${trackingNumber}?${params}`;
    return new EventSource(url);
  }
}

export const trackingApi = new TrackingApi();
export type { TrackingResponse, BatchTrackingRequest, CarrierInfo, HealthStatus };
