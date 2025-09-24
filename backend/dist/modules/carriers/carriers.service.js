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
var CarriersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarriersService = void 0;
const common_1 = require("@nestjs/common");
const ups_service_1 = require("./services/ups.service");
const fedex_service_1 = require("./services/fedex.service");
const dhl_service_1 = require("./services/dhl.service");
let CarriersService = CarriersService_1 = class CarriersService {
    constructor(upsService, fedexService, dhlService) {
        this.upsService = upsService;
        this.fedexService = fedexService;
        this.dhlService = dhlService;
        this.logger = new common_1.Logger(CarriersService_1.name);
    }
    async trackShipment(trackingNumber, carrier) {
        this.logger.log(`Tracking shipment: ${trackingNumber} with carrier: ${carrier || 'auto-detect'}`);
        if (carrier) {
            return this.trackWithSpecificCarrier(trackingNumber, carrier);
        }
        const detectedCarrier = this.detectCarrier(trackingNumber);
        if (detectedCarrier) {
            return this.trackWithSpecificCarrier(trackingNumber, detectedCarrier);
        }
        const carriers = ['ups', 'fedex', 'dhl'];
        for (const carrierName of carriers) {
            try {
                const result = await this.trackWithSpecificCarrier(trackingNumber, carrierName);
                if (result && result.events.length > 0) {
                    return result;
                }
            }
            catch (error) {
                this.logger.debug(`Failed to track with ${carrierName}: ${error.message}`);
            }
        }
        throw new Error('Unable to track shipment with any carrier');
    }
    async trackWithSpecificCarrier(trackingNumber, carrier) {
        switch (carrier.toLowerCase()) {
            case 'ups':
                return this.upsService.trackShipment(trackingNumber);
            case 'fedex':
                return this.fedexService.trackShipment(trackingNumber);
            case 'dhl':
                return this.dhlService.trackShipment(trackingNumber);
            default:
                throw new Error(`Unsupported carrier: ${carrier}`);
        }
    }
    async getRates(origin, destination, packages, carriers) {
        const targetCarriers = carriers || ['ups', 'fedex', 'dhl'];
        const quotes = [];
        for (const carrier of targetCarriers) {
            try {
                const carrierQuotes = await this.getRatesFromCarrier(carrier, origin, destination, packages);
                quotes.push(...carrierQuotes);
            }
            catch (error) {
                this.logger.error(`Failed to get rates from ${carrier}: ${error.message}`);
            }
        }
        return quotes.sort((a, b) => a.cost - b.cost);
    }
    async getRatesFromCarrier(carrier, origin, destination, packages) {
        switch (carrier.toLowerCase()) {
            case 'ups':
                return this.upsService.getRates(origin, destination, packages);
            case 'fedex':
                return this.fedexService.getRates(origin, destination, packages);
            case 'dhl':
                return this.dhlService.getRates(origin, destination, packages);
            default:
                throw new Error(`Unsupported carrier: ${carrier}`);
        }
    }
    async createShipment(carrier, origin, destination, packages, service, options) {
        switch (carrier.toLowerCase()) {
            case 'ups':
                return this.upsService.createShipment(origin, destination, packages, service, options);
            case 'fedex':
                return this.fedexService.createShipment(origin, destination, packages, service, options);
            case 'dhl':
                return this.dhlService.createShipment(origin, destination, packages, service, options);
            default:
                throw new Error(`Unsupported carrier: ${carrier}`);
        }
    }
    detectCarrier(trackingNumber) {
        if (/^1Z[0-9A-Z]{16}$/.test(trackingNumber)) {
            return 'ups';
        }
        if (/^\d{12}$/.test(trackingNumber) || /^\d{14}$/.test(trackingNumber)) {
            return 'fedex';
        }
        if (/^\d{10}$/.test(trackingNumber) || /^\d{11}$/.test(trackingNumber)) {
            return 'dhl';
        }
        return null;
    }
    getSupportedCarriers() {
        return ['ups', 'fedex', 'dhl'];
    }
    async validateAddress(address, carrier) {
        const validationCarrier = carrier || 'ups';
        switch (validationCarrier.toLowerCase()) {
            case 'ups':
                return this.upsService.validateAddress(address);
            case 'fedex':
                return this.fedexService.validateAddress(address);
            case 'dhl':
                return this.dhlService.validateAddress(address);
            default:
                throw new Error(`Address validation not supported for carrier: ${carrier}`);
        }
    }
};
exports.CarriersService = CarriersService;
exports.CarriersService = CarriersService = CarriersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ups_service_1.UpsService,
        fedex_service_1.FedexService,
        dhl_service_1.DhlService])
], CarriersService);
//# sourceMappingURL=carriers.service.js.map