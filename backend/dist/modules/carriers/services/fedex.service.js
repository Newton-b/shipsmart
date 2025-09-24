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
var FedexService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FedexService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let FedexService = FedexService_1 = class FedexService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FedexService_1.name);
        this.apiKey = this.configService.get('FEDEX_API_KEY');
        this.secretKey = this.configService.get('FEDEX_SECRET_KEY');
        this.baseUrl = this.configService.get('FEDEX_BASE_URL', 'https://apis-sandbox.fedex.com');
    }
    async trackShipment(trackingNumber) {
        if (!this.apiKey || !this.secretKey) {
            return this.getMockTrackingInfo(trackingNumber);
        }
        return this.getMockTrackingInfo(trackingNumber);
    }
    async getRates(origin, destination, packages) {
        if (!this.apiKey || !this.secretKey) {
            return this.getMockRates(origin, destination, packages);
        }
        return this.getMockRates(origin, destination, packages);
    }
    async createShipment(origin, destination, packages, service, options) {
        if (!this.apiKey || !this.secretKey) {
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
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                location: 'Memphis, TN',
                description: 'Shipment information sent to FedEx',
                status: 'LABEL_CREATED',
            },
            {
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                location: 'Memphis, TN',
                description: 'Picked up',
                status: 'PICKED_UP',
            },
            {
                date: new Date(Date.now() - 12 * 60 * 60 * 1000),
                location: 'Indianapolis, IN',
                description: 'In transit',
                status: 'IN_TRANSIT',
            },
        ];
        return {
            trackingNumber,
            carrier: 'FedEx',
            status: 'In Transit',
            estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
            currentLocation: 'Indianapolis, IN',
            events: mockEvents,
        };
    }
    getMockRates(origin, destination, packages) {
        const totalWeight = packages.reduce((sum, pkg) => sum + pkg.weight, 0);
        const baseRate = totalWeight * 2.5;
        return [
            {
                carrier: 'FedEx',
                service: 'FedEx Ground',
                cost: baseRate + 15,
                currency: 'USD',
                transitTime: 3,
                deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
            {
                carrier: 'FedEx',
                service: 'FedEx Express Saver',
                cost: baseRate + 35,
                currency: 'USD',
                transitTime: 2,
                deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            },
        ];
    }
    getMockShipmentResponse(origin, destination, packages, service) {
        return {
            trackingNumber: `FEDEX${Date.now()}`,
            labelUrl: 'https://example.com/mock-fedex-label.pdf',
            cost: 25.99,
            currency: 'USD',
        };
    }
};
exports.FedexService = FedexService;
exports.FedexService = FedexService = FedexService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FedexService);
//# sourceMappingURL=fedex.service.js.map