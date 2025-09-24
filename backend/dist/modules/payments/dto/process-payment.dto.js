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
exports.ProcessPaymentDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ProcessPaymentDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { paymentMethodId: { required: false, type: () => String }, paypalOrderId: { required: false, type: () => String }, paypalPayerId: { required: false, type: () => String }, additionalData: { required: false, type: () => Object } };
    }
}
exports.ProcessPaymentDto = ProcessPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stripe Payment Method ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessPaymentDto.prototype, "paymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PayPal Order ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessPaymentDto.prototype, "paypalOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PayPal Payer ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessPaymentDto.prototype, "paypalPayerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional processing data', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ProcessPaymentDto.prototype, "additionalData", void 0);
//# sourceMappingURL=process-payment.dto.js.map