import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { CarriersService, ShippingAddress, Package } from './carriers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Carriers')
@Controller('carriers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Get('supported')
  @ApiOperation({ summary: 'Get list of supported carriers' })
  @ApiResponse({
    status: 200,
    description: 'List of supported carriers',
  })
  getSupportedCarriers() {
    return {
      carriers: this.carriersService.getSupportedCarriers(),
    };
  }

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Track a shipment' })
  @ApiQuery({ name: 'carrier', required: false, description: 'Specific carrier to use for tracking' })
  @ApiResponse({
    status: 200,
    description: 'Tracking information retrieved successfully',
  })
  async trackShipment(
    @Param('trackingNumber') trackingNumber: string,
    @Query('carrier') carrier?: string,
  ) {
    return this.carriersService.trackShipment(trackingNumber, carrier);
  }

  @Post('rates')
  @ApiOperation({ summary: 'Get shipping rates from multiple carriers' })
  @ApiResponse({
    status: 200,
    description: 'Shipping rates retrieved successfully',
  })
  async getRates(
    @Body() rateRequest: {
      origin: ShippingAddress;
      destination: ShippingAddress;
      packages: Package[];
      carriers?: string[];
    },
  ) {
    return this.carriersService.getRates(
      rateRequest.origin,
      rateRequest.destination,
      rateRequest.packages,
      rateRequest.carriers,
    );
  }

  @Post('shipments')
  @ApiOperation({ summary: 'Create a new shipment with a carrier' })
  @ApiResponse({
    status: 201,
    description: 'Shipment created successfully',
  })
  async createShipment(
    @Body() shipmentRequest: {
      carrier: string;
      origin: ShippingAddress;
      destination: ShippingAddress;
      packages: Package[];
      service: string;
      options?: any;
    },
  ) {
    return this.carriersService.createShipment(
      shipmentRequest.carrier,
      shipmentRequest.origin,
      shipmentRequest.destination,
      shipmentRequest.packages,
      shipmentRequest.service,
      shipmentRequest.options,
    );
  }

  @Post('validate-address')
  @ApiOperation({ summary: 'Validate a shipping address' })
  @ApiResponse({
    status: 200,
    description: 'Address validation completed',
  })
  async validateAddress(
    @Body() validationRequest: {
      address: ShippingAddress;
      carrier?: string;
    },
  ) {
    return this.carriersService.validateAddress(
      validationRequest.address,
      validationRequest.carrier,
    );
  }
}
