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
exports.Shipment = exports.ShipmentPriority = exports.ShipmentType = exports.ShipmentStatus = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../users/entities/user.entity");
const tracking_event_entity_1 = require("./tracking-event.entity");
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["PENDING"] = "pending";
    ShipmentStatus["CONFIRMED"] = "confirmed";
    ShipmentStatus["PICKED_UP"] = "picked_up";
    ShipmentStatus["IN_TRANSIT"] = "in_transit";
    ShipmentStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    ShipmentStatus["DELIVERED"] = "delivered";
    ShipmentStatus["EXCEPTION"] = "exception";
    ShipmentStatus["CANCELLED"] = "cancelled";
})(ShipmentStatus || (exports.ShipmentStatus = ShipmentStatus = {}));
var ShipmentType;
(function (ShipmentType) {
    ShipmentType["OCEAN"] = "ocean";
    ShipmentType["AIR"] = "air";
    ShipmentType["GROUND"] = "ground";
    ShipmentType["EXPRESS"] = "express";
})(ShipmentType || (exports.ShipmentType = ShipmentType = {}));
var ShipmentPriority;
(function (ShipmentPriority) {
    ShipmentPriority["LOW"] = "low";
    ShipmentPriority["MEDIUM"] = "medium";
    ShipmentPriority["HIGH"] = "high";
    ShipmentPriority["URGENT"] = "urgent";
})(ShipmentPriority || (exports.ShipmentPriority = ShipmentPriority = {}));
let Shipment = class Shipment {
    get fullSenderAddress() {
        return `${this.senderAddress}, ${this.senderCity}, ${this.senderState} ${this.senderPostalCode}, ${this.senderCountry}`;
    }
    get fullRecipientAddress() {
        return `${this.recipientAddress}, ${this.recipientCity}, ${this.recipientState} ${this.recipientPostalCode}, ${this.recipientCountry}`;
    }
    get isDelivered() {
        return this.status === ShipmentStatus.DELIVERED;
    }
    get isInTransit() {
        return [
            ShipmentStatus.PICKED_UP,
            ShipmentStatus.IN_TRANSIT,
            ShipmentStatus.OUT_FOR_DELIVERY,
        ].includes(this.status);
    }
    get estimatedDaysRemaining() {
        if (!this.estimatedDeliveryDate || this.isDelivered) {
            return null;
        }
        const now = new Date();
        const diffTime = this.estimatedDeliveryDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, trackingNumber: { required: true, type: () => String }, status: { required: true, enum: require("./shipment.entity").ShipmentStatus }, type: { required: true, enum: require("./shipment.entity").ShipmentType }, priority: { required: true, enum: require("./shipment.entity").ShipmentPriority }, carrier: { required: true, type: () => String }, serviceType: { required: false, type: () => String }, senderName: { required: true, type: () => String }, senderCompany: { required: false, type: () => String }, senderAddress: { required: true, type: () => String }, senderCity: { required: true, type: () => String }, senderState: { required: true, type: () => String }, senderPostalCode: { required: true, type: () => String }, senderCountry: { required: true, type: () => String }, senderPhone: { required: false, type: () => String }, senderEmail: { required: false, type: () => String }, recipientName: { required: true, type: () => String }, recipientCompany: { required: false, type: () => String }, recipientAddress: { required: true, type: () => String }, recipientCity: { required: true, type: () => String }, recipientState: { required: true, type: () => String }, recipientPostalCode: { required: true, type: () => String }, recipientCountry: { required: true, type: () => String }, recipientPhone: { required: false, type: () => String }, recipientEmail: { required: false, type: () => String }, description: { required: false, type: () => String }, weight: { required: true, type: () => Number }, length: { required: false, type: () => Number }, width: { required: false, type: () => Number }, height: { required: false, type: () => Number }, value: { required: false, type: () => Number }, pieces: { required: true, type: () => Number }, estimatedDeliveryDate: { required: false, type: () => Date }, actualDeliveryDate: { required: false, type: () => Date }, pickupDate: { required: false, type: () => Date }, shipDate: { required: false, type: () => Date }, shippingCost: { required: false, type: () => Number }, insuranceCost: { required: false, type: () => Number }, totalCost: { required: false, type: () => Number }, specialInstructions: { required: false, type: () => String }, referenceNumber: { required: false, type: () => String }, isFragile: { required: true, type: () => Boolean }, requiresSignature: { required: true, type: () => Boolean }, isInsured: { required: true, type: () => Boolean }, metadata: { required: false, type: () => Object }, user: { required: true, type: () => require("../../users/entities/user.entity").User }, userId: { required: true, type: () => String }, trackingEvents: { required: true, type: () => [require("./tracking-event.entity").TrackingEvent] }, createdAt: { required: true, type: () => Date }, updatedAt: { required: true, type: () => Date } };
    }
};
exports.Shipment = Shipment;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipment ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Shipment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tracking number' }),
    (0, typeorm_1.Column)({ unique: true, length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Shipment.prototype, "trackingNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipment status', enum: ShipmentStatus }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ShipmentStatus,
        default: ShipmentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Shipment.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipment type', enum: ShipmentType }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ShipmentType,
        default: ShipmentType.GROUND,
    }),
    __metadata("design:type", String)
], Shipment.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipment priority', enum: ShipmentPriority }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ShipmentPriority,
        default: ShipmentPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Shipment.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Carrier name' }),
    (0, typeorm_1.Column)({ length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Shipment.prototype, "carrier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Carrier service type' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "serviceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender name' }),
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Shipment.prototype, "senderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender company' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "senderCompany", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender address' }),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Shipment.prototype, "senderAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender city' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Shipment.prototype, "senderCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender state/province' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Shipment.prototype, "senderState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender postal code' }),
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Shipment.prototype, "senderPostalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender country' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Shipment.prototype, "senderCountry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender phone' }),
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "senderPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender email' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "senderEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient name' }),
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Shipment.prototype, "recipientName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient company' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "recipientCompany", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient address' }),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Shipment.prototype, "recipientAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient city' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Shipment.prototype, "recipientCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient state/province' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Shipment.prototype, "recipientState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient postal code' }),
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Shipment.prototype, "recipientPostalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient country' }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Shipment.prototype, "recipientCountry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient phone' }),
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "recipientPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient email' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package description' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package weight in kg' }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Shipment.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package length in cm' }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shipment.prototype, "length", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package width in cm' }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shipment.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package height in cm' }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shipment.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Package value in USD' }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shipment.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of pieces' }),
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Shipment.prototype, "pieces", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated delivery date' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "estimatedDeliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actual delivery date' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "actualDeliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pickup date' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "pickupDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ship date' }),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Shipment.prototype, "shipDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipping cost in USD' }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shipment.prototype, "shippingCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Insurance cost in USD' }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shipment.prototype, "insuranceCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total cost in USD' }),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Shipment.prototype, "totalCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Special instructions' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "specialInstructions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference number' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Shipment.prototype, "referenceNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is fragile package' }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Shipment.prototype, "isFragile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requires signature' }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Shipment.prototype, "requiresSignature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is insured' }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Shipment.prototype, "isInsured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Shipment.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who created the shipment' }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], Shipment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'userId' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Shipment.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tracking events', type: [tracking_event_entity_1.TrackingEvent] }),
    (0, typeorm_1.OneToMany)(() => tracking_event_entity_1.TrackingEvent, (event) => event.shipment, { cascade: true }),
    __metadata("design:type", Array)
], Shipment.prototype, "trackingEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Shipment.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Shipment.prototype, "updatedAt", void 0);
exports.Shipment = Shipment = __decorate([
    (0, typeorm_1.Entity)('shipments'),
    (0, typeorm_1.Index)(['trackingNumber'], { unique: true }),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['carrier'])
], Shipment);
//# sourceMappingURL=shipment.entity.js.map