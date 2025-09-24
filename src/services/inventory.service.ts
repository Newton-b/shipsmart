import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryItem, Warehouse, CreateInventoryItemDto } from '../controllers/inventory.controller';
import { InventoryItemDocument } from '../entities/inventory-item.entity';
import { WarehouseDocument } from '../entities/warehouse.entity';

export interface InventoryFilters {
  search?: string;
  category?: string;
  status?: string;
  warehouse?: string;
  page: number;
  limit: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel('InventoryItem') private inventoryItemModel: Model<InventoryItemDocument>,
    @InjectModel('Warehouse') private warehouseModel: Model<WarehouseDocument>,
  ) {}

  async getInventoryItems(filters: InventoryFilters) {
    const { search, category, status, warehouse, page, limit } = filters;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (warehouse) {
      query['location.warehouse'] = warehouse;
    }

    const [items, total] = await Promise.all([
      this.inventoryItemModel
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.inventoryItemModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    return await this.inventoryItemModel.findById(id).exec();
  }

  async createInventoryItem(createItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const availableQuantity = createItemDto.quantity;
    const totalValue = createItemDto.quantity * createItemDto.unitPrice;
    
    let status = 'in_stock';
    if (createItemDto.quantity === 0) {
      status = 'out_of_stock';
    } else if (createItemDto.quantity < 10) { // Low stock threshold
      status = 'low_stock';
    }

    const item = new this.inventoryItemModel({
      ...createItemDto,
      reservedQuantity: 0,
      availableQuantity,
      totalValue,
      status,
      lastRestocked: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await item.save();
  }

  async updateInventoryItem(id: string, updateItemDto: Partial<CreateInventoryItemDto>): Promise<InventoryItem | null> {
    const updateData: any = { ...updateItemDto, updatedAt: new Date() };
    
    // Recalculate derived fields if quantity or unitPrice changed
    if (updateItemDto.quantity !== undefined || updateItemDto.unitPrice !== undefined) {
      const currentItem = await this.inventoryItemModel.findById(id).exec();
      if (currentItem) {
        const newQuantity = updateItemDto.quantity ?? currentItem.quantity;
        const newUnitPrice = updateItemDto.unitPrice ?? currentItem.unitPrice;
        
        updateData.availableQuantity = newQuantity - currentItem.reservedQuantity;
        updateData.totalValue = newQuantity * newUnitPrice;
        
        // Update status based on new quantity
        if (newQuantity === 0) {
          updateData.status = 'out_of_stock';
        } else if (newQuantity < 10) {
          updateData.status = 'low_stock';
        } else {
          updateData.status = 'in_stock';
        }
      }
    }

    return await this.inventoryItemModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const result = await this.inventoryItemModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getWarehouses(): Promise<Warehouse[]> {
    return await this.warehouseModel.find({ status: 'active' }).exec();
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    return await this.warehouseModel.findById(id).exec();
  }

  async getInventoryAnalytics() {
    // Mock analytics data - in real implementation, this would aggregate from inventory collection
    return {
      totalItems: 1247,
      totalValue: 2847500,
      lowStockItems: 23,
      outOfStockItems: 8,
      categoryBreakdown: [
        { category: 'Electronics', count: 342, value: 1250000 },
        { category: 'Automotive', count: 198, value: 680000 },
        { category: 'Textiles', count: 156, value: 320000 },
        { category: 'Machinery', count: 89, value: 450000 },
        { category: 'Chemicals', count: 67, value: 147500 },
      ],
      warehouseUtilization: [
        { warehouse: 'Main Warehouse LA', utilization: 78, capacity: 10000 },
        { warehouse: 'East Coast Hub NY', utilization: 65, capacity: 8000 },
        { warehouse: 'Midwest Center IL', utilization: 82, capacity: 6000 },
        { warehouse: 'West Coast Hub WA', utilization: 71, capacity: 7500 },
      ],
      monthlyTrends: [
        { month: 'Jan', inbound: 450, outbound: 380, value: 285000 },
        { month: 'Feb', inbound: 520, outbound: 420, value: 315000 },
        { month: 'Mar', inbound: 480, outbound: 510, value: 298000 },
        { month: 'Apr', inbound: 610, outbound: 580, value: 342000 },
        { month: 'May', inbound: 580, outbound: 620, value: 368000 },
        { month: 'Jun', inbound: 650, outbound: 590, value: 385000 },
      ],
      topMovingItems: [
        { sku: 'ELC-001', name: 'Smartphone Components', moves: 156 },
        { sku: 'AUT-045', name: 'Engine Parts', moves: 134 },
        { sku: 'TEX-023', name: 'Cotton Fabric', moves: 98 },
        { sku: 'MAC-012', name: 'Industrial Bearings', moves: 87 },
        { sku: 'CHE-008', name: 'Cleaning Chemicals', moves: 76 },
      ],
    };
  }

  async reserveInventory(id: string, quantity: number, reason?: string): Promise<InventoryItem | null> {
    const item = await this.inventoryItemModel.findById(id).exec();
    if (!item) {
      throw new Error('Inventory item not found');
    }

    if (item.availableQuantity < quantity) {
      throw new Error('Insufficient available quantity');
    }

    const updatedItem = await this.inventoryItemModel
      .findByIdAndUpdate(
        id,
        {
          $inc: { reservedQuantity: quantity, availableQuantity: -quantity },
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    // Log reservation (in real implementation, this would be stored in a reservations collection)
    console.log(`Reserved ${quantity} units of ${item.sku} - Reason: ${reason || 'Not specified'}`);

    return updatedItem;
  }

  async restockInventory(
    id: string,
    restockDto: { quantity: number; unitPrice?: number; supplier?: string }
  ): Promise<InventoryItem | null> {
    const item = await this.inventoryItemModel.findById(id).exec();
    if (!item) {
      throw new Error('Inventory item not found');
    }

    const { quantity, unitPrice, supplier } = restockDto;
    const newTotalQuantity = item.quantity + quantity;
    const newAvailableQuantity = item.availableQuantity + quantity;
    
    // Calculate new average unit price if provided
    let newUnitPrice = item.unitPrice;
    if (unitPrice !== undefined) {
      const totalValue = (item.quantity * item.unitPrice) + (quantity * unitPrice);
      newUnitPrice = totalValue / newTotalQuantity;
    }

    const newTotalValue = newTotalQuantity * newUnitPrice;
    
    // Update status based on new quantity
    let newStatus = 'in_stock';
    if (newTotalQuantity === 0) {
      newStatus = 'out_of_stock';
    } else if (newTotalQuantity < 10) {
      newStatus = 'low_stock';
    }

    const updateData: any = {
      quantity: newTotalQuantity,
      availableQuantity: newAvailableQuantity,
      unitPrice: newUnitPrice,
      totalValue: newTotalValue,
      status: newStatus,
      lastRestocked: new Date(),
      updatedAt: new Date(),
    };

    if (supplier) {
      updateData.supplier = supplier;
    }

    const updatedItem = await this.inventoryItemModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    // Log restock (in real implementation, this would be stored in a stock movements collection)
    console.log(`Restocked ${quantity} units of ${item.sku} from ${supplier || item.supplier}`);

    return updatedItem;
  }

  async getCategories(): Promise<string[]> {
    return await this.inventoryItemModel.distinct('category').exec();
  }

  async getLowStockItems(threshold: number = 10): Promise<InventoryItem[]> {
    return await this.inventoryItemModel
      .find({ availableQuantity: { $lt: threshold }, status: { $ne: 'discontinued' } })
      .sort({ availableQuantity: 1 })
      .exec();
  }

  async getExpiringItems(days: number = 30): Promise<InventoryItem[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return await this.inventoryItemModel
      .find({
        expiryDate: { $exists: true, $lte: expiryDate },
        status: { $ne: 'discontinued' }
      })
      .sort({ expiryDate: 1 })
      .exec();
  }
}
