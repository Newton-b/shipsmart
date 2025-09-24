"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const shipments_controller_1 = require("./shipments.controller");
const shipments_service_1 = require("./shipments.service");
const shipment_entity_1 = require("./entities/shipment.entity");
const tracking_event_entity_1 = require("./entities/tracking-event.entity");
const auth_module_1 = require("../auth/auth.module");
const carriers_module_1 = require("../carriers/carriers.module");
const websocket_module_1 = require("../websocket/websocket.module");
let ShipmentsModule = class ShipmentsModule {
};
exports.ShipmentsModule = ShipmentsModule;
exports.ShipmentsModule = ShipmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([shipment_entity_1.Shipment, tracking_event_entity_1.TrackingEvent]),
            auth_module_1.AuthModule,
            carriers_module_1.CarriersModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [shipments_controller_1.ShipmentsController],
        providers: [shipments_service_1.ShipmentsService],
        exports: [shipments_service_1.ShipmentsService],
    })
], ShipmentsModule);
//# sourceMappingURL=shipments.module.js.map