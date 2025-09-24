import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuoteRequest, PricingRule, CreateQuoteRequestDto } from '../controllers/quotation.controller';
import { QuoteRequestDocument } from '../entities/quote-request.entity';
import { PricingRuleDocument } from '../entities/pricing-rule.entity';

export interface QuoteFilters {
  status?: string;
  serviceType?: string;
  customerName?: string;
  page: number;
  limit: number;
}

export interface PricingRuleFilters {
  serviceType?: string;
  isActive?: boolean;
}

@Injectable()
export class QuotationService {
  constructor(
    @InjectModel('QuoteRequest') private quoteRequestModel: Model<QuoteRequestDocument>,
    @InjectModel('PricingRule') private pricingRuleModel: Model<PricingRuleDocument>,
  ) {}

  async getQuoteRequests(filters: QuoteFilters) {
    const { status, serviceType, customerName, page, limit } = filters;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (serviceType) {
      query.serviceType = serviceType;
    }
    
    if (customerName) {
      query.customerName = { $regex: customerName, $options: 'i' };
    }

    const [quotes, total] = await Promise.all([
      this.quoteRequestModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.quoteRequestModel.countDocuments(query).exec(),
    ]);

    return {
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getQuoteRequestById(id: string): Promise<QuoteRequest | null> {
    return await this.quoteRequestModel.findById(id).exec();
  }

  async createQuoteRequest(createQuoteDto: CreateQuoteRequestDto): Promise<QuoteRequest> {
    const quote = new this.quoteRequestModel({
      ...createQuoteDto,
      status: 'pending',
      additionalServices: createQuoteDto.additionalServices || [],
      specialRequirements: createQuoteDto.specialRequirements || '',
      notes: createQuoteDto.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await quote.save();
  }

  async provideQuote(
    id: string,
    quoteDto: { quotedPrice: number; validUntil: Date; notes?: string }
  ): Promise<QuoteRequest> {
    const updatedQuote = await this.quoteRequestModel
      .findByIdAndUpdate(
        id,
        {
          status: 'quoted',
          quotedPrice: quoteDto.quotedPrice,
          validUntil: quoteDto.validUntil,
          notes: quoteDto.notes || '',
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!updatedQuote) {
      throw new Error('Quote request not found');
    }

    return updatedQuote;
  }

  async updateQuoteStatus(id: string, status: string, notes?: string): Promise<QuoteRequest> {
    const updatedQuote = await this.quoteRequestModel
      .findByIdAndUpdate(
        id,
        {
          status,
          notes: notes || '',
          updatedAt: new Date(),
        },
        { new: true }
      )
      .exec();

    if (!updatedQuote) {
      throw new Error('Quote request not found');
    }

    return updatedQuote;
  }

  async getPricingRules(filters: PricingRuleFilters): Promise<PricingRule[]> {
    const query: any = {};
    
    if (filters.serviceType) {
      query.$or = [
        { serviceType: filters.serviceType },
        { serviceType: 'all' }
      ];
    }
    
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    return await this.pricingRuleModel
      .find(query)
      .sort({ priority: -1, createdAt: -1 })
      .exec();
  }

  async createPricingRule(createRuleDto: Partial<PricingRule>): Promise<PricingRule> {
    const rule = new this.pricingRuleModel({
      ...createRuleDto,
      isActive: createRuleDto.isActive !== false,
      priority: createRuleDto.priority || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await rule.save();
  }

  async updatePricingRule(id: string, updateRuleDto: Partial<PricingRule>): Promise<PricingRule | null> {
    return await this.pricingRuleModel
      .findByIdAndUpdate(
        id,
        { ...updateRuleDto, updatedAt: new Date() },
        { new: true }
      )
      .exec();
  }

  async deletePricingRule(id: string): Promise<boolean> {
    const result = await this.pricingRuleModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async calculatePrice(calculationDto: {
    serviceType: string;
    weight: number;
    volume?: number;
    origin: string;
    destination: string;
    commodity?: string;
    customerType?: string;
  }) {
    const { serviceType, weight, volume, origin, destination, commodity, customerType } = calculationDto;

    // Get applicable pricing rules
    const rules = await this.getPricingRules({ serviceType, isActive: true });

    let basePrice = 0;
    let surcharges = 0;
    let discounts = 0;
    let appliedRules: any[] = [];

    // Apply pricing rules in priority order
    for (const rule of rules) {
      const isApplicable = this.isRuleApplicable(rule, {
        weight,
        volume,
        origin,
        destination,
        commodity,
        customerType,
      });

      if (isApplicable) {
        const ruleAmount = this.calculateRuleAmount(rule, weight, volume);
        
        switch (rule.ruleType) {
          case 'base_rate':
            basePrice += ruleAmount;
            break;
          case 'surcharge':
            surcharges += ruleAmount;
            break;
          case 'discount':
            discounts += ruleAmount;
            break;
          case 'minimum':
            basePrice = Math.max(basePrice, ruleAmount);
            break;
        }

        appliedRules.push({
          name: rule.name,
          type: rule.ruleType,
          amount: ruleAmount,
        });
      }
    }

    const totalPrice = Math.max(0, basePrice + surcharges - discounts);

    return {
      basePrice,
      surcharges,
      discounts,
      totalPrice,
      appliedRules,
      breakdown: {
        baseRate: basePrice,
        totalSurcharges: surcharges,
        totalDiscounts: discounts,
        finalPrice: totalPrice,
      },
    };
  }

  async getQuotationAnalytics() {
    // Mock analytics data - in real implementation, this would aggregate from quotes collection
    return {
      totalQuotes: 342,
      pendingQuotes: 45,
      quotedRequests: 78,
      acceptedQuotes: 156,
      rejectedQuotes: 32,
      expiredQuotes: 31,
      conversionRate: 65.8, // percentage of quotes that get accepted
      averageQuoteValue: 4250,
      totalQuoteValue: 1453500,
      serviceTypeBreakdown: [
        { serviceType: 'Ocean Freight', count: 198, percentage: 57.9 },
        { serviceType: 'Air Freight', count: 89, percentage: 26.0 },
        { serviceType: 'Ground Transportation', count: 55, percentage: 16.1 },
      ],
      monthlyTrends: [
        { month: 'Jan', quotes: 28, accepted: 18, value: 125000 },
        { month: 'Feb', quotes: 32, accepted: 21, value: 142000 },
        { month: 'Mar', quotes: 35, accepted: 23, value: 158000 },
        { month: 'Apr', quotes: 29, accepted: 19, value: 135000 },
        { month: 'May', quotes: 38, accepted: 25, value: 175000 },
        { month: 'Jun', quotes: 42, accepted: 28, value: 195000 },
      ],
      topCustomers: [
        { company: 'Global Trade Corp', quotes: 23, accepted: 18, value: 285000 },
        { company: 'International Logistics', quotes: 19, accepted: 15, value: 245000 },
        { company: 'Pacific Shipping Co', quotes: 16, accepted: 12, value: 198000 },
        { company: 'Atlantic Freight', quotes: 14, accepted: 11, value: 165000 },
        { company: 'Continental Express', quotes: 12, accepted: 9, value: 142000 },
      ],
      averageResponseTime: 4.2, // hours
      quoteValidityPeriod: 14, // days
      performanceMetrics: {
        onTimeQuoting: 94.5,
        customerSatisfaction: 4.6,
        quoteAccuracy: 96.2,
        followUpRate: 87.3,
      },
    };
  }

  private isRuleApplicable(rule: PricingRule, params: any): boolean {
    const { conditions } = rule;
    
    if (conditions.minWeight && params.weight < conditions.minWeight) return false;
    if (conditions.maxWeight && params.weight > conditions.maxWeight) return false;
    
    if (conditions.origins && conditions.origins.length > 0) {
      const matchesOrigin = conditions.origins.some(origin => 
        params.origin.toLowerCase().includes(origin.toLowerCase())
      );
      if (!matchesOrigin) return false;
    }
    
    if (conditions.destinations && conditions.destinations.length > 0) {
      const matchesDestination = conditions.destinations.some(destination => 
        params.destination.toLowerCase().includes(destination.toLowerCase())
      );
      if (!matchesDestination) return false;
    }
    
    if (conditions.commodities && conditions.commodities.length > 0 && params.commodity) {
      const matchesCommodity = conditions.commodities.some(commodity => 
        params.commodity.toLowerCase().includes(commodity.toLowerCase())
      );
      if (!matchesCommodity) return false;
    }
    
    if (conditions.customerTypes && conditions.customerTypes.length > 0 && params.customerType) {
      if (!conditions.customerTypes.includes(params.customerType)) return false;
    }
    
    return true;
  }

  private calculateRuleAmount(rule: PricingRule, weight: number, volume?: number): number {
    const { calculation } = rule;
    
    switch (calculation.type) {
      case 'fixed':
        return calculation.value;
      case 'percentage':
        // For percentage, we need a base amount - using a default base rate
        return (calculation.value / 100) * (weight * 5); // Assuming $5 per kg base
      case 'per_kg':
        return calculation.value * weight;
      case 'per_cbm':
        return calculation.value * (volume || 0);
      default:
        return 0;
    }
  }

  async getExpiredQuotes(): Promise<QuoteRequestDocument[]> {
    const now = new Date();
    return await this.quoteRequestModel
      .find({
        status: 'quoted',
        validUntil: { $lt: now }
      })
      .exec();
  }

  async markExpiredQuotes(): Promise<number> {
    const now = new Date();
    const result = await this.quoteRequestModel
      .updateMany(
        {
          status: 'quoted',
          validUntil: { $lt: now }
        },
        {
          status: 'expired',
          updatedAt: now
        }
      )
      .exec();

    return result.modifiedCount;
  }
}
