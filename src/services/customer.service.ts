import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '../controllers/customer.controller';
import { CustomerDocument } from '../entities/customer.entity';

export interface CustomerFilters {
  search?: string;
  status?: string;
  type?: string;
  page: number;
  limit: number;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<CustomerDocument>,
  ) {}

  async getCustomers(filters: CustomerFilters) {
    const { search, status, type, page, limit } = filters;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    const [customers, total] = await Promise.all([
      this.customerModel
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.customerModel.countDocuments(query).exec(),
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return await this.customerModel.findById(id).exec();
  }

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = new this.customerModel({
      ...createCustomerDto,
      status: 'active',
      totalShipments: 0,
      totalValue: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await customer.save();
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer | null> {
    return await this.customerModel
      .findByIdAndUpdate(
        id,
        { ...updateCustomerDto, updatedAt: new Date() },
        { new: true }
      )
      .exec();
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await this.customerModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getCustomerShipments(customerId: string, page: number, limit: number) {
    // Mock shipment data - in real implementation, this would query shipments collection
    const mockShipments = [
      {
        id: '1',
        trackingNumber: 'SS123456789',
        origin: 'Los Angeles, CA',
        destination: 'Shanghai, China',
        service: 'Ocean Freight',
        status: 'In Transit',
        cost: 2450.00,
        createdAt: new Date('2024-01-15'),
        estimatedDelivery: new Date('2024-02-15'),
      },
      {
        id: '2',
        trackingNumber: 'SS987654321',
        origin: 'New York, NY',
        destination: 'Hamburg, Germany',
        service: 'Air Freight',
        status: 'Delivered',
        cost: 3200.00,
        createdAt: new Date('2024-01-10'),
        estimatedDelivery: new Date('2024-01-12'),
      },
    ];

    const skip = (page - 1) * limit;
    const shipments = mockShipments.slice(skip, skip + limit);
    const total = mockShipments.length;

    return {
      shipments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerAnalytics(customerId: string) {
    // Mock analytics data - in real implementation, this would aggregate from shipments
    return {
      totalShipments: 156,
      totalValue: 485000,
      averageShipmentValue: 3109,
      preferredServices: [
        { service: 'Ocean Freight', percentage: 65 },
        { service: 'Air Freight', percentage: 25 },
        { service: 'Ground Transportation', percentage: 10 },
      ],
      monthlyTrends: [
        { month: 'Jan', shipments: 12, value: 38500 },
        { month: 'Feb', shipments: 15, value: 42000 },
        { month: 'Mar', shipments: 18, value: 55000 },
        { month: 'Apr', shipments: 14, value: 41000 },
        { month: 'May', shipments: 16, value: 48000 },
        { month: 'Jun', shipments: 20, value: 62000 },
      ],
      topDestinations: [
        { destination: 'Shanghai, China', count: 45 },
        { destination: 'Hamburg, Germany', count: 32 },
        { destination: 'Rotterdam, Netherlands', count: 28 },
        { destination: 'Singapore', count: 25 },
        { destination: 'Tokyo, Japan', count: 18 },
      ],
      performanceMetrics: {
        onTimeDelivery: 94.5,
        customerSatisfaction: 4.7,
        averageTransitTime: 12.5,
        claimsRate: 0.8,
      },
    };
  }

  async updateCustomerActivity(customerId: string) {
    await this.customerModel
      .findByIdAndUpdate(customerId, { lastActivity: new Date() })
      .exec();
  }

  async incrementCustomerShipments(customerId: string, shipmentValue: number) {
    await this.customerModel
      .findByIdAndUpdate(customerId, {
        $inc: { totalShipments: 1, totalValue: shipmentValue },
        lastActivity: new Date(),
      })
      .exec();
  }
}
