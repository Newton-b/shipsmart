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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const payment_entity_1 = require("../entities/payment.entity");
class CreatePaymentDto {
    constructor() {
        this.currency = 'USD';
        this.paymentType = payment_entity_1.PaymentType.SHIPMENT;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { amount: { required: true, type: () => Number, minimum: 0.01 }, currency: { required: false, type: () => String, default: "USD" }, paymentMethod: { required: true, enum: require("../entities/payment.entity").PaymentMethod }, paymentType: { required: false, default: payment_entity_1.PaymentType.SHIPMENT, enum: require("../entities/payment.entity").PaymentType }, description: { required: false, type: () => String }, userId: { required: true, type: () => String }, shipmentId: { required: false, type: () => String }, billingName: { required: false, type: () => String }, billingEmail: { required: false, type: () => String }, billingAddress: { required: false, type: () => String }, billingCity: { required: false, type: () => String }, billingState: { required: false, type: () => String }, billingPostalCode: { required: false, type: () => String }, billingCountry: { required: false, type: () => String }, metadata: { required: false, type: () => Object } };
    }
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount in dollars', example: 99.99 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code', example: 'USD', default: 'USD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method', enum: payment_entity_1.PaymentMethod }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentMethod),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment type', enum: payment_entity_1.PaymentType, default: payment_entity_1.PaymentType.SHIPMENT }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentType),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment description', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID making the payment' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Associated shipment ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "shipmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing name', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "billingName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing email', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "billingEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing address', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "billingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing city', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "billingCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing state', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "billingState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing postal code', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "billingPostalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing country', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "billingCountry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePaymentDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-payment.dto.js.map