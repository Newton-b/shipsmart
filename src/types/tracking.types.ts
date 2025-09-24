import { z } from 'zod';

// Enum definitions first
export enum TrackingStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  UNKNOWN = 'unknown',
}

// Zod schemas for validation
export const TrackingRequestSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  carrierCode: z.string().optional(),
});

export const BatchTrackingRequestSchema = z.object({
  trackingNumbers: z.array(z.string()).min(1, 'At least one tracking number is required'),
  carrierCode: z.string().optional(),
});

export const TrackingLocationSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

export const TrackingEventSchema = z.object({
  status: z.nativeEnum(TrackingStatus),
  description: z.string().optional(),
  location: TrackingLocationSchema.optional(),
  timestamp: z.date(),
  estimatedDelivery: z.string().optional(),
  signedBy: z.string().optional(),
  externalEventId: z.string().optional(),
  rawData: z.record(z.any()).optional(),
});

export const TrackingResponseSchema = z.object({
  trackingNumber: z.string(),
  carrierCode: z.string(),
  carrierName: z.string(),
  currentStatus: z.nativeEnum(TrackingStatus),
  events: z.array(TrackingEventSchema),
  estimatedDelivery: z.string().optional(),
  actualDelivery: z.string().optional(),
  origin: TrackingLocationSchema.optional(),
  destination: TrackingLocationSchema.optional(),
  lastUpdated: z.date(),
  isDelivered: z.boolean(),
  rawData: z.record(z.any()).optional(),
});

// TypeScript types derived from schemas
export type TrackingRequest = z.infer<typeof TrackingRequestSchema>;
export type BatchTrackingRequest = z.infer<typeof BatchTrackingRequestSchema>;
export type TrackingLocation = z.infer<typeof TrackingLocationSchema>;
export type TrackingEventData = z.infer<typeof TrackingEventSchema>;
export type TrackingResponse = z.infer<typeof TrackingResponseSchema>;

// Carrier-specific configuration types
export interface CarrierConfig {
  apiKey: string;
  apiSecret?: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  rateLimitPerMinute: number;
  [key: string]: any;
}

// Error types
export class TrackingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly carrierCode?: string,
    public readonly trackingNumber?: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'TrackingError';
  }
}

export class CarrierApiError extends TrackingError {
  constructor(
    message: string,
    public readonly statusCode: number,
    carrierCode?: string,
    trackingNumber?: string,
    originalError?: Error,
  ) {
    super(message, 'CARRIER_API_ERROR', carrierCode, trackingNumber, originalError);
    this.name = 'CarrierApiError';
  }
}

export class RateLimitError extends TrackingError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
    carrierCode?: string,
  ) {
    super(message, 'RATE_LIMIT_ERROR', carrierCode);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends TrackingError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export interface CarrierHealthStatus {
  carrierCode: string;
  isHealthy: boolean;
  lastChecked: Date;
  responseTime?: number;
  errorMessage?: string;
}
