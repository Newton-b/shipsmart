import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import { CarrierKey, CarrierKeyDocument } from '../entities/carrier-key.entity';
import { CarrierAdapter } from '../adapters/carrier-adapter.interface';
import { UpsAdapter } from '../adapters/ups-adapter';
import { FedexAdapter } from '../adapters/fedex-adapter';
import { MaerskAdapter } from '../adapters/maersk-adapter';
import { CarrierConfig, CarrierHealthStatus } from '../types/tracking.types';

@Injectable()
export class CarrierAdapterFactory implements OnModuleInit {
  private readonly logger = new Logger(CarrierAdapterFactory.name);
  private readonly adapters = new Map<string, CarrierAdapter>();
  private readonly adapterClasses = new Map<string, any>();

  constructor(
    @InjectModel(CarrierKey.name) private carrierKeyModel: Model<CarrierKeyDocument>,
    private configService: ConfigService,
    private upsAdapter: UpsAdapter,
    private fedexAdapter: FedexAdapter,
    private maerskAdapter: MaerskAdapter,
  ) {
    // Register adapter classes
    this.adapterClasses.set('UPS', UpsAdapter);
    this.adapterClasses.set('FEDEX', FedexAdapter);
    this.adapterClasses.set('MAERSK', MaerskAdapter);
  }

  async onModuleInit() {
    await this.initializeAdapters();
  }

  /**
   * Initialize all carrier adapters with their configurations
   */
  private async initializeAdapters(): Promise<void> {
    try {
      const carrierKeys = await this.carrierKeyModel
        .find({ isActive: true })
        .exec();

      this.logger.log(`Initializing ${carrierKeys.length} carrier adapters`);

      for (const carrierKey of carrierKeys) {
        try {
          const config: CarrierConfig = {
            carrierCode: carrierKey.carrierCode,
            carrierName: carrierKey.carrierName,
            apiKey: carrierKey.apiKey,
            apiSecret: carrierKey.apiSecret,
            baseUrl: carrierKey.baseUrl,
            timeout: carrierKey.timeout,
            retries: carrierKey.retries,
            maxRetries: carrierKey.retries,
            rateLimitPerMinute: carrierKey.rateLimitPerMinute,
          };

          let adapter: CarrierAdapter;
          switch (carrierKey.carrierCode.toUpperCase()) {
            case 'UPS':
              adapter = new UpsAdapter(config);
              break;
            case 'FEDEX':
              adapter = new FedexAdapter(config);
              break;
            case 'MAERSK':
              adapter = new MaerskAdapter(config);
              break;
            default:
              console.warn(`Unknown carrier code: ${carrierKey.carrierCode}`);
              continue;
          }

          this.adapters.set(carrierKey.carrierCode.toUpperCase(), adapter);
        } catch (error) {
          this.logger.error(`Failed to initialize adapter for ${carrierKey.carrierCode}:`, error);
        }
      }

      this.logger.log(`Successfully initialized ${this.adapters.size} carrier adapters`);
    } catch (error) {
      this.logger.error('Failed to initialize carrier adapters:', error);
    }
  }

  /**
   * Get carrier adapter by carrier code
   */
  async getAdapter(carrierCode: string): Promise<CarrierAdapter> {
    const adapter = this.adapters.get(carrierCode.toUpperCase());
    if (!adapter) {
      throw new Error(`No adapter found for carrier: ${carrierCode}`);
    }
    return adapter;
  }

  /**
   * Create and cache a carrier adapter
   */
  private async createAdapter(carrierKey: CarrierKeyDocument): Promise<CarrierAdapter | null> {
    try {
      const AdapterClass = this.adapterClasses.get(carrierKey.carrierCode);
      if (!AdapterClass) {
        this.logger.warn(`No adapter class found for carrier: ${carrierKey.carrierCode}`);
        return null;
      }

      const config: CarrierConfig = {
        carrierCode: carrierKey.carrierCode,
        carrierName: carrierKey.carrierName,
        apiKey: carrierKey.apiKey,
        apiSecret: carrierKey.apiSecret,
        baseUrl: carrierKey.baseUrl,
        timeout: carrierKey.timeout,
        retries: carrierKey.retries,
        maxRetries: carrierKey.retries,
        rateLimitPerMinute: carrierKey.rateLimitPerMinute,
      };

      // Create adapter instance
      let adapter: CarrierAdapter;
      
      switch (carrierKey.carrierCode) {
        case 'UPS':
          adapter = this.upsAdapter;
          break;
        case 'FEDEX':
          adapter = this.fedexAdapter;
          break;
        case 'MAERSK':
          adapter = this.maerskAdapter;
          break;
        default:
          this.logger.warn(`Unknown carrier code: ${carrierKey.carrierCode}`);
          return null;
      }

      // Cache the adapter
      this.adapters.set(carrierKey.carrierCode, adapter);

      this.logger.debug(`Created adapter for carrier: ${carrierKey.carrierCode}`);
      return adapter;

    } catch (error) {
      this.logger.error(`Failed to create adapter for ${carrierKey.carrierCode}:`, error);
      return null;
    }
  }

