import { TrackingRequest, TrackingResponse, CarrierConfig } from '../types/tracking.types';

export interface CarrierAdapterInterface {
  track(trackingNumber: string): Promise<TrackingResponse>;
  trackBatch(trackingNumbers: string[]): Promise<TrackingResponse[]>;
  isTrackingNumberValid(trackingNumber: string): boolean;
  getTrackingNumberPatterns(): RegExp[];
  healthCheck(): Promise<boolean>;
  getCarrierCode(): string;
  getCarrierName(): string;
  getConfig(): CarrierConfig;
  updateConfig(newConfig: Partial<CarrierConfig>): void;
}

export abstract class CarrierAdapter implements CarrierAdapterInterface {
  protected config: CarrierConfig;
  protected carrierCode: string;
  protected carrierName: string;

  constructor(config: CarrierConfig) {
    this.config = config;
    this.carrierCode = config.carrierCode;
    this.carrierName = config.carrierName;
  }

  /**
   * Track a single shipment
   */
  abstract track(trackingNumber: string): Promise<TrackingResponse>;

  /**
   * Track multiple shipments in batch
   */
  abstract trackBatch(trackingNumbers: string[]): Promise<TrackingResponse[]>;

  /**
   * Validate if tracking number format is supported by this carrier
   */
  abstract isTrackingNumberValid(trackingNumber: string): boolean;

  /**
   * Get carrier-specific tracking number patterns
   */
  abstract getTrackingNumberPatterns(): RegExp[];

  /**
   * Test if the carrier API is accessible
   */
  abstract healthCheck(): Promise<boolean>;

  /**
   * Get carrier code
   */
  getCarrierCode(): string {
    return this.carrierCode;
  }

  /**
   * Get carrier name
   */
  getCarrierName(): string {
    return this.carrierName;
  }

  /**
   * Get configuration
   */
  getConfig(): CarrierConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CarrierConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
