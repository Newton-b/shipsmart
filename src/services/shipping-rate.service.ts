import { Injectable } from '@nestjs/common';
import { ShippingRateRequest, ShippingRateResponse } from '../controllers/shipping-rate.controller';

@Injectable()
export class ShippingRateService {
  private readonly majorLocations = [
    'Los Angeles, CA', 'Long Beach, CA', 'New York, NY', 'Savannah, GA', 'Seattle, WA',
    'Oakland, CA', 'Norfolk, VA', 'Charleston, SC', 'Houston, TX', 'Tacoma, WA',
    'Shanghai, China', 'Shenzhen, China', 'Singapore', 'Rotterdam, Netherlands',
    'Hamburg, Germany', 'Antwerp, Belgium', 'Dubai, UAE', 'Hong Kong',
    'Tokyo, Japan', 'Busan, South Korea', 'Mumbai, India', 'Felixstowe, UK'
  ];

  private readonly packageTypes = [
    { value: 'package', label: 'Package', description: 'Small parcels up to 150 lbs' },
    { value: 'pallet', label: 'Pallet', description: 'Palletized freight up to 2,500 lbs' },
    { value: 'container', label: 'Container', description: '20ft/40ft container loads' },
    { value: 'bulk', label: 'Bulk Cargo', description: 'Loose cargo, liquids, grains' },
    { value: 'hazmat', label: 'Hazardous Materials', description: 'Dangerous goods requiring special handling' },
    { value: 'refrigerated', label: 'Refrigerated', description: 'Temperature-controlled cargo' }
  ];

  private rateCache = new Map<string, ShippingRateResponse[]>();

  async calculateRates(request: ShippingRateRequest): Promise<ShippingRateResponse[]> {
    const weight = this.calculateDimensionalWeight(request);
    const distance = this.calculateDistance(request.origin, request.destination);
    const urgencyMultiplier = this.getUrgencyMultiplier(request.urgency);
    const insuranceCost = request.insurance ? request.value * 0.002 : 0;

    const baseRates = {
      ocean: 2.5, // per kg per 1000km
      air: 8.5,   // per kg per 1000km  
      ground: 1.8 // per kg per 1000km
    };

    const fuelSurcharge = 0.15; // 15% fuel surcharge
    const securityFee = weight > 100 ? 75 : 35;
    const customsFee = distance > 3000 ? 150 : 0; // International shipments

    const results: ShippingRateResponse[] = [];

    // Ocean Freight
    if (request.serviceType === 'all' || request.serviceType === 'ocean') {
      const oceanCost = this.calculateServiceCost(
        baseRates.ocean, weight, distance, fuelSurcharge, urgencyMultiplier, securityFee, customsFee, insuranceCost
      );
      const oceanTransit = Math.max(15, Math.round(distance / 500));
      
      results.push({
        id: 1,
        service: 'Ocean Freight (FCL/LCL)',
        carrier: 'ShipSmart Ocean Lines',
        transitDays: oceanTransit,
        cost: Math.round(oceanCost * 100) / 100,
        currency: 'USD',
        reliability: 95,
        features: [
          'Door-to-door service',
          'Customs clearance included',
          'Container tracking',
          'Cargo insurance available',
          'Consolidation services'
        ],
        co2Savings: '85% less CO2 vs air freight',
        carbonFootprint: weight * 0.02, // kg CO2 per kg cargo
        breakdown: {
          baseCost: oceanCost * 0.6,
          fuelSurcharge: oceanCost * 0.15,
          securityFee,
          customsFee,
          insurance: insuranceCost
        }
      });
    }

    // Air Freight
    if (request.serviceType === 'all' || request.serviceType === 'air') {
      const airCost = this.calculateServiceCost(
        baseRates.air, weight, distance, fuelSurcharge, urgencyMultiplier, securityFee, customsFee, insuranceCost
      );
      const airTransit = Math.max(2, Math.round(distance / 2000));
      
      results.push({
        id: 2,
        service: 'Air Freight Express',
        carrier: 'ShipSmart Airways',
        transitDays: airTransit,
        cost: Math.round(airCost * 100) / 100,
        currency: 'USD',
        reliability: 98,
        features: [
          'Express delivery',
          'Real-time tracking',
          'Priority handling',
          'Temperature controlled',
          '24/7 customer support'
        ],
        co2Savings: 'Fastest delivery option',
        carbonFootprint: weight * 0.5, // kg CO2 per kg cargo
        breakdown: {
          baseCost: airCost * 0.65,
          fuelSurcharge: airCost * 0.20,
          securityFee,
          customsFee,
          insurance: insuranceCost
        }
      });
    }

    // Ground Transportation
    if (request.serviceType === 'all' || request.serviceType === 'ground') {
      const groundCost = this.calculateServiceCost(
        baseRates.ground, weight, distance, fuelSurcharge, urgencyMultiplier, securityFee, 0, insuranceCost
      );
      const groundTransit = Math.max(3, Math.round(distance / 800));
      
      results.push({
        id: 3,
        service: 'Ground Transportation',
        carrier: 'ShipSmart Logistics',
        transitDays: groundTransit,
        cost: Math.round(groundCost * 100) / 100,
        currency: 'USD',
        reliability: 92,
        features: [
          'Cost-effective solution',
          'Flexible pickup times',
          'LTL and FTL options',
          'Regional coverage',
          'Eco-friendly transport'
        ],
        co2Savings: '60% less CO2 vs air freight',
        carbonFootprint: weight * 0.15, // kg CO2 per kg cargo
        breakdown: {
          baseCost: groundCost * 0.70,
          fuelSurcharge: groundCost * 0.12,
          securityFee,
          customsFee: 0,
          insurance: insuranceCost
        }
      });
    }

    // Sort by cost
    results.sort((a, b) => a.cost - b.cost);

    // Cache results for refresh functionality
    const cacheKey = this.generateCacheKey(request);
    this.rateCache.set(cacheKey, results);

    return results;
  }

