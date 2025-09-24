import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Observable, interval, map } from 'rxjs';
import { TrackingService } from '../services/tracking.service';

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('track')
  @ApiOperation({ summary: 'Track a single shipment' })
  @ApiQuery({ name: 'trackingNumber', description: 'Tracking number to search for' })
  @ApiQuery({ name: 'carrierCode', description: 'Carrier code (optional)', required: false })
  @ApiResponse({ status: 200, description: 'Tracking information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tracking number not found' })
  async trackShipment(
    @Query('trackingNumber') trackingNumber: string,
    @Query('carrierCode') carrierCode?: string,
  ) {
    if (!trackingNumber) {
      throw new HttpException('Tracking number is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.trackingService.trackShipment(trackingNumber, carrierCode);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to track shipment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('batch')
  @ApiOperation({ summary: 'Track multiple shipments in batch' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        trackingNumbers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tracking numbers',
        },
        carrierCode: {
          type: 'string',
          description: 'Optional carrier code for all tracking numbers',
        },
      },
      required: ['trackingNumbers'],
    },
  })
  @ApiResponse({ status: 200, description: 'Batch tracking completed' })
  async trackBatchShipments(
    @Body() batchRequest: { trackingNumbers: string[]; carrierCode?: string },
  ) {
    const { trackingNumbers, carrierCode } = batchRequest;

    if (!trackingNumbers || !Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
      throw new HttpException('Tracking numbers array is required', HttpStatus.BAD_REQUEST);
    }

    if (trackingNumbers.length > 50) {
      throw new HttpException('Maximum 50 tracking numbers allowed per batch', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.trackingService.trackBatchShipments({ trackingNumbers, carrierCode });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to process batch tracking',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('carriers')
  @ApiOperation({ summary: 'Get available carriers' })
  @ApiResponse({ status: 200, description: 'Available carriers retrieved successfully' })
  async getAvailableCarriers() {
    try {
      return await this.trackingService.getAvailableCarriers();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve carriers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Sse('events/:trackingNumber')
  @ApiOperation({ summary: 'Server-Sent Events for real-time tracking updates' })
  @ApiResponse({ status: 200, description: 'SSE stream established' })
  trackingEvents(
    @Param('trackingNumber') trackingNumber: string,
    @Query('carrierCode') carrierCode?: string,
  ): Observable<any> {
    return interval(10000).pipe(
      map(async () => {
        try {
          const trackingData = await this.trackingService.trackShipment(trackingNumber, carrierCode);
          return {
            data: JSON.stringify({
              type: 'tracking_update',
              trackingNumber,
              carrierCode: trackingData.carrierCode,
              data: trackingData,
              timestamp: new Date().toISOString(),
            }),
          };
        } catch (error) {
          return {
            data: JSON.stringify({
              type: 'error',
              trackingNumber,
              error: error.message,
              timestamp: new Date().toISOString(),
            }),
          };
        }
      }),
    );
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async getHealthStatus() {
    try {
      return await this.trackingService.getHealthStatus();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get health status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
