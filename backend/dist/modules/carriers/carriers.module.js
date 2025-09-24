"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarriersModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const carriers_controller_1 = require("./carriers.controller");
const carriers_service_1 = require("./carriers.service");
const ups_service_1 = require("./services/ups.service");
const fedex_service_1 = require("./services/fedex.service");
const dhl_service_1 = require("./services/dhl.service");
const carrier_factory_1 = require("./factories/carrier.factory");
let CarriersModule = class CarriersModule {
};
exports.CarriersModule = CarriersModule;
exports.CarriersModule = CarriersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            axios_1.HttpModule.register({
                timeout: 10000,
                maxRedirects: 5,
            }),
        ],
        controllers: [carriers_controller_1.CarriersController],
        providers: [
            carriers_service_1.CarriersService,
            ups_service_1.UpsService,
            fedex_service_1.FedexService,
            dhl_service_1.DhlService,
            carrier_factory_1.CarrierFactory,
        ],
        exports: [carriers_service_1.CarriersService, carrier_factory_1.CarrierFactory],
    })
], CarriersModule);
//# sourceMappingURL=carriers.module.js.map