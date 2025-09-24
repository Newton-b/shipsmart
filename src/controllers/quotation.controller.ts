import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { QuotationService } from '../services/quotation.service';

export interface QuoteRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  company: string;
  origin: string;
  destination: string;
  serviceType: 'ocean' | 'air' | 'ground';
  packageType: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  commodity: string;
  value: number;
  urgency: 'standard' | 'express' | 'urgent' | 'critical';
  incoterms: 'EXW' | 'FOB' | 'CIF' | 'DDP';
  additionalServices: string[];
  specialRequirements: string;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  quotedPrice?: number;
  validUntil?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PricingRule {
  id: string;
  name: string;
  description: string;
  serviceType: 'ocean' | 'air' | 'ground' | 'all';
  ruleType: 'base_rate' | 'surcharge' | 'discount' | 'minimum';
  conditions: {
    minWeight?: number;
    maxWeight?: number;
    origins?: string[];
    destinations?: string[];
    commodities?: string[];
    customerTypes?: string[];
  };
  calculation: {
    type: 'fixed' | 'percentage' | 'per_kg' | 'per_cbm';
    value: number;
    currency: string;
  };
  priority: number;
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuoteRequestDto {
  customerName: string;
  customerEmail: string;
  company: string;
  origin: string;
  destination: string;
  serviceType: 'ocean' | 'air' | 'ground';
  packageType: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  commodity: string;
  value: number;
  urgency: 'standard' | 'express' | 'urgent' | 'critical';
  incoterms: 'EXW' | 'FOB' | 'CIF' | 'DDP';
  additionalServices?: string[];
  specialRequirements?: string;
  notes?: string;
}

@ApiTags('quotations')
@Controller('quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Get('requests')
  @ApiOperation({ summary: 'Get all quote requests with filtering' })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false })
  @ApiQuery({ name: 'serviceType', description: 'Filter by service type', required: false })
  @ApiQuery({ name: 'customerName', description: 'Filter by customer name', required: false })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiResponse({ status: 200, description: 'Quote requests retrieved successfully' })
  async getQuoteRequests(
    @Query('status') status?: string,
    @Query('serviceType') serviceType?: string,
    @Query('customerName') customerName?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      
      return await this.quotationService.getQuoteRequests({
        status,
        serviceType,
        customerName,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve quote requests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get quote request by ID' })
  @ApiParam({ name: 'id', description: 'Quote request ID' })
  @ApiResponse({ status: 200, description: 'Quote request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quote request not found' })
  async getQuoteRequest(@Param('id') id: string): Promise<QuoteRequest> {
    try {
      const quote = await this.quotationService.getQuoteRequestById(id);
      if (!quote) {
        throw new HttpException('Quote request not found', HttpStatus.NOT_FOUND);
      }
      return quote;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to retrieve quote request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('requests')
  @ApiOperation({ summary: 'Create a new quote request' })
  @ApiResponse({ status: 201, description: 'Quote request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createQuoteRequest(@Body() createQuoteDto: CreateQuoteRequestDto): Promise<QuoteRequest> {
    try {
      this.validateQuoteRequestData(createQuoteDto);
      return await this.quotationService.createQuoteRequest(createQuoteDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create quote request',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('requests/:id/quote')
  @ApiOperation({ summary: 'Provide quote for a request' })
  @ApiParam({ name: 'id', description: 'Quote request ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quotedPrice: { type: 'number', description: 'Quoted price' },
        validUntil: { type: 'string', format: 'date', description: 'Quote validity date' },
        notes: { type: 'string', description: 'Additional notes' },
      },
      required: ['quotedPrice', 'validUntil'],
    },
  })
  @ApiResponse({ status: 200, description: 'Quote provided successfully' })
  async provideQuote(
    @Param('id') id: string,
    @Body() quoteDto: { quotedPrice: number; validUntil: Date; notes?: string },
  ): Promise<QuoteRequest> {
    try {
      return await this.quotationService.provideQuote(id, quoteDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to provide quote',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('requests/:id/status')
  @ApiOperation({ summary: 'Update quote request status' })
  @ApiParam({ name: 'id', description: 'Quote request ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'quoted', 'accepted', 'rejected', 'expired'] },
        notes: { type: 'string', description: 'Status change notes' },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Quote status updated successfully' })
  async updateQuoteStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: string; notes?: string },
  ): Promise<QuoteRequest> {
    try {
      return await this.quotationService.updateQuoteStatus(id, statusDto.status, statusDto.notes);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update quote status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('pricing-rules')
  @ApiOperation({ summary: 'Get all pricing rules' })
  @ApiQuery({ name: 'serviceType', description: 'Filter by service type', required: false })
  @ApiQuery({ name: 'isActive', description: 'Filter by active status', required: false })
  @ApiResponse({ status: 200, description: 'Pricing rules retrieved successfully' })
  async getPricingRules(
    @Query('serviceType') serviceType?: string,
    @Query('isActive') isActive?: string,
  ): Promise<PricingRule[]> {
    try {
      return await this.quotationService.getPricingRules({
        serviceType,
        isActive: isActive === 'true',
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve pricing rules',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('pricing-rules')
  @ApiOperation({ summary: 'Create a new pricing rule' })
  @ApiResponse({ status: 201, description: 'Pricing rule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createPricingRule(@Body() createRuleDto: Partial<PricingRule>): Promise<PricingRule> {
    try {
      return await this.quotationService.createPricingRule(createRuleDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create pricing rule',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('pricing-rules/:id')
  @ApiOperation({ summary: 'Update pricing rule by ID' })
  @ApiParam({ name: 'id', description: 'Pricing rule ID' })
  @ApiResponse({ status: 200, description: 'Pricing rule updated successfully' })
  async updatePricingRule(
    @Param('id') id: string,
    @Body() updateRuleDto: Partial<PricingRule>,
  ): Promise<PricingRule> {
    try {
      const rule = await this.quotationService.updatePricingRule(id, updateRuleDto);
      if (!rule) {
        throw new HttpException('Pricing rule not found', HttpStatus.NOT_FOUND);
      }
      return rule;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update pricing rule',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('pricing-rules/:id')
  @ApiOperation({ summary: 'Delete pricing rule by ID' })
  @ApiParam({ name: 'id', description: 'Pricing rule ID' })
  @ApiResponse({ status: 200, description: 'Pricing rule deleted successfully' })
  async deletePricingRule(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.quotationService.deletePricingRule(id);
      if (!deleted) {
        throw new HttpException('Pricing rule not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Pricing rule deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete pricing rule',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate price using pricing rules' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        serviceType: { type: 'string', enum: ['ocean', 'air', 'ground'] },
        weight: { type: 'number' },
        volume: { type: 'number' },
        origin: { type: 'string' },
        destination: { type: 'string' },
        commodity: { type: 'string' },
        customerType: { type: 'string' },
      },
      required: ['serviceType', 'weight', 'origin', 'destination'],
    },
  })
  @ApiResponse({ status: 200, description: 'Price calculated successfully' })
  async calculatePrice(@Body() calculationDto: any) {
    try {
      return await this.quotationService.calculatePrice(calculationDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to calculate price',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get quotation analytics and statistics' })
  @ApiResponse({ status: 200, description: 'Quotation analytics retrieved successfully' })
  async getQuotationAnalytics() {
    try {
      return await this.quotationService.getQuotationAnalytics();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve quotation analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateQuoteRequestData(data: CreateQuoteRequestDto): void {
    const errors: string[] = [];

    if (!data.customerName?.trim()) errors.push('Customer name is required');
    if (!data.customerEmail?.trim()) errors.push('Customer email is required');
    if (!data.company?.trim()) errors.push('Company is required');
    if (!data.origin?.trim()) errors.push('Origin is required');
    if (!data.destination?.trim()) errors.push('Destination is required');
    if (!data.serviceType) errors.push('Service type is required');
    if (!data.packageType?.trim()) errors.push('Package type is required');
    if (!data.weight || data.weight <= 0) errors.push('Valid weight is required');
    if (!data.commodity?.trim()) errors.push('Commodity is required');
    if (!data.value || data.value <= 0) errors.push('Cargo value is required');

    if (data.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
      errors.push('Invalid email format');
    }

    if (!data.dimensions) {
      errors.push('Dimensions are required');
    } else {
      if (!data.dimensions.length || data.dimensions.length <= 0) errors.push('Valid length is required');
      if (!data.dimensions.width || data.dimensions.width <= 0) errors.push('Valid width is required');
      if (!data.dimensions.height || data.dimensions.height <= 0) errors.push('Valid height is required');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}
