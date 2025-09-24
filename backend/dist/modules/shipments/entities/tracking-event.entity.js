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
exports.TrackingEvent = exports.TrackingEventType = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const shipment_entity_1 = require("./shipment.entity");
var TrackingEventType;
(function (TrackingEventType) {
    TrackingEventType["CREATED"] = "created";
    TrackingEventType["CONFIRMED"] = "confirmed";
    TrackingEventType["PICKED_UP"] = "picked_up";
    TrackingEventType["DEPARTED"] = "departed";
    TrackingEventType["ARRIVED"] = "arrived";
    TrackingEventType["IN_TRANSIT"] = "in_transit";
    TrackingEventType["OUT_FOR_DELIVERY"] = "out_for_delivery";
    TrackingEventType["DELIVERED"] = "delivered";
    TrackingEventType["EXCEPTION"] = "exception";
    TrackingEventType["DELAYED"] = "delayed";
    TrackingEventType["CANCELLED"] = "cancelled";
    TrackingEventType["RETURNED"] = "returned";
})(TrackingEventType || (exports.TrackingEventType = TrackingEventType = {}));
let TrackingEvent = class TrackingEvent {
    get fullLocation() {
        const parts = [this.location, this.city, this.state, this.country].filter(Boolean);
        return parts.join(', ');
    }
    get isDeliveryEvent() {
        return this.eventType === TrackingEventType.DELIVERED;
    }
    get isExceptionEvent() {
        return this.eventType === TrackingEventType.EXCEPTION || this.isException;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, eventType: { required: true, enum: require("./tracking-event.entity").TrackingEventType }, description: { required: true, type: () => String }, location: { required: false, type: () => String }, city: { required: false, type: () => String }, state: { required: false, type: () => String }, country: { required: false, type: () => String }, postalCode: { required: false, type: () => String }, eventDate: { required: true, type: () => Date }, timezone: { required: false, type: () => String }, carrierEventCode: { required: false, type: () => String }, details: { required: false, type: () => Object }, source: { required: true, type: () => String }, isException: { required: true, type: () => Boolean }, exceptionReason: { required: false, type: () => String }, shipment: { required: true, type: () => require("./shipment.entity").Shipment }, shipmentId: { required: true, type: () => String }, createdAt: { required: true, type: () => Date } };
    }
};
exports.TrackingEvent = TrackingEvent;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event ID' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TrackingEvent.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event type', enum: TrackingEventType }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TrackingEventType,
    }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "eventType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event description' }),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event location' }),
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event city' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event state/province' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event country' }),
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event postal code' }),
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event date and time' }),
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], TrackingEvent.prototype, "eventDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event timezone' }),
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Carrier event code' }),
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "carrierEventCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional event details' }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TrackingEvent.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event source (carrier, system, manual)' }),
    (0, typeorm_1.Column)({ length: 50, default: 'carrier' }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Is this event an exception' }),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TrackingEvent.prototype, "isException", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Exception reason if applicable' }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "exceptionReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Associated shipment' }),
    (0, typeorm_1.ManyToOne)(() => shipment_entity_1.Shipment, (shipment) => shipment.trackingEvents, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'shipmentId' }),
    __metadata("design:type", shipment_entity_1.Shipment)
], TrackingEvent.prototype, "shipment", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipmentId' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TrackingEvent.prototype, "shipmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Event creation timestamp' }),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TrackingEvent.prototype, "createdAt", void 0);
exports.TrackingEvent = TrackingEvent = __decorate([
    (0, typeorm_1.Entity)('tracking_events'),
    (0, typeorm_1.Index)(['shipmentId']),
    (0, typeorm_1.Index)(['eventType']),
    (0, typeorm_1.Index)(['eventDate'])
], TrackingEvent);
//# sourceMappingURL=tracking-event.entity.js.map