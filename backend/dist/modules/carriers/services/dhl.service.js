"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DhlService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DhlService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let DhlService = DhlService_1 = class DhlService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(DhlService_1.name);
        this.apiKey = this.configService.get('DHL_API_KEY');
        this.baseUrl = this.configService.get('DHL_BASE_URL', 'https://api-eu.dhl.com');
    }
    async trackShipment(trackingNumber) {
        if (!this.apiKey) {
            return this.getMockTrackingInfo(trackingNumber);
        }
        return this.getMockTrackingInfo(trackingNumber);
    }
    async getRates(origin, destination, packages) {
        if (!this.apiKey) {
            return this.getMockRates(origin, destination, packages);
        }
        return this.getMockRates(origin, destination, packages);
    }
    async createShipment(origin, destination, packages, service, options) {
        if (!this.apiKey) {
            return this.getMockShipmentResponse(origin, destination, packages, service);
        }
        return this.getMockShipmentResponse(origin, destination, packages, service);
    }
    async validateAddress(address) {
        return { isValid: true, suggestions: [address], errors: [] };
    }
    getMockTrackingInfo(trackingNumber) {
        const mockEvents = [
            {
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                location: 'Cincinnati, OH',
                description: 'Shipment picked up',
                status: 'PICKED_UP',
            },
            {
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                location: 'Cincinnati, OH',
                description: 'Processed at DHL facility',
                status: 'PROCESSED',
            },
            {
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                location: 'Chicago, IL',
                description: 'In transit to destination',
                status: 'IN_TRANSIT',
            },
        ];
        return {
            trackingNumber,
            carrier: 'DHL',
            status: 'In Transit',
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            currentLocation: 'Chicago, IL',
            events: mockEvents,
        };
    }
    getMockRates(origin, destination, packages) {
        const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0);
        const baseRate = totalWeight * 3.2;
        return [
            {
                carrier: 'DHL',
                service: 'DHL Express Worldwide',
                cost: baseRate + 45,
                currency: 'USD',
                transitTime: 2,
                deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            },
            {
                carrier: 'DHL',
                service: 'DHL Express 12:00',
                cost: baseRate + 75,
                currency: 'USD',
                transitTime: 1,
                deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            },
        ];
    }
    getMockShipmentResponse(origin, destination, packages, service) {
        return {
            trackingNumber: `DHL${Date.now()}`,
            labelUrl: 'https://example.com/mock-dhl-label.pdf',
            cost: 45.99,
            currency: 'USD',
        };
    }
};
exports.DhlService = DhlService;
exports.DhlService = DhlService = DhlService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DhlService);
//# sourceMappingURL=dhl.service.js.map