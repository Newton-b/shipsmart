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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarriersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const carriers_service_1 = require("./carriers.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let CarriersController = class CarriersController {
    constructor(carriersService) {
        this.carriersService = carriersService;
    }
    getSupportedCarriers() {
        return {
            carriers: this.carriersService.getSupportedCarriers(),
        };
    }
    async trackShipment(trackingNumber, carrier) {
        return this.carriersService.trackShipment(trackingNumber, carrier);
    }
    async getRates(rateRequest) {
        return this.carriersService.getRates(rateRequest.origin, rateRequest.destination, rateRequest.packages, rateRequest.carriers);
    }
    async createShipment(shipmentRequest) {
        return this.carriersService.createShipment(shipmentRequest.carrier, shipmentRequest.origin, shipmentRequest.destination, shipmentRequest.packages, shipmentRequest.service, shipmentRequest.options);
    }
    async validateAddress(validationRequest) {
        return this.carriersService.validateAddress(validationRequest.address, validationRequest.carrier);
    }
};
exports.CarriersController = CarriersController;
__decorate([
    (0, common_1.Get)('supported'),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of supported carriers' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of supported carriers',
    }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CarriersController.prototype, "getSupportedCarriers", null);
__decorate([
    (0, common_1.Get)('track/:trackingNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Track a shipment' }),
    (0, swagger_1.ApiQuery)({ name: 'carrier', required: false, description: 'Specific carrier to use for tracking' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Tracking information retrieved successfully',
    }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('trackingNumber')),
    __param(1, (0, common_1.Query)('carrier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CarriersController.prototype, "trackShipment", null);
__decorate([
    (0, common_1.Post)('rates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipping rates from multiple carriers' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Shipping rates retrieved successfully',
    }),
    openapi.ApiResponse({ status: 201, type: [Object] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarriersController.prototype, "getRates", null);
__decorate([
    (0, common_1.Post)('shipments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new shipment with a carrier' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Shipment created successfully',
    }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarriersController.prototype, "createShipment", null);
__decorate([
    (0, common_1.Post)('validate-address'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a shipping address' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Address validation completed',
    }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CarriersController.prototype, "validateAddress", null);
exports.CarriersController = CarriersController = __decorate([
    (0, swagger_1.ApiTags)('Carriers'),
    (0, common_1.Controller)('carriers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [carriers_service_1.CarriersService])
], CarriersController);
//# sourceMappingURL=carriers.controller.js.map