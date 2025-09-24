import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CarrierAdapterFactory } from './carrier-adapter.factory';
import { CarrierAdapterInterface } from '../adapters/carrier-adapter.interface';
import { TrackingEvent, TrackingEventDocument } from '../entities/tracking-event.entity';
import { TrackingResponse } from '../types/tracking.types';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(TrackingEvent.name)
    private readonly trackingEventModel: Model<TrackingEventDocument>,
    private readonly carrierAdapterFactory: CarrierAdapterFactory,
  ) {}

  /**
   * Track a single shipment
   */
  async trackShipment(trackingNumber: string, carrierCode?: string): Promise<any> {
    try {
      let adapter: CarrierAdapterInterface;
      
      if (carrierCode) {
        adapter = await this.carrierAdapterFactory.getAdapter(carrierCode);
      } else {
        // Auto-detect carrier
        const detectedCarrier = this.carrierAdapterFactory.detectCarrier(trackingNumber);
        if (!detectedCarrier) {
          throw new Error(`Unable to detect carrier for tracking number: ${trackingNumber}`);
        }
        adapter = await this.carrierAdapterFactory.getAdapter(detectedCarrier);
      }

      const trackingData = await adapter.track(trackingNumber);
      
      // Save to database
      await this.saveTrackingEvents(trackingData);
      
      return trackingData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Track multiple shipments in batch
   */
  async trackBatchShipments(request: { trackingNumbers: string[]; carrierCode?: string }): Promise<any[]> {
    const results = [];
    
    for (const trackingNumber of request.trackingNumbers) {
      try {
        const result = await this.trackShipment(trackingNumber, request.carrierCode);
        results.push(result);
      } catch (error) {
        results.push({
          trackingNumber,
          error: error.message,
          status: 'error'
        });
      }
    }
    
    return results;
  }

  /**
   * Get tracking history from database
   */
  async getTrackingHistory(trackingNumber: string, carrierCode?: string): Promise<TrackingEvent[]> {
    const whereCondition: any = { trackingNumber };
    if (carrierCode) {
      whereCondition.carrierCode = carrierCode.toUpperCase();
    }

    return this.trackingEventModel
      .find(whereCondition)
      .sort({ eventTimestamp: -1 })
      .exec();
  }

  /**
   * Get latest tracking status
   */
  async getLatestStatus(trackingNumber: string, carrierCode?: string): Promise<TrackingEvent | null> {
    const whereCondition: any = { trackingNumber, isLatest: true };
    if (carrierCode) {
      whereCondition.carrierCode = carrierCode.toUpperCase();
    }

    return this.trackingEventModel
      .findOne(whereCondition)
      .exec();
  }

  /**
   * Store tracking events in database
   */
  private async saveTrackingEvents(trackingResponse: any): Promise<void> {
    try {
      const { trackingNumber, carrierCode, events } = trackingResponse;

      if (!events || events.length === 0) {
        return;
      }

      // Create tracking events
      const trackingEvents = events.map((event: any, index: number) => {
        const trackingEvent = new this.trackingEventModel();
        trackingEvent.trackingNumber = trackingNumber as string;
        trackingEvent.carrierCode = carrierCode as string;
        trackingEvent.status = event.status;
        trackingEvent.description = event.description;
        trackingEvent.eventTimestamp = event.timestamp;
        trackingEvent.externalEventId = event.externalEventId;
        trackingEvent.isLatest = index === 0; // First event is the latest

        if (event.location) {
          trackingEvent.location = event.location;
          trackingEvent.latitude = event.latitude;
          trackingEvent.longitude = event.longitude;
        }

        return trackingEvent;
      });

      // Save all events
      await this.trackingEventModel.insertMany(trackingEvents);

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available carriers
   */
  async getAvailableCarriers(): Promise<any[]> {
    return await this.carrierAdapterFactory.getAvailableCarriersDetailed();
  }

  /**
   * Health check for the tracking service
   */
  async getHealthStatus(): Promise<any> {
    try {
      const carrierHealth = await this.carrierAdapterFactory.healthCheck();
      const overallStatus = Object.values(carrierHealth).some(healthy => healthy) ? 'healthy' : 'unhealthy';

      return {
        status: overallStatus,
        timestamp: new Date(),
        carriers: Object.entries(carrierHealth).map(([code, healthy]) => ({
          carrierCode: code,
          isHealthy: healthy,
          lastChecked: new Date()
        })),
        database: {
          status: 'connected'
        },
        cache: {
          status: 'connected'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message
      };
    }
  }
}
