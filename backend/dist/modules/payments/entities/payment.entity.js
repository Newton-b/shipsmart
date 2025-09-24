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
exports.Payment = exports.PaymentType = exports.PaymentMethod = exports.PaymentStatus = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../users/entities/user.entity");
const shipment_entity_1 = require("../../shipments/entities/shipment.entity");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["CANCELLED"] = "cancelled";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["PARTIALLY_REFUNDED"] = "partially_refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["DEBIT_CARD"] = "debit_card";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["WIRE_TRANSFER"] = "wire_transfer";
    PaymentMethod["CHECK"] = "check";
    PaymentMethod["CASH"] = "cash";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["SHIPMENT"] = "shipment";
    PaymentType["SUBSCRIPTION"] = "subscription";
    PaymentType["REFUND"] = "refund";
    PaymentType["FEE"] = "fee";
    PaymentType["ADJUSTMENT"] = "adjustment";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
let Payment = class Payment {
    get amountInDollars() {
        return this.amount / 100;
    }
    get netAmountInDollars() {
        return this.netAmount ? this.netAmount / 100 : 0;
    }
    get refundedAmountInDollars() {
        return this.refundedAmount / 100;
    }
    get isCompleted() {
        return this.status === PaymentStatus.COMPLETED;
    }
    get isFailed() {
        return this.status === PaymentStatus.FAILED;
    }
    get isRefunded() {
        return this.status === PaymentStatus.REFUNDED || this.status === PaymentStatus.PARTIALLY_REFUNDED;
    }
    get canRefund() {
        return this.status === PaymentStatus.COMPLETED && this.refundedAmount < this.amount;
    }
    get remainingRefundAmount() {
        return this.amount - this.refundedAmount;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, amount: { required: true, type: () => Number }, currency: { required: true, type: () => String }, status: { required: true, enum: require("./payment.entity").PaymentStatus }, paymentMethod: { required: true, enum: require("./payment.entity").PaymentMethod }, paymentType: { required: true, enum: require("./payment.entity").PaymentType }, description: { required: false, type: () => String }, referenceNumber: { required: false, type: () => String }, stripePaymentIntentId: { required: false, type: () => String }, stripeCustomerId: { required: false, type: () => String }, stripePaymentMethodId: { required: false, type: () => String }, paypalOrderId: { required: false, type: () => String }, paypalPayerId: { required: false, type: () => String }, transactionId: { required: false, type: () => String }, authorizationCode: { required: false, type: () => String }, processingFee: { required: false, type: () => Number }, netAmount: { required: false, type: () => Number }, refundedAmount: { required: true, type: () => Number }, refundReason: { required: false, type: () => String }, refundReference: { required: false, type: () => String }, billingName: { required: false, type: () => String }, billingEmail: { required: false, type: () => String }, billingAddress: { required: false, type: () => String }, billingCity: { required: false, type: () => String }, billingState: { required: false, type: () => String }, billingPostalCode: { required: false, type: () => String }, billingCountry: { required: false, type: () => String }, cardLast4: { required: false, type: () => String }, cardBrand: { required: false, type: () => String }, cardExpiryMonth: { required: false, type: () => Number }, cardExpiryYear: { required: false, type: () => Number }, processedAt: { required: false, type: () => Date }, failedAt: { required: false, type: () => Date }, refundedAt: { required: false, type: () => Date }, errorCode: { required: false, type: () => String }, errorMessage: { required: false, type: () => String }, metadata: { required: false, type: () => Object }, user: { required: true, type: () => require("../../users/entities/user.entity").User }, userId: { required: true, type: () => String }, shipment: { required: false, type: () => require("../../shipments/entities/shipment.entity").Shipment }, shipmentId: { required: false, type: () => String }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
};
exports.Payment = Payment;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment amount in cents' }),
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency code (ISO 4217)' }),
    (0, typeorm_1.Column)({ length: 3, default: 'USD' }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment status', enum: PaymentStatus }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment method', enum: PaymentMethod }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentMethod,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment type', enum: PaymentType }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentType,
        default: PaymentType.SHIPMENT,
    }),
    __metadata("design:type", String)
], Payment.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment description' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment reference number' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "referenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stripe Payment Intent ID' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Payment.prototype, "stripePaymentIntentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stripe Customer ID' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "stripeCustomerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stripe Payment Method ID' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "stripePaymentMethodId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PayPal Order ID' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "paypalOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'PayPal Payer ID' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "paypalPayerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction ID from payment processor' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Authorization code' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "authorizationCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Processing fee in cents' }),
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "processingFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net amount after fees in cents' }),
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "netAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refunded amount in cents' }),
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "refundedAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refund reason' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "refundReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Refund reference' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "refundReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing name' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "billingName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing email' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "billingEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing address' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "billingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing city' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "billingCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing state/province' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "billingState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing postal code' }),
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "billingPostalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Billing country' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "billingCountry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last 4 digits of card' }),
    (0, typeorm_1.Column)({ length: 4, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "cardLast4", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card brand (Visa, MasterCard, etc.)' }),
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "cardBrand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card expiry month' }),
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "cardExpiryMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card expiry year' }),
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "cardExpiryYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment processed at' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "processedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment failed at' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "failedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment refunded at' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "refundedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error code from payment processor' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "errorCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional payment metadata' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who made the payment' }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Payment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'userId' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Payment.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Associated shipment' }),
    (0, typeorm_1.ManyToOne)(() => shipment_entity_1.Shipment, { eager: false, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shipmentId' }),
    __metadata("design:type", shipment_entity_1.Shipment)
], Payment.prototype, "shipment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipmentId', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Payment.prototype, "shipmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment creation timestamp' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Payment.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payment last update timestamp' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Payment.prototype, "updatedAt", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['shipmentId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['paymentMethod']),
    (0, typeorm_1.Index)(['stripePaymentIntentId'])
], Payment);
//# sourceMappingURL=payment.entity.js.map