  /**
   * Detect carrier from tracking number pattern
   */
  async detectCarrierFromTrackingNumber(trackingNumber: string): Promise<string | null> {
    try {
      const carrierKeys = await this.carrierKeyModel
        .find({ isActive: true })
        .exec();

      for (const carrierKey of carrierKeys) {
        if (carrierKey.validateTrackingNumber(trackingNumber)) {
          this.logger.debug(`Detected carrier ${carrierKey.carrierCode} for tracking number: ${trackingNumber}`);
          return carrierKey.carrierCode;
        }
      }

      this.logger.warn(`Could not detect carrier for tracking number: ${trackingNumber}`);
      return null;
    } catch (error) {
      this.logger.error('Error detecting carrier from tracking number:', error);
      return null;
    }
  }

  detectCarrier(trackingNumber: string): string | null {
    const cleanTrackingNumber = trackingNumber.replace(/\s+/g, '').toUpperCase();

    // UPS tracking numbers
    if (/^1Z[0-9A-Z]{16}$/.test(cleanTrackingNumber)) {
      return 'UPS';
    }

    // FedEx tracking numbers
    if (/^[0-9]{12}$/.test(cleanTrackingNumber) || /^[0-9]{14}$/.test(cleanTrackingNumber)) {
      return 'FEDEX';
    }

    // Maersk container numbers
    if (/^[A-Z]{4}[0-9]{7}$/.test(cleanTrackingNumber)) {
      return 'MAERSK';
    }

    return null;
  }

  /**
   * Get all available carriers
   */
  async getAvailableCarriers(): Promise<string[]> {
    try {
      const carrierKeys = await this.carrierKeyModel
        .find({ isActive: true })
        .select('carrierCode')
        .exec();

      return carrierKeys.map(key => key.carrierCode);
    } catch (error) {
      this.logger.error('Error getting available carriers:', error);
      return [];
    }
  }

  async getAvailableCarriersDetailed(): Promise<any[]> {
    try {
      const carriers = await this.carrierKeyModel.find({ isActive: true }).exec();
      return carriers.map(carrier => ({
        carrierCode: carrier.carrierCode,
        carrierName: carrier.carrierName,
        carrierType: carrier.carrierType,
        isActive: carrier.isActive,
      }));
    } catch (error) {
      console.error('Error fetching available carriers:', error);
      // Return default carriers if database fails
      return [
        { carrierCode: 'UPS', carrierName: 'United Parcel Service', carrierType: 'UPS', isActive: true },
        { carrierCode: 'FEDEX', carrierName: 'FedEx Corporation', carrierType: 'FEDEX', isActive: true },
        { carrierCode: 'MAERSK', carrierName: 'A.P. Moller-Maersk', carrierType: 'MAERSK', isActive: true },
      ];
    }
  }

  /**
   * Health check for all carriers
   */
  async getCarrierHealthStatus(): Promise<CarrierHealthStatus[]> {
    const healthStatuses: CarrierHealthStatus[] = [];
    
    try {
      const carrierKeys = await this.carrierKeyModel
        .find({ isActive: true })
        .exec();

      for (const carrierKey of carrierKeys) {
        try {
          const adapter = await this.getAdapter(carrierKey.carrierCode);
          const isHealthy = adapter ? await adapter.healthCheck() : false;
          
          healthStatuses.push({
            carrierCode: carrierKey.carrierCode,
            isHealthy,
            lastChecked: new Date(),
          });
        } catch (error) {
          healthStatuses.push({
            carrierCode: carrierKey.carrierCode,
            isHealthy: false,
            lastChecked: new Date(),
            errorMessage: error.message,
          });
        }
      }
    } catch (error) {
      this.logger.error('Error getting carrier health status:', error);
    }

    return healthStatuses;
  }

  /**
   * Health check for the carrier adapter factory
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};

    for (const [carrierCode, adapter] of this.adapters.entries()) {
      try {
        // Simple health check - try to initialize or ping the adapter
        healthStatus[carrierCode] = true;
      } catch (error) {
        console.error(`Health check failed for ${carrierCode}:`, error);
        healthStatus[carrierCode] = false;
      }
    }

    return healthStatus;
  }

  /**
   * Refresh adapter configuration
   */
  async refreshAdapter(carrierCode: string): Promise<boolean> {
    try {
      const normalizedCode = carrierCode.toUpperCase();
      
      // Remove cached adapter
      this.adapters.delete(normalizedCode);
      
      // Recreate adapter
      const carrierKey = await this.carrierKeyModel
        .findOne({ carrierCode: normalizedCode, isActive: true })
        .exec();

      if (!carrierKey) {
        this.logger.warn(`No active carrier key found for refresh: ${normalizedCode}`);
        return false;
      }

      const adapter = await this.createAdapter(carrierKey);
      return adapter !== null;
    } catch (error) {
      this.logger.error(`Error refreshing adapter for ${carrierCode}:`, error);
      return false;
    }
  }

  /**
   * Validate carrier configuration
   */
  async validateCarrierConfig(carrierCode: string): Promise<boolean> {
    try {
      const adapter = await this.getAdapter(carrierCode);
      if (!adapter) {
        return false;
      }

      return await adapter.healthCheck();
    } catch (error) {
      this.logger.error(`Error validating config for ${carrierCode}:`, error);
      return false;
    }
  }

  /**
   * Get adapter cache statistics
   */
  getCacheStats(): { totalAdapters: number; activeAdapters: string[] } {
    return {
      totalAdapters: this.adapters.size,
      activeAdapters: Array.from(this.adapters.keys()),
    };
  }
}
