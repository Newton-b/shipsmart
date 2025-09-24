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
var UpsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let UpsService = UpsService_1 = class UpsService {
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(UpsService_1.name);
        this.baseUrl = 'https://onlinetools.ups.com/api';
        this.accessKey = this.configService.get('UPS_ACCESS_KEY');
        this.username = this.configService.get('UPS_USERNAME');
        this.password = this.configService.get('UPS_PASSWORD');
        if (!this.accessKey || !this.username || !this.password) {
            this.logger.warn('UPS credentials not configured - using mock data');
        }
    }
    async trackShipment(trackingNumber) {
        if (!this.accessKey) {
            return this.getMockTrackingInfo(trackingNumber);
        }
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.baseUrl}/track/v1/details/${trackingNumber}`, {
                headers: {
                    'AccessLicenseNumber': this.accessKey,
                    'Username': this.username,
                    'Password': this.password,
                    'Content-Type': 'application/json',
                },
            }));
            return this.parseUpsTrackingResponse(response.data);
        }
        catch (error) {
            this.logger.error(`UPS tracking failed for ${trackingNumber}:`, error.message);
            return this.getMockTrackingInfo(trackingNumber);
        }
    }
    async getRates(origin, destination, weight, dimensions) {
        if (!this.accessKey) {
            return this.getMockRates();
        }
        try {
            const rateRequest = {
                RateRequest: {
                    Request: {
                        RequestOption: 'Rate',
                    },
                    Shipment: {
                        Shipper: {
                            Address: {
                                City: origin.split(',')[0],
                                StateProvinceCode: origin.split(',')[1]?.trim(),
                                CountryCode: 'US',
                            },
                        },
                        ShipTo: {
                            Address: {
                                City: destination.split(',')[0],
                                StateProvinceCode: destination.split(',')[1]?.trim(),
                                CountryCode: 'US',
                            },
                        },
                        Package: {
                            PackagingType: {
                                Code: '02',
                            },
                            Dimensions: dimensions ? {
                                UnitOfMeasurement: {
                                    Code: 'CM',
                                },
                                Length: dimensions.length.toString(),
                                Width: dimensions.width.toString(),
                                Height: dimensions.height.toString(),
                            } : undefined,
                            PackageWeight: {
                                UnitOfMeasurement: {
                                    Code: 'KGS',
                                },
                                Weight: weight.toString(),
                            },
                        },
                    },
                },
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/rating/v1/Rate`, rateRequest, {
                headers: {
                    'AccessLicenseNumber': this.accessKey,
                    'Username': this.username,
                    'Password': this.password,
                    'Content-Type': 'application/json',
                },
            }));
            return this.parseUpsRateResponse(response.data);
        }
        catch (error) {
            this.logger.error('UPS rate request failed:', error.message);
            return this.getMockRates();
        }
    }
    parseUpsTrackingResponse(data) {
        const trackResponse = data.TrackResponse;
        const shipment = trackResponse.Shipment[0];
        const package_ = shipment.Package[0];
        const events = package_.Activity?.map((activity) => ({
            date: new Date(activity.Date + 'T' + activity.Time),
            location: `${activity.ActivityLocation.Address.City}, ${activity.ActivityLocation.Address.StateProvinceCode}`,
            description: activity.Status.Description,
            status: activity.Status.Code,
        })) || [];
        return {
            trackingNumber: package_.TrackingNumber,
            status: package_.CurrentStatus?.Code || 'unknown',
            statusDescription: package_.CurrentStatus?.Description || 'Status unknown',
            estimatedDelivery: package_.DeliveryDate ? new Date(package_.DeliveryDate) : undefined,
            currentLocation: events[0]?.location,
            events: events.reverse(),
        };
    }
    parseUpsRateResponse(data) {
        const rateResponse = data.RateResponse;
        return rateResponse.RatedShipment?.map((shipment) => ({
            service: shipment.Service.Code,
            cost: parseFloat(shipment.TotalCharges.MonetaryValue),
            currency: shipment.TotalCharges.CurrencyCode,
            transitTime: shipment.GuaranteedDelivery?.BusinessDaysInTransit || 'Unknown',
            deliveryDate: shipment.GuaranteedDelivery?.DeliveryByTime ?
                new Date(shipment.GuaranteedDelivery.DeliveryByTime) : undefined,
        })) || [];
    }
    getMockTrackingInfo(trackingNumber) {
        const mockEvents = [
            {
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                location: 'Atlanta, GA',
                description: 'Package received at UPS facility',
                status: 'received',
            },
            {
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                location: 'Louisville, KY',
                description: 'Package departed facility',
                status: 'in_transit',
            },
            {
                date: new Date(),
                location: 'Chicago, IL',
                description: 'Out for delivery',
                status: 'out_for_delivery',
            },
        ];
        return {
            trackingNumber,
            status: 'out_for_delivery',
            statusDescription: 'Out for delivery',
            estimatedDelivery: new Date(Date.now() + 6 * 60 * 60 * 1000),
            currentLocation: 'Chicago, IL',
            events: mockEvents,
        };
    }
    getMockRates() {
        return [
            {
                service: 'UPS Ground',
                cost: 12.50,
                currency: 'USD',
                transitTime: '3-5 business days',
                deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            },
            {
                service: 'UPS 2nd Day Air',
                cost: 25.75,
                currency: 'USD',
                transitTime: '2 business days',
                deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            },
            {
                service: 'UPS Next Day Air',
                cost: 45.00,
                currency: 'USD',
                transitTime: '1 business day',
                deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            },
        ];
    }
    isConfigured() {
        return !!(this.accessKey && this.username && this.password);
    }
};
exports.UpsService = UpsService;
exports.UpsService = UpsService = UpsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object])
], UpsService);
//# sourceMappingURL=ups.service.js.map