  async refreshRates(rateIds: number[]): Promise<ShippingRateResponse[]> {
    // Simulate market fluctuations for existing rates
    const allCachedRates = Array.from(this.rateCache.values()).flat();
    const ratesToRefresh = allCachedRates.filter(rate => rateIds.includes(rate.id));

    return ratesToRefresh.map(rate => {
      const fluctuation = (Math.random() - 0.5) * 0.1; // ±5%
      const newCost = rate.cost * (1 + fluctuation);

      return {
        ...rate,
        cost: Math.round(newCost * 100) / 100,
        breakdown: {
          ...rate.breakdown,
          baseCost: rate.breakdown.baseCost * (1 + fluctuation)
        }
      };
    });
  }

  async getLocationSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];
    
    return this.majorLocations
      .filter(location => location.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  async getPackageTypes() {
    return this.packageTypes;
  }

  private calculateDimensionalWeight(request: ShippingRateRequest): number {
    const { length, width, height, weight } = request;
    // Air freight dimensional weight factor (166 for inches)
    const dimWeight = (length * width * height) / 166;
    return Math.max(weight, dimWeight);
  }

  private calculateDistance(origin: string, destination: string): number {
    const routes: {[key: string]: number} = {
      'domestic': 2500, // Average US domestic distance
      'transpacific': 6000, // US to Asia
      'transatlantic': 4000, // US to Europe
      'intra-asia': 2000, // Within Asia
      'intra-europe': 1500 // Within Europe
    };

    const isUS = (loc: string) => loc.includes('CA') || loc.includes('NY') || loc.includes('TX') || loc.includes('WA');
    const isAsia = (loc: string) => loc.includes('China') || loc.includes('Japan') || loc.includes('Korea') || loc.includes('Singapore');
    const isEurope = (loc: string) => loc.includes('Germany') || loc.includes('Netherlands') || loc.includes('UK');

    if (isUS(origin) && isUS(destination)) return routes.domestic;
    if ((isUS(origin) && isAsia(destination)) || (isAsia(origin) && isUS(destination))) return routes.transpacific;
    if ((isUS(origin) && isEurope(destination)) || (isEurope(origin) && isUS(destination))) return routes.transatlantic;
    if (isAsia(origin) && isAsia(destination)) return routes['intra-asia'];
    if (isEurope(origin) && isEurope(destination)) return routes['intra-europe'];

    return routes.transpacific; // Default
  }

  private getUrgencyMultiplier(urgency: string): number {
    switch (urgency) {
      case 'express': return 1.25;
      case 'urgent': return 1.5;
      case 'critical': return 2.0;
      default: return 1.0;
    }
  }

  private calculateServiceCost(
    baseRate: number,
    weight: number,
    distance: number,
    fuelSurcharge: number,
    urgencyMultiplier: number,
    securityFee: number,
    customsFee: number,
    insuranceCost: number
  ): number {
    const baseCost = (weight * 0.453592) * (distance / 1000) * baseRate; // Convert lbs to kg
    const fuelCost = baseCost * fuelSurcharge;
    const totalBeforeExtras = (baseCost + fuelCost) * urgencyMultiplier;
    return totalBeforeExtras + securityFee + customsFee + insuranceCost;
  }

  private generateCacheKey(request: ShippingRateRequest): string {
    return `${request.origin}-${request.destination}-${request.weight}-${request.serviceType}`;
  }
}
