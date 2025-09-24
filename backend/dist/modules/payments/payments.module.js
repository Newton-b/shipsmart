"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const stripe_service_1 = require("./services/stripe.service");
const paypal_service_1 = require("./services/paypal.service");
const payment_entity_1 = require("./entities/payment.entity");
const auth_module_1 = require("../auth/auth.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([payment_entity_1.Payment]),
            auth_module_1.AuthModule,
        ],
        controllers: [payments_controller_1.PaymentsController],
        providers: [payments_service_1.PaymentsService, stripe_service_1.StripeService, paypal_service_1.PayPalService],
        exports: [payments_service_1.PaymentsService, stripe_service_1.StripeService, paypal_service_1.PayPalService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map