import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ShippingRateService } from '../services/shipping-rate.service';

export interface ShippingRateRequest {
  origin: string;
  destination: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  serviceType: 'all' | 'ocean' | 'air' | 'ground';
  packageType: string;
  commodity: string;
  value: number;
  insurance: boolean;
  urgency: 'standard' | 'express' | 'urgent' | 'critical';
  incoterms: 'EXW' | 'FOB' | 'CIF' | 'DDP';
}

export interface ShippingRateResponse {
  id: number;
  service: string;
  carrier: string;
  transitDays: number;
  cost: number;
  currency: string;
  reliability: number;
  features: string[];
  co2Savings: string;
  carbonFootprint: number;
  breakdown: {
    baseCost: number;
    fuelSurcharge: number;
    securityFee: number;
    customsFee: number;
    insurance: number;
  };
}

@ApiTags('shipping-rates')
@Controller('shipping-rates')
export class ShippingRateController {
  constructor(private readonly shippingRateService: ShippingRateService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate shipping rates for a shipment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Origin location' },
        destination: { type: 'string', description: 'Destination location' },
        weight: { type: 'number', description: 'Weight in pounds' },
        length: { type: 'number', description: 'Length in inches' },
        width: { type: 'number', description: 'Width in inches' },
        height: { type: 'number', description: 'Height in inches' },
        serviceType: { type: 'string', enum: ['all', 'ocean', 'air', 'ground'] },
        packageType: { type: 'string', description: 'Package type' },
        commodity: { type: 'string', description: 'Commodity description' },
        value: { type: 'number', description: 'Cargo value in USD' },
        insurance: { type: 'boolean', description: 'Include insurance' },
        urgency: { type: 'string', enum: ['standard', 'express', 'urgent', 'critical'] },
        incoterms: { type: 'string', enum: ['EXW', 'FOB', 'CIF', 'DDP'] },
      },
      required: ['origin', 'destination', 'weight', 'length', 'width', 'height', 'commodity', 'value'],
    },
  })
  @ApiResponse({ status: 200, description: 'Shipping rates calculated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async calculateRates(@Body() request: ShippingRateRequest): Promise<ShippingRateResponse[]> {
    try {
      this.validateRequest(request);
      return await this.shippingRateService.calculateRates(request);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to calculate shipping rates',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Get refreshed rates with market fluctuations' })
  @ApiQuery({ name: 'rateIds', description: 'Comma-separated rate IDs to refresh' })
  @ApiResponse({ status: 200, description: 'Refreshed rates retrieved successfully' })
  async refreshRates(@Query('rateIds') rateIds: string): Promise<ShippingRateResponse[]> {
    try {
      const ids = rateIds.split(',').map(id => parseInt(id.trim()));
      return await this.shippingRateService.refreshRates(ids);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to refresh rates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('locations')
  @ApiOperation({ summary: 'Get location suggestions for autocomplete' })
  @ApiQuery({ name: 'query', description: 'Search query for locations' })
  @ApiResponse({ status: 200, description: 'Location suggestions retrieved successfully' })
  async getLocationSuggestions(@Query('query') query: string): Promise<string[]> {
    try {
      return await this.shippingRateService.getLocationSuggestions(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get location suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('package-types')
  @ApiOperation({ summary: 'Get available package types with descriptions' })
  @ApiResponse({ status: 200, description: 'Package types retrieved successfully' })
  async getPackageTypes() {
    try {
      return await this.shippingRateService.getPackageTypes();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get package types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateRequest(request: ShippingRateRequest): void {
    const errors: string[] = [];

    if (!request.origin?.trim()) errors.push('Origin is required');
    if (!request.destination?.trim()) errors.push('Destination is required');
    if (!request.weight || request.weight <= 0) errors.push('Valid weight is required');
    if (!request.length || request.length <= 0) errors.push('Valid length is required');
    if (!request.width || request.width <= 0) errors.push('Valid width is required');
    if (!request.height || request.height <= 0) errors.push('Valid height is required');
    if (!request.commodity?.trim()) errors.push('Commodity description is required');
    if (!request.value || request.value <= 0) errors.push('Cargo value is required');

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}
