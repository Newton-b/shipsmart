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
import { InventoryService } from '../services/inventory.service';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unitPrice: number;
  totalValue: number;
  location: {
    warehouse: string;
    zone: string;
    aisle: string;
    shelf: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  supplier: string;
  lastRestocked: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  capacity: number;
  utilization: number;
  zones: string[];
  manager: string;
  contact: {
    phone: string;
    email: string;
  };
  operatingHours: {
    open: string;
    close: string;
    timezone: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryItemDto {
  sku: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  location: {
    warehouse: string;
    zone: string;
    aisle: string;
    shelf: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  supplier: string;
  expiryDate?: Date;
}

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('items')
  @ApiOperation({ summary: 'Get all inventory items with filtering' })
  @ApiQuery({ name: 'search', description: 'Search by SKU, name, or description', required: false })
  @ApiQuery({ name: 'category', description: 'Filter by category', required: false })
  @ApiQuery({ name: 'status', description: 'Filter by status', required: false })
  @ApiQuery({ name: 'warehouse', description: 'Filter by warehouse', required: false })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false })
  @ApiResponse({ status: 200, description: 'Inventory items retrieved successfully' })
  async getInventoryItems(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('warehouse') warehouse?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      
      return await this.inventoryService.getInventoryItems({
        search,
        category,
        status,
        warehouse,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve inventory items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({ status: 200, description: 'Inventory item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  async getInventoryItem(@Param('id') id: string): Promise<InventoryItem> {
    try {
      const item = await this.inventoryService.getInventoryItemById(id);
      if (!item) {
        throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
      }
      return item;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to retrieve inventory item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('items')
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({ status: 201, description: 'Inventory item created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async createInventoryItem(@Body() createItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    try {
      this.validateInventoryItemData(createItemDto);
      return await this.inventoryService.createInventoryItem(createItemDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create inventory item',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({ status: 200, description: 'Inventory item updated successfully' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  async updateInventoryItem(
    @Param('id') id: string,
    @Body() updateItemDto: Partial<CreateInventoryItemDto>,
  ): Promise<InventoryItem> {
    try {
      const item = await this.inventoryService.updateInventoryItem(id, updateItemDto);
      if (!item) {
        throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
      }
      return item;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to update inventory item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete inventory item by ID' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiResponse({ status: 200, description: 'Inventory item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  async deleteInventoryItem(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.inventoryService.deleteInventoryItem(id);
      if (!deleted) {
        throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Inventory item deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to delete inventory item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('warehouses')
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiResponse({ status: 200, description: 'Warehouses retrieved successfully' })
  async getWarehouses(): Promise<Warehouse[]> {
    try {
      return await this.inventoryService.getWarehouses();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve warehouses',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('warehouses/:id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiResponse({ status: 200, description: 'Warehouse retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async getWarehouse(@Param('id') id: string): Promise<Warehouse> {
    try {
      const warehouse = await this.inventoryService.getWarehouseById(id);
      if (!warehouse) {
        throw new HttpException('Warehouse not found', HttpStatus.NOT_FOUND);
      }
      return warehouse;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Failed to retrieve warehouse',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get inventory analytics and statistics' })
  @ApiResponse({ status: 200, description: 'Inventory analytics retrieved successfully' })
  async getInventoryAnalytics() {
    try {
      return await this.inventoryService.getInventoryAnalytics();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve inventory analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('items/:id/reserve')
  @ApiOperation({ summary: 'Reserve inventory quantity' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', description: 'Quantity to reserve' },
        reason: { type: 'string', description: 'Reason for reservation' },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({ status: 200, description: 'Inventory reserved successfully' })
  async reserveInventory(
    @Param('id') id: string,
    @Body() reservationDto: { quantity: number; reason?: string },
  ) {
    try {
      return await this.inventoryService.reserveInventory(id, reservationDto.quantity, reservationDto.reason);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to reserve inventory',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('items/:id/restock')
  @ApiOperation({ summary: 'Restock inventory item' })
  @ApiParam({ name: 'id', description: 'Inventory item ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', description: 'Quantity to add' },
        unitPrice: { type: 'number', description: 'Unit price for new stock' },
        supplier: { type: 'string', description: 'Supplier name' },
      },
      required: ['quantity'],
    },
  })
  @ApiResponse({ status: 200, description: 'Inventory restocked successfully' })
  async restockInventory(
    @Param('id') id: string,
    @Body() restockDto: { quantity: number; unitPrice?: number; supplier?: string },
  ) {
    try {
      return await this.inventoryService.restockInventory(id, restockDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to restock inventory',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validateInventoryItemData(data: CreateInventoryItemDto): void {
    const errors: string[] = [];

    if (!data.sku?.trim()) errors.push('SKU is required');
    if (!data.name?.trim()) errors.push('Name is required');
    if (!data.category?.trim()) errors.push('Category is required');
    if (!data.quantity || data.quantity < 0) errors.push('Valid quantity is required');
    if (!data.unitPrice || data.unitPrice < 0) errors.push('Valid unit price is required');
    if (!data.supplier?.trim()) errors.push('Supplier is required');

    if (!data.location) {
      errors.push('Location is required');
    } else {
      if (!data.location.warehouse?.trim()) errors.push('Warehouse is required');
      if (!data.location.zone?.trim()) errors.push('Zone is required');
      if (!data.location.aisle?.trim()) errors.push('Aisle is required');
      if (!data.location.shelf?.trim()) errors.push('Shelf is required');
    }

    if (!data.dimensions) {
      errors.push('Dimensions are required');
    } else {
      if (!data.dimensions.length || data.dimensions.length <= 0) errors.push('Valid length is required');
      if (!data.dimensions.width || data.dimensions.width <= 0) errors.push('Valid width is required');
      if (!data.dimensions.height || data.dimensions.height <= 0) errors.push('Valid height is required');
      if (!data.dimensions.weight || data.dimensions.weight <= 0) errors.push('Valid weight is required');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
}
