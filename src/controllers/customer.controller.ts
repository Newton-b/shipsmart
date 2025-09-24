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
import { CustomerService } from '../services/customer.service';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'pending';
  type: 'shipper' | 'consignee' | 'both';
  creditLimit: number;
  paymentTerms: string;
  preferredServices: string[];
  totalShipments: number;
  totalValue: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  type: 'shipper' | 'consignee' | 'both';
  creditLimit?: number;
  paymentTerms?: string;
  preferredServices?: string[];
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  status?: 'active' | 'inactive' | 'pending';
}

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers with optional filtering' })
  @ApiQuery({ name: 'search', description: 'Search by name, email, or company', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false })
  @ApiQuery({ name: 'type', description: 'Filter by customer type', required: false })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  async getCustomers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      
      return await this.customerService.getCustomers({
        search,
        status,
        type,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve customers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomer(@Param('id') id: string): Promise<Customer> {
    try {
      const customer = await this.customerService.getCustomerById(id);
      if (!customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return customer;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to retrieve customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Customer name' },
        email: { type: 'string', description: 'Customer email' },
        phone: { type: 'string', description: 'Customer phone' },
        company: { type: 'string', description: 'Company name' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zipCode: { type: 'string' },
            country: { type: 'string' },
          },
        },
        type: { type: 'string', enum: ['shipper', 'consignee', 'both'] },
        creditLimit: { type: 'number', description: 'Credit limit in USD' },
        paymentTerms: { type: 'string', description: 'Payment terms' },
        preferredServices: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'email', 'phone', 'company', 'address', 'type'],
    },
  })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      this.validateCustomerData(createCustomerDto);
      return await this.customerService.createCustomer(createCustomerDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create customer',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    try {
      const customer = await this.customerService.updateCustomer(id, updateCustomerDto);
      if (!customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return customer;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async deleteCustomer(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.customerService.deleteCustomer(id);
      if (!deleted) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Customer deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/shipments')
  @ApiOperation({ summary: 'Get customer shipment history' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiResponse({ status: 200, description: 'Customer shipments retrieved successfully' })
  async getCustomerShipments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      
      return await this.customerService.getCustomerShipments(id, pageNum, limitNum);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve customer shipments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get customer analytics and statistics' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 200, description: 'Customer analytics retrieved successfully' })
  async getCustomerAnalytics(@Param('id') id: string) {
    try {
      return await this.customerService.getCustomerAnalytics(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve customer analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateCustomerData(data: CreateCustomerDto): void {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Name is required');
    if (!data.email?.trim()) errors.push('Email is required');
    if (!data.phone?.trim()) errors.push('Phone is required');
    if (!data.company?.trim()) errors.push('Company is required');
    if (!data.address) errors.push('Address is required');
    if (!data.type) errors.push('Customer type is required');

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.address) {
      if (!data.address.street?.trim()) errors.push('Street address is required');
      if (!data.address.city?.trim()) errors.push('City is required');
      if (!data.address.state?.trim()) errors.push('State is required');
      if (!data.address.zipCode?.trim()) errors.push('Zip code is required');
      if (!data.address.country?.trim()) errors.push('Country is required');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}
