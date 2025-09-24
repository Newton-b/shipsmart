/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/adapters/carrier-adapter.interface.ts":
/*!***************************************************!*\
  !*** ./src/adapters/carrier-adapter.interface.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CarrierAdapter = void 0;
class CarrierAdapter {
    constructor(config) {
        this.config = config;
        this.carrierCode = config.carrierCode;
        this.carrierName = config.carrierName;
    }
    getCarrierCode() {
        return this.carrierCode;
    }
    getCarrierName() {
        return this.carrierName;
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}
exports.CarrierAdapter = CarrierAdapter;


/***/ }),

/***/ "./src/adapters/fedex-adapter.ts":
/*!***************************************!*\
  !*** ./src/adapters/fedex-adapter.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FedexAdapter = void 0;
const axios_1 = __webpack_require__(/*! axios */ "axios");
const opossum_1 = __webpack_require__(/*! opossum */ "opossum");
const carrier_adapter_interface_1 = __webpack_require__(/*! ./carrier-adapter.interface */ "./src/adapters/carrier-adapter.interface.ts");
const tracking_types_1 = __webpack_require__(/*! @/types/tracking.types */ "./src/types/tracking.types.ts");
const tracking_types_2 = __webpack_require__(/*! @/types/tracking.types */ "./src/types/tracking.types.ts");
class FedexAdapter extends carrier_adapter_interface_1.CarrierAdapter {
    constructor(config) {
        super(config);
        this.accessToken = null;
        this.tokenExpiry = null;
        this.httpClient = axios_1.default.create({
            baseURL: config.baseUrl || 'https://apis.fedex.com',
            timeout: config.timeout * 1000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const circuitBreakerOptions = {
            timeout: config.timeout * 1000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            rollingCountTimeout: 10000,
            rollingCountBuckets: 10,
        };
        this.circuitBreaker = new opossum_1.default(this.makeApiCall.bind(this), circuitBreakerOptions);
        this.circuitBreaker.on('open', () => {
            console.warn(`FedEx Circuit breaker opened for carrier ${this.carrierCode}`);
        });
        this.circuitBreaker.on('halfOpen', () => {
            console.info(`FedEx Circuit breaker half-open for carrier ${this.carrierCode}`);
        });
        this.circuitBreaker.on('close', () => {
            console.info(`FedEx Circuit breaker closed for carrier ${this.carrierCode}`);
        });
    }
    async track(trackingNumber) {
        try {
            await this.ensureAuthenticated();
            const response = await this.circuitBreaker.fire(async () => {
                return this.httpClient.post('/track/v1/trackingnumbers', {
                    includeDetailedScans: true,
                    trackingInfo: [
                        {
                            trackingNumberInfo: {
                                trackingNumber: trackingNumber,
                            },
                        },
                    ],
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                    },
                });
            });
            return this.parseTrackingResponse(response.data, trackingNumber);
        }
        catch (error) {
            console.error('FedEx tracking error:', error);
            throw new Error(`Failed to track FedEx shipment: ${error.message}`);
        }
    }
    async trackBatch(trackingNumbers) {
        const promises = trackingNumbers.map(trackingNumber => this.track(trackingNumber)
            .catch(error => {
            console.error(`Batch tracking failed for ${trackingNumber}:`, error);
            return null;
        }));
        const results = await Promise.all(promises);
        return results.filter(result => result !== null);
    }
    async ensureAuthenticated() {
        if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
            return;
        }
        try {
            const response = await this.httpClient.post('/oauth/token', {
                grant_type: 'client_credentials',
                client_id: this.config.apiKey,
                client_secret: this.config.apiSecret,
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
            this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
        }
        catch (error) {
            throw new tracking_types_1.CarrierApiError(`FedEx authentication failed: ${error.message}`, error.response?.status || 500, this.carrierCode);
        }
    }
    async makeApiCall(trackingNumber) {
        const requestData = {
            includeDetailedScans: true,
            trackingInfo: [
                {
                    trackingNumberInfo: {
                        trackingNumber: trackingNumber,
                    },
                },
            ],
        };
        return this.httpClient.post('/track/v1/trackingnumbers', requestData);
    }
    parseTrackingResponse(data, trackingNumber) {
        const trackResult = data.output.completeTrackResults[0]?.trackResults[0];
        if (!trackResult) {
            throw new tracking_types_1.CarrierApiError('No tracking information found', 404, this.carrierCode, trackingNumber);
        }
        const events = trackResult.scanEvents?.map(event => ({
            status: this.mapFedexStatusToTrackingStatus(event.derivedStatusCode),
            description: event.eventDescription || event.exceptionDescription,
            location: {
                city: event.scanLocation.city,
                state: event.scanLocation.stateOrProvinceCode,
                country: event.scanLocation.countryCode,
                postalCode: event.scanLocation.postalCode,
            },
            timestamp: new Date(event.date),
            externalEventId: event.derivedStatusCode,
            rawData: event,
        })) || [];
        events.sort((a, b) => {
            const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
            const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
            return bTime - aTime;
        });
        const estimatedDelivery = trackResult.dateAndTimes?.find(dt => dt.type === 'ESTIMATED_DELIVERY')?.dateTime;
        const response = {
            trackingNumber,
            carrierCode: this.carrierCode,
            carrierName: this.carrierName,
            currentStatus: events[0]?.status || this.mapFedexStatusToTrackingStatus(trackResult.latestStatusDetail?.derivedCode),
            events,
            estimatedDelivery,
            actualDelivery: trackResult.deliveryDetails?.receivedByName ?
                trackResult.dateAndTimes?.find(dt => dt.type === 'ACTUAL_DELIVERY')?.dateTime : undefined,
            origin: trackResult.originLocation ? {
                city: trackResult.originLocation.locationContactAndAddress.address.city,
                state: trackResult.originLocation.locationContactAndAddress.address.stateOrProvinceCode,
                country: trackResult.originLocation.locationContactAndAddress.address.countryCode,
                postalCode: trackResult.originLocation.locationContactAndAddress.address.postalCode,
            } : undefined,
            destination: trackResult.destinationLocation ? {
                city: trackResult.destinationLocation.locationContactAndAddress.address.city,
                state: trackResult.destinationLocation.locationContactAndAddress.address.stateOrProvinceCode,
                country: trackResult.destinationLocation.locationContactAndAddress.address.countryCode,
                postalCode: trackResult.destinationLocation.locationContactAndAddress.address.postalCode,
            } : undefined,
            lastUpdated: new Date(),
            isDelivered: trackResult.latestStatusDetail?.derivedCode === 'DL',
            rawData: data,
        };
        return tracking_types_2.TrackingResponseSchema.parse(response);
    }
    mapFedexStatusToTrackingStatus(fedexStatus) {
        const statusMap = {
            'OC': tracking_types_1.TrackingStatus.PENDING,
            'PU': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'IT': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'AR': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'OD': tracking_types_1.TrackingStatus.OUT_FOR_DELIVERY,
            'DL': tracking_types_1.TrackingStatus.DELIVERED,
            'EX': tracking_types_1.TrackingStatus.EXCEPTION,
            'CA': tracking_types_1.TrackingStatus.CANCELLED,
            'RS': tracking_types_1.TrackingStatus.RETURNED,
        };
        return statusMap[fedexStatus] || tracking_types_1.TrackingStatus.PENDING;
    }
    isTrackingNumberValid(trackingNumber) {
        const patterns = this.getTrackingNumberPatterns();
        return patterns.some(pattern => pattern.test(trackingNumber));
    }
    getTrackingNumberPatterns() {
        return [
            /^\d{12}$/,
            /^\d{14}$/,
            /^\d{15}$/,
            /^\d{20}$/,
            /^\d{22}$/,
            /^96\d{20}$/,
        ];
    }
    async healthCheck() {
        try {
            await this.ensureAuthenticated();
            return this.accessToken !== null;
        }
        catch (error) {
            console.error('FedEx health check failed:', error.message);
            return false;
        }
    }
}
exports.FedexAdapter = FedexAdapter;


/***/ }),

/***/ "./src/adapters/maersk-adapter.ts":
/*!****************************************!*\
  !*** ./src/adapters/maersk-adapter.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MaerskAdapter = void 0;
const axios_1 = __webpack_require__(/*! axios */ "axios");
const opossum_1 = __webpack_require__(/*! opossum */ "opossum");
const carrier_adapter_interface_1 = __webpack_require__(/*! ./carrier-adapter.interface */ "./src/adapters/carrier-adapter.interface.ts");
const tracking_types_1 = __webpack_require__(/*! @/types/tracking.types */ "./src/types/tracking.types.ts");
const tracking_types_2 = __webpack_require__(/*! @/types/tracking.types */ "./src/types/tracking.types.ts");
class MaerskAdapter extends carrier_adapter_interface_1.CarrierAdapter {
    constructor(config) {
        super(config);
        this.httpClient = axios_1.default.create({
            baseURL: config.baseUrl || 'https://api.maersk.com',
            timeout: config.timeout * 1000,
            headers: {
                'Content-Type': 'application/json',
                'Consumer-Key': config.apiKey,
                'Authorization': `Bearer ${config.apiSecret}`,
            },
        });
        const circuitBreakerOptions = {
            timeout: config.timeout * 1000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            rollingCountTimeout: 10000,
            rollingCountBuckets: 10,
        };
        this.circuitBreaker = new opossum_1.default(this.makeApiCall.bind(this), circuitBreakerOptions);
        this.circuitBreaker.on('open', () => {
            console.warn(`Maersk Circuit breaker opened for carrier ${this.carrierCode}`);
        });
        this.circuitBreaker.on('halfOpen', () => {
            console.info(`Maersk Circuit breaker half-open for carrier ${this.carrierCode}`);
        });
        this.circuitBreaker.on('close', () => {
            console.info(`Maersk Circuit breaker closed for carrier ${this.carrierCode}`);
        });
    }
    async track(trackingNumber) {
        try {
            const response = await this.circuitBreaker.fire(trackingNumber);
            return this.transformResponse(response.data, trackingNumber);
        }
        catch (error) {
            console.error('Maersk tracking error:', error);
            throw new Error(`Failed to track Maersk shipment: ${error.message}`);
        }
    }
    async trackBatch(trackingNumbers) {
        const promises = trackingNumbers.map(trackingNumber => this.track(trackingNumber)
            .catch(error => {
            console.error(`Batch tracking failed for ${trackingNumber}:`, error);
            return null;
        }));
        const results = await Promise.all(promises);
        return results.filter(result => result !== null);
    }
    async makeApiCall(containerNumber) {
        const endpoint = containerNumber.includes(',')
            ? `/track-and-trace-private/events?containerNumber=${containerNumber}`
            : `/track-and-trace-private/events?containerNumber=${containerNumber}`;
        return this.httpClient.get(endpoint);
    }
    transformResponse(data, trackingNumber) {
        const containerData = data.data?.[0];
        if (!containerData) {
            throw new tracking_types_1.CarrierApiError('No tracking information found', 404, this.carrierCode, trackingNumber);
        }
        return this.transformContainerResponse(containerData, trackingNumber);
    }
    transformContainerResponse(containerData, trackingNumber) {
        const allEvents = [
            ...(containerData.events || []),
            ...(containerData.equipmentEvents || []),
        ];
        const events = allEvents.map(event => ({
            status: this.mapMaerskStatusToTrackingStatus(event.eventClassifierCode, event.eventType),
            description: event.eventDescription,
            location: {
                city: event.location?.locationName,
                country: event.location?.UNLocationCode?.substring(0, 2),
                address: event.location?.facilityName,
            },
            timestamp: new Date(event.eventDateTime),
            externalEventId: event.eventClassifierCode,
            rawData: event,
        }));
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const route = containerData.route?.routeDetails?.[0];
        const origin = route?.fromLocation ? {
            city: route.fromLocation.locationName,
            country: route.fromLocation.UNLocationCode?.substring(0, 2),
        } : undefined;
        const destination = route?.toLocation ? {
            city: route.toLocation.locationName,
            country: route.toLocation.UNLocationCode?.substring(0, 2),
        } : undefined;
        const isDelivered = events.some(event => event.status === tracking_types_1.TrackingStatus.DELIVERED ||
            event.rawData?.eventClassifierCode === 'DIS');
        const response = {
            trackingNumber,
            carrierCode: this.carrierCode,
            carrierName: this.carrierName,
            currentStatus: events[0]?.status || tracking_types_1.TrackingStatus.PENDING,
            events,
            origin,
            destination,
            lastUpdated: new Date(),
            isDelivered,
            rawData: containerData,
        };
        return tracking_types_2.TrackingResponseSchema.parse(response);
    }
    mapMaerskStatusToTrackingStatus(classifierCode, eventType) {
        const statusMap = {
            'DEP': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'ARR': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'LOD': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'DIS': tracking_types_1.TrackingStatus.DELIVERED,
            'GIN': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'GOT': tracking_types_1.TrackingStatus.OUT_FOR_DELIVERY,
            'STUF': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'STRP': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'PICK': tracking_types_1.TrackingStatus.OUT_FOR_DELIVERY,
            'DROP': tracking_types_1.TrackingStatus.DELIVERED,
            'RETU': tracking_types_1.TrackingStatus.RETURNED,
            'CANC': tracking_types_1.TrackingStatus.CANCELLED,
            'HOLD': tracking_types_1.TrackingStatus.EXCEPTION,
        };
        return statusMap[classifierCode] || statusMap[eventType] || tracking_types_1.TrackingStatus.PENDING;
    }
    isTrackingNumberValid(trackingNumber) {
        const patterns = this.getTrackingNumberPatterns();
        return patterns.some(pattern => pattern.test(trackingNumber));
    }
    getTrackingNumberPatterns() {
        return [
            /^[A-Z]{4}\d{7}$/i,
            /^[A-Z]{3}U\d{7}$/i,
            /^MAEU\d{7}$/i,
            /^MSCU\d{7}$/i,
            /^SEGU\d{7}$/i,
        ];
    }
    async healthCheck() {
        try {
            const response = await this.httpClient.get('/track-and-trace-private/health', {
                timeout: 5000,
                validateStatus: (status) => status < 500,
            });
            return response.status < 500;
        }
        catch (error) {
            console.error('Maersk health check failed:', error.message);
            return false;
        }
    }
}
exports.MaerskAdapter = MaerskAdapter;


/***/ }),

/***/ "./src/adapters/ups-adapter.ts":
/*!*************************************!*\
  !*** ./src/adapters/ups-adapter.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpsAdapter = void 0;
const axios_1 = __webpack_require__(/*! axios */ "axios");
const opossum_1 = __webpack_require__(/*! opossum */ "opossum");
const carrier_adapter_interface_1 = __webpack_require__(/*! ./carrier-adapter.interface */ "./src/adapters/carrier-adapter.interface.ts");
const tracking_types_1 = __webpack_require__(/*! ../types/tracking.types */ "./src/types/tracking.types.ts");
const tracking_types_2 = __webpack_require__(/*! ../types/tracking.types */ "./src/types/tracking.types.ts");
class UpsAdapter extends carrier_adapter_interface_1.CarrierAdapter {
    constructor(config) {
        super(config);
        this.httpClient = axios_1.default.create({
            baseURL: config.baseUrl || 'https://onlinetools.ups.com/api',
            timeout: config.timeout * 1000,
            headers: {
                'Content-Type': 'application/json',
                'AccessLicenseNumber': config.apiKey,
                'Username': config.apiSecret?.split(':')[0] || '',
                'Password': config.apiSecret?.split(':')[1] || '',
            },
        });
        const circuitBreakerOptions = {
            timeout: config.timeout * 1000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            rollingCountTimeout: 10000,
            rollingCountBuckets: 10,
        };
        this.circuitBreaker = new opossum_1.default(this.makeApiCall.bind(this), circuitBreakerOptions);
        this.circuitBreaker.on('open', () => {
            console.warn(`UPS Circuit breaker opened for carrier ${this.carrierCode}`);
        });
        this.circuitBreaker.on('halfOpen', () => {
            console.info(`UPS Circuit breaker half-open for carrier ${this.carrierCode}`);
        });
        this.circuitBreaker.on('close', () => {
            console.info(`UPS Circuit breaker closed for carrier ${this.carrierCode}`);
        });
    }
    async track(trackingNumber) {
        try {
            const response = await this.circuitBreaker.fire(trackingNumber);
            return this.transformResponse(response.data, trackingNumber);
        }
        catch (error) {
            console.error('UPS tracking error:', error);
            throw new Error(`Failed to track UPS shipment: ${error.message}`);
        }
    }
    async trackBatch(trackingNumbers) {
        const promises = trackingNumbers.map(trackingNumber => this.track(trackingNumber)
            .catch(error => {
            console.error(`Batch tracking failed for ${trackingNumber}:`, error);
            return null;
        }));
        const results = await Promise.all(promises);
        return results.filter(result => result !== null);
    }
    async makeApiCall(trackingNumber) {
        const requestData = {
            UPSSecurity: {
                UsernameToken: {
                    Username: this.config.apiSecret?.split(':')[0] || '',
                    Password: this.config.apiSecret?.split(':')[1] || '',
                },
                ServiceAccessToken: {
                    AccessLicenseNumber: this.config.apiKey,
                },
            },
            TrackRequest: {
                Request: {
                    RequestOption: '1',
                    TransactionReference: {
                        CustomerContext: 'ShipSmart Tracking',
                    },
                },
                InquiryNumber: trackingNumber,
            },
        };
        return this.httpClient.post('/Track', requestData);
    }
    transformResponse(data, trackingNumber) {
        const shipment = data.trackResponse.shipment[0];
        const packageInfo = shipment.package[0];
        const events = packageInfo.activity.map(activity => ({
            status: this.mapUpsStatusToTrackingStatus(activity.status.code),
            description: activity.status.description,
            location: {
                city: activity.location.address.city,
                state: activity.location.address.stateProvinceCode,
                country: activity.location.address.countryCode,
                postalCode: activity.location.address.postalCode,
            },
            timestamp: new Date(`${activity.date} ${activity.time}`),
            externalEventId: activity.status.code,
            rawData: activity,
        }));
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const response = {
            trackingNumber,
            carrierCode: this.carrierCode,
            carrierName: this.carrierName,
            currentStatus: events[0]?.status || tracking_types_1.TrackingStatus.PENDING,
            events,
            estimatedDelivery: packageInfo.deliveryDate?.[0]?.date,
            lastUpdated: new Date(),
            isDelivered: events[0]?.status === tracking_types_1.TrackingStatus.DELIVERED,
            rawData: data,
        };
        return tracking_types_2.TrackingResponseSchema.parse(response);
    }
    mapUpsStatusToTrackingStatus(upsStatus) {
        const statusMap = {
            'I': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'D': tracking_types_1.TrackingStatus.DELIVERED,
            'X': tracking_types_1.TrackingStatus.EXCEPTION,
            'P': tracking_types_1.TrackingStatus.PENDING,
            'M': tracking_types_1.TrackingStatus.IN_TRANSIT,
            'O': tracking_types_1.TrackingStatus.OUT_FOR_DELIVERY,
        };
        return statusMap[upsStatus] || tracking_types_1.TrackingStatus.PENDING;
    }
    isTrackingNumberValid(trackingNumber) {
        const patterns = this.getTrackingNumberPatterns();
        return patterns.some(pattern => pattern.test(trackingNumber));
    }
    getTrackingNumberPatterns() {
        return [
            /^1Z[0-9A-Z]{16}$/i,
            /^[0-9]{12}$/,
            /^T\d{10}$/i,
        ];
    }
    async healthCheck() {
        try {
            const response = await this.httpClient.get('/health', { timeout: 5000 });
            return response.status === 200;
        }
        catch (error) {
            console.error('UPS health check failed:', error.message);
            return false;
        }
    }
}
exports.UpsAdapter = UpsAdapter;


/***/ }),

/***/ "./src/app.module.ts":
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const event_emitter_1 = __webpack_require__(/*! @nestjs/event-emitter */ "@nestjs/event-emitter");
const database_config_1 = __webpack_require__(/*! ./config/database.config */ "./src/config/database.config.ts");
const storage_config_1 = __webpack_require__(/*! ./shared/config/storage.config */ "./src/shared/config/storage.config.ts");
const tracking_controller_1 = __webpack_require__(/*! ./controllers/tracking.controller */ "./src/controllers/tracking.controller.ts");
const shipping_rate_controller_1 = __webpack_require__(/*! ./controllers/shipping-rate.controller */ "./src/controllers/shipping-rate.controller.ts");
const customer_controller_1 = __webpack_require__(/*! ./controllers/customer.controller */ "./src/controllers/customer.controller.ts");
const inventory_controller_1 = __webpack_require__(/*! ./controllers/inventory.controller */ "./src/controllers/inventory.controller.ts");
const document_controller_1 = __webpack_require__(/*! ./controllers/document.controller */ "./src/controllers/document.controller.ts");
const notification_controller_1 = __webpack_require__(/*! ./controllers/notification.controller */ "./src/controllers/notification.controller.ts");
const notification_test_controller_1 = __webpack_require__(/*! ./controllers/notification-test.controller */ "./src/controllers/notification-test.controller.ts");
const tracking_service_1 = __webpack_require__(/*! ./services/tracking.service */ "./src/services/tracking.service.ts");
const shipping_rate_service_1 = __webpack_require__(/*! ./services/shipping-rate.service */ "./src/services/shipping-rate.service.ts");
const customer_service_1 = __webpack_require__(/*! ./services/customer.service */ "./src/services/customer.service.ts");
const inventory_service_1 = __webpack_require__(/*! ./services/inventory.service */ "./src/services/inventory.service.ts");
const document_service_1 = __webpack_require__(/*! ./services/document.service */ "./src/services/document.service.ts");
const notification_service_1 = __webpack_require__(/*! ./services/notification.service */ "./src/services/notification.service.ts");
const notification_simple_service_1 = __webpack_require__(/*! ./services/notification-simple.service */ "./src/services/notification-simple.service.ts");
const carrier_adapter_factory_1 = __webpack_require__(/*! ./services/carrier-adapter.factory */ "./src/services/carrier-adapter.factory.ts");
const tracking_event_entity_1 = __webpack_require__(/*! ./entities/tracking-event.entity */ "./src/entities/tracking-event.entity.ts");
const carrier_key_entity_1 = __webpack_require__(/*! ./entities/carrier-key.entity */ "./src/entities/carrier-key.entity.ts");
const customer_entity_1 = __webpack_require__(/*! ./entities/customer.entity */ "./src/entities/customer.entity.ts");
const inventory_item_entity_1 = __webpack_require__(/*! ./entities/inventory-item.entity */ "./src/entities/inventory-item.entity.ts");
const warehouse_entity_1 = __webpack_require__(/*! ./entities/warehouse.entity */ "./src/entities/warehouse.entity.ts");
const document_entity_1 = __webpack_require__(/*! ./entities/document.entity */ "./src/entities/document.entity.ts");
const notification_entity_1 = __webpack_require__(/*! ./entities/notification.entity */ "./src/entities/notification.entity.ts");
const notification_preferences_entity_1 = __webpack_require__(/*! ./entities/notification-preferences.entity */ "./src/entities/notification-preferences.entity.ts");
const ups_adapter_1 = __webpack_require__(/*! ./adapters/ups-adapter */ "./src/adapters/ups-adapter.ts");
const fedex_adapter_1 = __webpack_require__(/*! ./adapters/fedex-adapter */ "./src/adapters/fedex-adapter.ts");
const maersk_adapter_1 = __webpack_require__(/*! ./adapters/maersk-adapter */ "./src/adapters/maersk-adapter.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 10,
                verboseMemoryLeak: true,
                ignoreErrors: false,
            }),
            platform_express_1.MulterModule.register(storage_config_1.storageConfig),
            mongoose_1.MongooseModule.forRootAsync({
                useFactory: database_config_1.getDatabaseConfig,
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: tracking_event_entity_1.TrackingEvent.name, schema: tracking_event_entity_1.TrackingEventSchema },
                { name: carrier_key_entity_1.CarrierKey.name, schema: carrier_key_entity_1.CarrierKeySchema },
                { name: customer_entity_1.Customer.name, schema: customer_entity_1.CustomerSchema },
                { name: inventory_item_entity_1.InventoryItem.name, schema: inventory_item_entity_1.InventoryItemSchema },
                { name: warehouse_entity_1.Warehouse.name, schema: warehouse_entity_1.WarehouseSchema },
                { name: document_entity_1.DocumentEntity.name, schema: document_entity_1.DocumentSchema },
                { name: notification_entity_1.NotificationEntity.name, schema: notification_entity_1.NotificationSchema },
                { name: notification_preferences_entity_1.NotificationPreferencesEntity.name, schema: notification_preferences_entity_1.NotificationPreferencesSchema },
            ]),
        ],
        controllers: [
            tracking_controller_1.TrackingController,
            shipping_rate_controller_1.ShippingRateController,
            customer_controller_1.CustomerController,
            inventory_controller_1.InventoryController,
            document_controller_1.DocumentController,
            notification_controller_1.NotificationController,
            notification_test_controller_1.NotificationTestController,
        ],
        providers: [
            tracking_service_1.TrackingService,
            shipping_rate_service_1.ShippingRateService,
            customer_service_1.CustomerService,
            inventory_service_1.InventoryService,
            document_service_1.DocumentService,
            notification_service_1.NotificationService,
            notification_simple_service_1.NotificationSimpleService,
            carrier_adapter_factory_1.CarrierAdapterFactory,
            ups_adapter_1.UpsAdapter,
            fedex_adapter_1.FedexAdapter,
            maersk_adapter_1.MaerskAdapter,
        ],
    })
], AppModule);


/***/ }),

/***/ "./src/config/database.config.ts":
/*!***************************************!*\
  !*** ./src/config/database.config.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDatabaseConfig = void 0;
const getDatabaseConfig = (configService) => {
    const uri = configService.get('MONGODB_URI') ||
        `mongodb://${configService.get('DB_HOST', 'localhost')}:${configService.get('DB_PORT', 27017)}/${configService.get('DB_NAME', 'shipment_tracking')}`;
    return {
        uri,
        connectionFactory: (connection) => {
            connection.on('connected', () => {
                console.log('Connected to MongoDB');
            });
            connection.on('error', (error) => {
                console.error('MongoDB connection error:', error);
            });
            return connection;
        },
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        authSource: configService.get('DB_AUTH_SOURCE', 'admin'),
        ...(configService.get('DB_USERNAME') && {
            auth: {
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
            },
        }),
        ...(configService.get('NODE_ENV') === 'production' && {
            ssl: true,
        }),
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
exports["default"] = exports.getDatabaseConfig;


/***/ }),

/***/ "./src/controllers/customer.controller.ts":
/*!************************************************!*\
  !*** ./src/controllers/customer.controller.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const customer_service_1 = __webpack_require__(/*! ../services/customer.service */ "./src/services/customer.service.ts");
let CustomerController = class CustomerController {
    constructor(customerService) {
        this.customerService = customerService;
    }
    async getCustomers(search, status, type, page, limit) {
        try {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            return await this.customerService.getCustomers({
                search,
                status,
                type,
                page: pageNum,
                limit: limitNum,
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve customers', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCustomer(id) {
        try {
            const customer = await this.customerService.getCustomerById(id);
            if (!customer) {
                throw new common_1.HttpException('Customer not found', common_1.HttpStatus.NOT_FOUND);
            }
            return customer;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to retrieve customer', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createCustomer(createCustomerDto) {
        try {
            this.validateCustomerData(createCustomerDto);
            return await this.customerService.createCustomer(createCustomerDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create customer', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateCustomer(id, updateCustomerDto) {
        try {
            const customer = await this.customerService.updateCustomer(id, updateCustomerDto);
            if (!customer) {
                throw new common_1.HttpException('Customer not found', common_1.HttpStatus.NOT_FOUND);
            }
            return customer;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to update customer', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteCustomer(id) {
        try {
            const deleted = await this.customerService.deleteCustomer(id);
            if (!deleted) {
                throw new common_1.HttpException('Customer not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'Customer deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to delete customer', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCustomerShipments(id, page, limit) {
        try {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            return await this.customerService.getCustomerShipments(id, pageNum, limitNum);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve customer shipments', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCustomerAnalytics(id) {
        try {
            return await this.customerService.getCustomerAnalytics(id);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve customer analytics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    validateCustomerData(data) {
        const errors = [];
        if (!data.name?.trim())
            errors.push('Name is required');
        if (!data.email?.trim())
            errors.push('Email is required');
        if (!data.phone?.trim())
            errors.push('Phone is required');
        if (!data.company?.trim())
            errors.push('Company is required');
        if (!data.address)
            errors.push('Address is required');
        if (!data.type)
            errors.push('Customer type is required');
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
        }
        if (data.address) {
            if (!data.address.street?.trim())
                errors.push('Street address is required');
            if (!data.address.city?.trim())
                errors.push('City is required');
            if (!data.address.state?.trim())
                errors.push('State is required');
            if (!data.address.zipCode?.trim())
                errors.push('Zip code is required');
            if (!data.address.country?.trim())
                errors.push('Country is required');
        }
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
};
exports.CustomerController = CustomerController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all customers with optional filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'search', description: 'Search by name, email, or company', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', description: 'Filter by status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'type', description: 'Filter by customer type', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: 'Page number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', description: 'Items per page', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customers retrieved successfully' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], CustomerController.prototype, "getCustomer", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new customer' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Customer name' },
                email: { type: 'string', description: 'Customer email' },
                phone: { type: 'string', description: 'Customer phone' },
                company: { type: 'string', description: 'Company name' },
                address: {
                    type: 'object',
                    properties: {
                        street: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        zipCode: { type: 'string' },
                        country: { type: 'string' },
                    },
                },
                type: { type: 'string', enum: ['shipper', 'consignee', 'both'] },
                creditLimit: { type: 'number', description: 'Credit limit in USD' },
                paymentTerms: { type: 'string', description: 'Payment terms' },
                preferredServices: { type: 'array', items: { type: 'string' } },
            },
            required: ['name', 'email', 'phone', 'company', 'address', 'type'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Customer created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], CustomerController.prototype, "createCustomer", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update customer by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], CustomerController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete customer by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Customer not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], CustomerController.prototype, "deleteCustomer", null);
__decorate([
    (0, common_1.Get)(':id/shipments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer shipment history' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: 'Page number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', description: 'Items per page', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer shipments retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerShipments", null);
__decorate([
    (0, common_1.Get)(':id/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer analytics and statistics' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Customer analytics retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerController.prototype, "getCustomerAnalytics", null);
exports.CustomerController = CustomerController = __decorate([
    (0, swagger_1.ApiTags)('customers'),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [typeof (_a = typeof customer_service_1.CustomerService !== "undefined" && customer_service_1.CustomerService) === "function" ? _a : Object])
], CustomerController);


/***/ }),

/***/ "./src/controllers/document.controller.ts":
/*!************************************************!*\
  !*** ./src/controllers/document.controller.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const document_service_1 = __webpack_require__(/*! ../services/document.service */ "./src/services/document.service.ts");
let DocumentController = class DocumentController {
    constructor(documentService) {
        this.documentService = documentService;
    }
    async getDocuments(type, category, status, shipmentId, customerId, search, page, limit) {
        try {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 20;
            return await this.documentService.getDocuments({
                type,
                category,
                status,
                shipmentId,
                customerId,
                search,
                page: pageNum,
                limit: limitNum,
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve documents', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDocument(id) {
        try {
            const document = await this.documentService.getDocumentById(id);
            if (!document) {
                throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
            }
            return document;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to retrieve document', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadDocument(file, createDocumentDto) {
        try {
            if (!file) {
                throw new common_1.HttpException('File is required', common_1.HttpStatus.BAD_REQUEST);
            }
            this.validateDocumentData(createDocumentDto);
            return await this.documentService.uploadDocument(file, createDocumentDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to upload document', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateDocument(id, updateDocumentDto) {
        try {
            const document = await this.documentService.updateDocument(id, updateDocumentDto);
            if (!document) {
                throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
            }
            return document;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to update document', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async approveDocument(id, approvalDto) {
        try {
            return await this.documentService.approveDocument(id, approvalDto.approvedBy, approvalDto.notes);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to approve document', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async rejectDocument(id, rejectionDto) {
        try {
            return await this.documentService.rejectDocument(id, rejectionDto.rejectedBy, rejectionDto.reason);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to reject document', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteDocument(id) {
        try {
            const deleted = await this.documentService.deleteDocument(id);
            if (!deleted) {
                throw new common_1.HttpException('Document not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'Document deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to delete document', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDocumentTypes() {
        try {
            return await this.documentService.getDocumentTypes();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve document types', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getExpiringDocuments(days) {
        try {
            const daysAhead = parseInt(days) || 30;
            return await this.documentService.getExpiringDocuments(daysAhead);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve expiring documents', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDocumentAnalytics() {
        try {
            return await this.documentService.getDocumentAnalytics();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve document analytics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    validateDocumentData(data) {
        const errors = [];
        if (!data.name?.trim())
            errors.push('Document name is required');
        if (!data.type?.trim())
            errors.push('Document type is required');
        if (!data.category?.trim())
            errors.push('Document category is required');
        if (!data.uploadedBy?.trim())
            errors.push('Uploader ID is required');
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
};
exports.DocumentController = DocumentController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all documents with filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'type', description: 'Filter by document type', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'category', description: 'Filter by category', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', description: 'Filter by status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'shipmentId', description: 'Filter by shipment ID', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'customerId', description: 'Filter by customer ID', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', description: 'Search by name or tags', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: 'Page number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', description: 'Items per page', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Documents retrieved successfully' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('shipmentId')),
    __param(4, (0, common_1.Query)('customerId')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Document ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], DocumentController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a new document' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                name: { type: 'string' },
                type: { type: 'string' },
                category: { type: 'string' },
                shipmentId: { type: 'string' },
                customerId: { type: 'string' },
                uploadedBy: { type: 'string' },
                expiryDate: { type: 'string', format: 'date' },
                tags: { type: 'string', description: 'Comma-separated tags' },
                metadata: { type: 'string', description: 'JSON metadata' },
            },
            required: ['file', 'name', 'type', 'category', 'uploadedBy'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Document uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or data' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof Express !== "undefined" && (_c = Express.Multer) !== void 0 && _c.File) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], DocumentController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update document metadata' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Document ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_f = typeof Partial !== "undefined" && Partial) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], DocumentController.prototype, "updateDocument", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve document' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Document ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                approvedBy: { type: 'string', description: 'Approver ID' },
                notes: { type: 'string', description: 'Approval notes' },
            },
            required: ['approvedBy'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document approved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], DocumentController.prototype, "approveDocument", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject document' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Document ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                rejectedBy: { type: 'string', description: 'Rejector ID' },
                reason: { type: 'string', description: 'Rejection reason' },
            },
            required: ['rejectedBy', 'reason'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document rejected successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], DocumentController.prototype, "rejectDocument", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete document' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Document ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Document not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], DocumentController.prototype, "deleteDocument", null);
__decorate([
    (0, common_1.Get)('types/available'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available document types and categories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document types retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDocumentTypes", null);
__decorate([
    (0, common_1.Get)('expiring/soon'),
    (0, swagger_1.ApiOperation)({ summary: 'Get documents expiring soon' }),
    (0, swagger_1.ApiQuery)({ name: 'days', description: 'Days ahead to check for expiry', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Expiring documents retrieved successfully' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], DocumentController.prototype, "getExpiringDocuments", null);
__decorate([
    (0, common_1.Get)('analytics/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document analytics and statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document analytics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDocumentAnalytics", null);
exports.DocumentController = DocumentController = __decorate([
    (0, swagger_1.ApiTags)('documents'),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [typeof (_a = typeof document_service_1.DocumentService !== "undefined" && document_service_1.DocumentService) === "function" ? _a : Object])
], DocumentController);


/***/ }),

/***/ "./src/controllers/inventory.controller.ts":
/*!*************************************************!*\
  !*** ./src/controllers/inventory.controller.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InventoryController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const inventory_service_1 = __webpack_require__(/*! ../services/inventory.service */ "./src/services/inventory.service.ts");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getInventoryItems(search, category, status, warehouse, page, limit) {
        try {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 20;
            return await this.inventoryService.getInventoryItems({
                search,
                category,
                status,
                warehouse,
                page: pageNum,
                limit: limitNum,
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve inventory items', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getInventoryItem(id) {
        try {
            const item = await this.inventoryService.getInventoryItemById(id);
            if (!item) {
                throw new common_1.HttpException('Inventory item not found', common_1.HttpStatus.NOT_FOUND);
            }
            return item;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to retrieve inventory item', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createInventoryItem(createItemDto) {
        try {
            this.validateInventoryItemData(createItemDto);
            return await this.inventoryService.createInventoryItem(createItemDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create inventory item', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateInventoryItem(id, updateItemDto) {
        try {
            const item = await this.inventoryService.updateInventoryItem(id, updateItemDto);
            if (!item) {
                throw new common_1.HttpException('Inventory item not found', common_1.HttpStatus.NOT_FOUND);
            }
            return item;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to update inventory item', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteInventoryItem(id) {
        try {
            const deleted = await this.inventoryService.deleteInventoryItem(id);
            if (!deleted) {
                throw new common_1.HttpException('Inventory item not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'Inventory item deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to delete inventory item', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getWarehouses() {
        try {
            return await this.inventoryService.getWarehouses();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve warehouses', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getWarehouse(id) {
        try {
            const warehouse = await this.inventoryService.getWarehouseById(id);
            if (!warehouse) {
                throw new common_1.HttpException('Warehouse not found', common_1.HttpStatus.NOT_FOUND);
            }
            return warehouse;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to retrieve warehouse', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getInventoryAnalytics() {
        try {
            return await this.inventoryService.getInventoryAnalytics();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve inventory analytics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async reserveInventory(id, reservationDto) {
        try {
            return await this.inventoryService.reserveInventory(id, reservationDto.quantity, reservationDto.reason);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to reserve inventory', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async restockInventory(id, restockDto) {
        try {
            return await this.inventoryService.restockInventory(id, restockDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to restock inventory', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    validateInventoryItemData(data) {
        const errors = [];
        if (!data.sku?.trim())
            errors.push('SKU is required');
        if (!data.name?.trim())
            errors.push('Name is required');
        if (!data.category?.trim())
            errors.push('Category is required');
        if (!data.quantity || data.quantity < 0)
            errors.push('Valid quantity is required');
        if (!data.unitPrice || data.unitPrice < 0)
            errors.push('Valid unit price is required');
        if (!data.supplier?.trim())
            errors.push('Supplier is required');
        if (!data.location) {
            errors.push('Location is required');
        }
        else {
            if (!data.location.warehouse?.trim())
                errors.push('Warehouse is required');
            if (!data.location.zone?.trim())
                errors.push('Zone is required');
            if (!data.location.aisle?.trim())
                errors.push('Aisle is required');
            if (!data.location.shelf?.trim())
                errors.push('Shelf is required');
        }
        if (!data.dimensions) {
            errors.push('Dimensions are required');
        }
        else {
            if (!data.dimensions.length || data.dimensions.length <= 0)
                errors.push('Valid length is required');
            if (!data.dimensions.width || data.dimensions.width <= 0)
                errors.push('Valid width is required');
            if (!data.dimensions.height || data.dimensions.height <= 0)
                errors.push('Valid height is required');
            if (!data.dimensions.weight || data.dimensions.weight <= 0)
                errors.push('Valid weight is required');
        }
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all inventory items with filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'search', description: 'Search by SKU, name, or description', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'category', description: 'Filter by category', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', description: 'Filter by status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'warehouse', description: 'Filter by warehouse', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: 'Page number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', description: 'Items per page', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory items retrieved successfully' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('warehouse')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryItems", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory item by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inventory item ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory item retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Inventory item not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], InventoryController.prototype, "getInventoryItem", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new inventory item' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Inventory item created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], InventoryController.prototype, "createInventoryItem", null);
__decorate([
    (0, common_1.Put)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update inventory item by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inventory item ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory item updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Inventory item not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof Partial !== "undefined" && Partial) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], InventoryController.prototype, "updateInventoryItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete inventory item by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inventory item ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory item deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Inventory item not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], InventoryController.prototype, "deleteInventoryItem", null);
__decorate([
    (0, common_1.Get)('warehouses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all warehouses' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Warehouses retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], InventoryController.prototype, "getWarehouses", null);
__decorate([
    (0, common_1.Get)('warehouses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get warehouse by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Warehouse ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Warehouse retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Warehouse not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], InventoryController.prototype, "getWarehouse", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory analytics and statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory analytics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getInventoryAnalytics", null);
__decorate([
    (0, common_1.Post)('items/:id/reserve'),
    (0, swagger_1.ApiOperation)({ summary: 'Reserve inventory quantity' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inventory item ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                quantity: { type: 'number', description: 'Quantity to reserve' },
                reason: { type: 'string', description: 'Reason for reservation' },
            },
            required: ['quantity'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory reserved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "reserveInventory", null);
__decorate([
    (0, common_1.Post)('items/:id/restock'),
    (0, swagger_1.ApiOperation)({ summary: 'Restock inventory item' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Inventory item ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                quantity: { type: 'number', description: 'Quantity to add' },
                unitPrice: { type: 'number', description: 'Unit price for new stock' },
                supplier: { type: 'string', description: 'Supplier name' },
            },
            required: ['quantity'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inventory restocked successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "restockInventory", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('inventory'),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [typeof (_a = typeof inventory_service_1.InventoryService !== "undefined" && inventory_service_1.InventoryService) === "function" ? _a : Object])
], InventoryController);


/***/ }),

/***/ "./src/controllers/notification-test.controller.ts":
/*!*********************************************************!*\
  !*** ./src/controllers/notification-test.controller.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationTestController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const notification_simple_service_1 = __webpack_require__(/*! ../services/notification-simple.service */ "./src/services/notification-simple.service.ts");
let NotificationTestController = class NotificationTestController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async getNotifications(type, priority, status, recipient, unreadOnly, page, limit) {
        try {
            return await this.notificationService.getNotifications({
                type,
                priority,
                status,
                recipient,
                unreadOnly: unreadOnly === 'true',
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNotification(id) {
        try {
            return await this.notificationService.getNotificationById(id);
        }
        catch (error) {
            throw new common_1.HttpException('Notification not found', common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createNotification(createNotificationDto) {
        try {
            return await this.notificationService.createNotification(createNotificationDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async markAsRead(id, readDto) {
        try {
            return await this.notificationService.markAsRead(id, readDto.userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async bulkMarkAsRead(bulkReadDto) {
        try {
            const result = await this.notificationService.markMultipleAsRead(bulkReadDto.notificationIds, bulkReadDto.userId);
            return { updated: result.count };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteNotification(id, body) {
        try {
            await this.notificationService.deleteNotification(id, body.userId);
            return { message: 'Notification deleted successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getNotificationPreferences(userId) {
        try {
            return await this.notificationService.getNotificationPreferences(userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateNotificationPreferences(userId, preferences) {
        try {
            return await this.notificationService.updateNotificationPreferences(userId, preferences);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    notificationStream(userId) {
        return this.notificationService.subscribeToNotifications(userId).pipe((0, operators_1.map)(notification => ({
            data: JSON.stringify(notification),
        })));
    }
    async sendShipmentUpdateNotification(updateDto) {
        try {
            const notification = {
                type: 'shipment_update',
                priority: 'medium',
                title: 'Shipment Update',
                message: `Your shipment ${updateDto.trackingNumber} has been updated`,
                data: {
                    trackingNumber: updateDto.trackingNumber,
                    status: updateDto.status,
                    location: updateDto.location,
                },
                recipients: updateDto.recipients || ['test-user-1'],
                channels: ['in_app', 'email'],
                createdBy: 'system',
            };
            return await this.notificationService.createNotification(notification);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async sendDeliveryAlertNotification(alertDto) {
        try {
            const notification = {
                type: 'delivery_alert',
                priority: 'high',
                title: 'Delivery Alert',
                message: `Your package ${alertDto.trackingNumber} is out for delivery`,
                data: {
                    trackingNumber: alertDto.trackingNumber,
                    estimatedDelivery: alertDto.estimatedDelivery,
                    carrier: alertDto.carrier,
                },
                recipients: alertDto.recipients || ['test-user-1'],
                channels: ['in_app', 'email', 'sms'],
                createdBy: 'system',
            };
            return await this.notificationService.createNotification(notification);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getNotificationAnalytics() {
        return {
            totalNotifications: 0,
            unreadCount: 0,
            byType: {
                shipment_update: 0,
                delivery_alert: 0,
                customs_clearance: 0,
                document_required: 0,
                payment_due: 0,
                system_alert: 0,
            },
            byPriority: {
                low: 0,
                medium: 0,
                high: 0,
                critical: 0,
            },
            byStatus: {
                pending: 0,
                sent: 0,
                delivered: 0,
                failed: 0,
                read: 0,
            },
        };
    }
    validateNotificationData(data) {
        if (!data.type || !data.priority || !data.title || !data.message) {
            throw new Error('Missing required notification fields');
        }
        if (!data.recipients || data.recipients.length === 0) {
            throw new Error('At least one recipient is required');
        }
        if (!data.channels || data.channels.length === 0) {
            throw new Error('At least one notification channel is required');
        }
    }
};
exports.NotificationTestController = NotificationTestController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all notifications with filters' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('priority')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('recipient')),
    __param(4, (0, common_1.Query)('unreadOnly')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single notification by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "getNotification", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new notification' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Put)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a notification as read' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('read-multiple'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark multiple notifications as read' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "bulkMarkAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a notification' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Get)('preferences/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notification preferences' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "getNotificationPreferences", null);
__decorate([
    (0, common_1.Put)('preferences/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user notification preferences' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof Partial !== "undefined" && Partial) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, common_1.Sse)('stream/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'SSE endpoint for real-time notifications' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_c = typeof rxjs_1.Observable !== "undefined" && rxjs_1.Observable) === "function" ? _c : Object)
], NotificationTestController.prototype, "notificationStream", null);
__decorate([
    (0, common_1.Post)('test/shipment-update'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a test shipment update notification' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "sendShipmentUpdateNotification", null);
__decorate([
    (0, common_1.Post)('test/delivery-alert'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a test delivery alert notification' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationTestController.prototype, "sendDeliveryAlertNotification", null);
__decorate([
    (0, common_1.Get)('analytics/overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification analytics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationTestController.prototype, "getNotificationAnalytics", null);
exports.NotificationTestController = NotificationTestController = __decorate([
    (0, common_1.Controller)('notifications-test'),
    (0, swagger_1.ApiTags)('notifications-test'),
    __metadata("design:paramtypes", [typeof (_a = typeof notification_simple_service_1.NotificationSimpleService !== "undefined" && notification_simple_service_1.NotificationSimpleService) === "function" ? _a : Object])
], NotificationTestController);


/***/ }),

/***/ "./src/controllers/notification.controller.ts":
/*!****************************************************!*\
  !*** ./src/controllers/notification.controller.ts ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const notification_service_1 = __webpack_require__(/*! ../services/notification.service */ "./src/services/notification.service.ts");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async getNotifications(type, priority, status, recipient, unreadOnly, page, limit) {
        try {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 20;
            return await this.notificationService.getNotifications({
                type,
                priority,
                status,
                recipient,
                unreadOnly: unreadOnly === 'true',
                page: pageNum,
                limit: limitNum,
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve notifications', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNotification(id) {
        try {
            const notification = await this.notificationService.getNotificationById(id);
            if (!notification) {
                throw new common_1.HttpException('Notification not found', common_1.HttpStatus.NOT_FOUND);
            }
            return notification;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to retrieve notification', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createNotification(createNotificationDto) {
        try {
            this.validateNotificationData(createNotificationDto);
            return await this.notificationService.createNotification(createNotificationDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create notification', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async markAsRead(id, readDto) {
        try {
            return await this.notificationService.markAsRead(id, readDto.userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to mark notification as read', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async bulkMarkAsRead(bulkReadDto) {
        try {
            const updated = await this.notificationService.bulkMarkAsRead(bulkReadDto.notificationIds, bulkReadDto.userId);
            return { updated };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to mark notifications as read', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteNotification(id) {
        try {
            const deleted = await this.notificationService.deleteNotification(id);
            if (!deleted) {
                throw new common_1.HttpException('Notification not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'Notification deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message || 'Failed to delete notification', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNotificationPreferences(userId) {
        try {
            return await this.notificationService.getNotificationPreferences(userId);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve notification preferences', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateNotificationPreferences(userId, preferences) {
        try {
            return await this.notificationService.updateNotificationPreferences(userId, preferences);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update notification preferences', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    notificationStream(userId) {
        return this.notificationService.getNotificationStream(userId);
    }
    async sendShipmentUpdateNotification(updateDto) {
        try {
            return await this.notificationService.sendShipmentUpdateNotification(updateDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to send shipment update notification', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async sendDeliveryAlertNotification(alertDto) {
        try {
            return await this.notificationService.sendDeliveryAlertNotification(alertDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to send delivery alert notification', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getNotificationAnalytics() {
        try {
            return await this.notificationService.getNotificationAnalytics();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve notification analytics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    validateNotificationData(data) {
        const errors = [];
        if (!data.type?.trim())
            errors.push('Notification type is required');
        if (!data.priority?.trim())
            errors.push('Priority is required');
        if (!data.title?.trim())
            errors.push('Title is required');
        if (!data.message?.trim())
            errors.push('Message is required');
        if (!data.recipients || data.recipients.length === 0)
            errors.push('At least one recipient is required');
        if (!data.channels || data.channels.length === 0)
            errors.push('At least one notification channel is required');
        if (!data.createdBy?.trim())
            errors.push('Creator ID is required');
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get notifications with filtering' }),
    (0, swagger_1.ApiQuery)({ name: 'type', description: 'Filter by notification type', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'priority', description: 'Filter by priority', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', description: 'Filter by status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'recipient', description: 'Filter by recipient', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'unreadOnly', description: 'Show only unread notifications', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', description: 'Page number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', description: 'Items per page', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('priority')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('recipient')),
    __param(4, (0, common_1.Query)('unreadOnly')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Notification ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], NotificationController.prototype, "getNotification", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create and send a new notification' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['shipment_update', 'delivery_alert', 'customs_clearance', 'document_required', 'payment_due', 'system_alert'] },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                title: { type: 'string', description: 'Notification title' },
                message: { type: 'string', description: 'Notification message' },
                data: { type: 'object', description: 'Additional notification data' },
                recipients: { type: 'array', items: { type: 'string' }, description: 'Recipient user IDs' },
                channels: { type: 'array', items: { type: 'string', enum: ['email', 'sms', 'push', 'in_app'] } },
                scheduledAt: { type: 'string', format: 'date-time', description: 'Schedule notification for later' },
                expiresAt: { type: 'string', format: 'date-time', description: 'Notification expiry time' },
                createdBy: { type: 'string', description: 'Creator user ID' },
            },
            required: ['type', 'priority', 'title', 'message', 'recipients', 'channels', 'createdBy'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification created and sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid notification data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], NotificationController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Put)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Notification ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', description: 'User ID who read the notification' },
            },
            required: ['userId'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Put)('bulk/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark multiple notifications as read' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                notificationIds: { type: 'array', items: { type: 'string' } },
                userId: { type: 'string', description: 'User ID who read the notifications' },
            },
            required: ['notificationIds', 'userId'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications marked as read' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], NotificationController.prototype, "bulkMarkAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete notification' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Notification ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], NotificationController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Get)('preferences/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notification preferences' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], NotificationController.prototype, "getNotificationPreferences", null);
__decorate([
    (0, common_1.Put)('preferences/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user notification preferences' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preferences updated successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_h = typeof Partial !== "undefined" && Partial) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], NotificationController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, common_1.Sse)('stream/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Server-Sent Events stream for real-time notifications' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID for notification stream' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SSE stream established' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_k = typeof rxjs_1.Observable !== "undefined" && rxjs_1.Observable) === "function" ? _k : Object)
], NotificationController.prototype, "notificationStream", null);
__decorate([
    (0, common_1.Post)('send/shipment-update'),
    (0, swagger_1.ApiOperation)({ summary: 'Send shipment update notification' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                trackingNumber: { type: 'string' },
                status: { type: 'string' },
                location: { type: 'string' },
                estimatedDelivery: { type: 'string', format: 'date-time' },
                recipients: { type: 'array', items: { type: 'string' } },
                createdBy: { type: 'string' },
            },
            required: ['trackingNumber', 'status', 'recipients', 'createdBy'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipment update notification sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], NotificationController.prototype, "sendShipmentUpdateNotification", null);
__decorate([
    (0, common_1.Post)('send/delivery-alert'),
    (0, swagger_1.ApiOperation)({ summary: 'Send delivery alert notification' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                trackingNumber: { type: 'string' },
                deliveryDate: { type: 'string', format: 'date-time' },
                deliveryAddress: { type: 'string' },
                recipients: { type: 'array', items: { type: 'string' } },
                createdBy: { type: 'string' },
            },
            required: ['trackingNumber', 'deliveryDate', 'recipients', 'createdBy'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery alert notification sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], NotificationController.prototype, "sendDeliveryAlertNotification", null);
__decorate([
    (0, common_1.Get)('analytics/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification analytics and statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification analytics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationAnalytics", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [typeof (_a = typeof notification_service_1.NotificationService !== "undefined" && notification_service_1.NotificationService) === "function" ? _a : Object])
], NotificationController);


/***/ }),

/***/ "./src/controllers/shipping-rate.controller.ts":
/*!*****************************************************!*\
  !*** ./src/controllers/shipping-rate.controller.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShippingRateController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const shipping_rate_service_1 = __webpack_require__(/*! ../services/shipping-rate.service */ "./src/services/shipping-rate.service.ts");
let ShippingRateController = class ShippingRateController {
    constructor(shippingRateService) {
        this.shippingRateService = shippingRateService;
    }
    async calculateRates(request) {
        try {
            this.validateRequest(request);
            return await this.shippingRateService.calculateRates(request);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to calculate shipping rates', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async refreshRates(rateIds) {
        try {
            const ids = rateIds.split(',').map(id => parseInt(id.trim()));
            return await this.shippingRateService.refreshRates(ids);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to refresh rates', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getLocationSuggestions(query) {
        try {
            return await this.shippingRateService.getLocationSuggestions(query);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get location suggestions', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPackageTypes() {
        try {
            return await this.shippingRateService.getPackageTypes();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get package types', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    validateRequest(request) {
        const errors = [];
        if (!request.origin?.trim())
            errors.push('Origin is required');
        if (!request.destination?.trim())
            errors.push('Destination is required');
        if (!request.weight || request.weight <= 0)
            errors.push('Valid weight is required');
        if (!request.length || request.length <= 0)
            errors.push('Valid length is required');
        if (!request.width || request.width <= 0)
            errors.push('Valid width is required');
        if (!request.height || request.height <= 0)
            errors.push('Valid height is required');
        if (!request.commodity?.trim())
            errors.push('Commodity description is required');
        if (!request.value || request.value <= 0)
            errors.push('Cargo value is required');
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
    }
};
exports.ShippingRateController = ShippingRateController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate shipping rates for a shipment' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                origin: { type: 'string', description: 'Origin location' },
                destination: { type: 'string', description: 'Destination location' },
                weight: { type: 'number', description: 'Weight in pounds' },
                length: { type: 'number', description: 'Length in inches' },
                width: { type: 'number', description: 'Width in inches' },
                height: { type: 'number', description: 'Height in inches' },
                serviceType: { type: 'string', enum: ['all', 'ocean', 'air', 'ground'] },
                packageType: { type: 'string', description: 'Package type' },
                commodity: { type: 'string', description: 'Commodity description' },
                value: { type: 'number', description: 'Cargo value in USD' },
                insurance: { type: 'boolean', description: 'Include insurance' },
                urgency: { type: 'string', enum: ['standard', 'express', 'urgent', 'critical'] },
                incoterms: { type: 'string', enum: ['EXW', 'FOB', 'CIF', 'DDP'] },
            },
            required: ['origin', 'destination', 'weight', 'length', 'width', 'height', 'commodity', 'value'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipping rates calculated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request parameters' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], ShippingRateController.prototype, "calculateRates", null);
__decorate([
    (0, common_1.Get)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Get refreshed rates with market fluctuations' }),
    (0, swagger_1.ApiQuery)({ name: 'rateIds', description: 'Comma-separated rate IDs to refresh' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refreshed rates retrieved successfully' }),
    __param(0, (0, common_1.Query)('rateIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ShippingRateController.prototype, "refreshRates", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get location suggestions for autocomplete' }),
    (0, swagger_1.ApiQuery)({ name: 'query', description: 'Search query for locations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Location suggestions retrieved successfully' }),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ShippingRateController.prototype, "getLocationSuggestions", null);
__decorate([
    (0, common_1.Get)('package-types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available package types with descriptions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Package types retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShippingRateController.prototype, "getPackageTypes", null);
exports.ShippingRateController = ShippingRateController = __decorate([
    (0, swagger_1.ApiTags)('shipping-rates'),
    (0, common_1.Controller)('shipping-rates'),
    __metadata("design:paramtypes", [typeof (_a = typeof shipping_rate_service_1.ShippingRateService !== "undefined" && shipping_rate_service_1.ShippingRateService) === "function" ? _a : Object])
], ShippingRateController);


/***/ }),

/***/ "./src/controllers/tracking.controller.ts":
/*!************************************************!*\
  !*** ./src/controllers/tracking.controller.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrackingController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const tracking_service_1 = __webpack_require__(/*! ../services/tracking.service */ "./src/services/tracking.service.ts");
let TrackingController = class TrackingController {
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    async trackShipment(trackingNumber, carrierCode) {
        if (!trackingNumber) {
            throw new common_1.HttpException('Tracking number is required', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.trackingService.trackShipment(trackingNumber, carrierCode);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to track shipment', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async trackBatchShipments(batchRequest) {
        const { trackingNumbers, carrierCode } = batchRequest;
        if (!trackingNumbers || !Array.isArray(trackingNumbers) || trackingNumbers.length === 0) {
            throw new common_1.HttpException('Tracking numbers array is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (trackingNumbers.length > 50) {
            throw new common_1.HttpException('Maximum 50 tracking numbers allowed per batch', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.trackingService.trackBatchShipments({ trackingNumbers, carrierCode });
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to process batch tracking', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAvailableCarriers() {
        try {
            return await this.trackingService.getAvailableCarriers();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve carriers', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    trackingEvents(trackingNumber, carrierCode) {
        return (0, rxjs_1.interval)(10000).pipe((0, rxjs_1.map)(async () => {
            try {
                const trackingData = await this.trackingService.trackShipment(trackingNumber, carrierCode);
                return {
                    data: JSON.stringify({
                        type: 'tracking_update',
                        trackingNumber,
                        carrierCode: trackingData.carrierCode,
                        data: trackingData,
                        timestamp: new Date().toISOString(),
                    }),
                };
            }
            catch (error) {
                return {
                    data: JSON.stringify({
                        type: 'error',
                        trackingNumber,
                        error: error.message,
                        timestamp: new Date().toISOString(),
                    }),
                };
            }
        }));
    }
    async getHealthStatus() {
        try {
            return await this.trackingService.getHealthStatus();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to get health status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, common_1.Get)('track'),
    (0, swagger_1.ApiOperation)({ summary: 'Track a single shipment' }),
    (0, swagger_1.ApiQuery)({ name: 'trackingNumber', description: 'Tracking number to search for' }),
    (0, swagger_1.ApiQuery)({ name: 'carrierCode', description: 'Carrier code (optional)', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tracking information retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tracking number not found' }),
    __param(0, (0, common_1.Query)('trackingNumber')),
    __param(1, (0, common_1.Query)('carrierCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "trackShipment", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Track multiple shipments in batch' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                trackingNumbers: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of tracking numbers',
                },
                carrierCode: {
                    type: 'string',
                    description: 'Optional carrier code for all tracking numbers',
                },
            },
            required: ['trackingNumbers'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch tracking completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "trackBatchShipments", null);
__decorate([
    (0, common_1.Get)('carriers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available carriers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Available carriers retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getAvailableCarriers", null);
__decorate([
    (0, common_1.Sse)('events/:trackingNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Server-Sent Events for real-time tracking updates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SSE stream established' }),
    __param(0, (0, common_1.Param)('trackingNumber')),
    __param(1, (0, common_1.Query)('carrierCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_b = typeof rxjs_1.Observable !== "undefined" && rxjs_1.Observable) === "function" ? _b : Object)
], TrackingController.prototype, "trackingEvents", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getHealthStatus", null);
exports.TrackingController = TrackingController = __decorate([
    (0, swagger_1.ApiTags)('tracking'),
    (0, common_1.Controller)('tracking'),
    __metadata("design:paramtypes", [typeof (_a = typeof tracking_service_1.TrackingService !== "undefined" && tracking_service_1.TrackingService) === "function" ? _a : Object])
], TrackingController);


/***/ }),

/***/ "./src/entities/carrier-key.entity.ts":
/*!********************************************!*\
  !*** ./src/entities/carrier-key.entity.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CarrierKeySchema = exports.CarrierKey = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let CarrierKey = class CarrierKey {
    validateTrackingNumber(trackingNumber) {
        if (!this.trackingNumberPattern)
            return true;
        const regex = new RegExp(this.trackingNumberPattern);
        return regex.test(trackingNumber);
    }
    incrementUsage() {
        this.usageCount += 1;
        this.lastUsedAt = new Date();
    }
    isRateLimited(requestsInLastMinute) {
        return requestsInLastMinute >= this.rateLimitPerMinute;
    }
    isExpired() {
        return this.expiresAt ? new Date() > this.expiresAt : false;
    }
    canBeUsed() {
        return this.isActive && !this.isExpired();
    }
};
exports.CarrierKey = CarrierKey;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], CarrierKey.prototype, "carrierCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['UPS', 'FEDEX', 'MAERSK', 'DHL', 'USPS', 'GENERIC_REST', 'GENERIC_GRAPHQL'], index: true }),
    __metadata("design:type", String)
], CarrierKey.prototype, "carrierType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CarrierKey.prototype, "carrierName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CarrierKey.prototype, "apiKey", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CarrierKey.prototype, "apiSecret", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CarrierKey.prototype, "baseUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], CarrierKey.prototype, "trackingNumberPattern", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1000 }),
    __metadata("design:type", Number)
], CarrierKey.prototype, "rateLimitPerMinute", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 30000 }),
    __metadata("design:type", Number)
], CarrierKey.prototype, "timeout", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 3 }),
    __metadata("design:type", Number)
], CarrierKey.prototype, "retries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], CarrierKey.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CarrierKey.prototype, "config", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], CarrierKey.prototype, "usageCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], CarrierKey.prototype, "lastUsedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], CarrierKey.prototype, "expiresAt", void 0);
exports.CarrierKey = CarrierKey = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'carrier_keys',
    })
], CarrierKey);
exports.CarrierKeySchema = mongoose_1.SchemaFactory.createForClass(CarrierKey);
exports.CarrierKeySchema.index({ carrierCode: 1, isActive: 1 });
exports.CarrierKeySchema.index({ carrierType: 1, isActive: 1 });
exports.CarrierKeySchema.index({ lastUsedAt: -1, usageCount: -1 });
exports.CarrierKeySchema.index({ expiresAt: 1 }, { sparse: true });
exports.CarrierKeySchema.methods.validateTrackingNumber = function (trackingNumber) {
    if (!this.trackingNumberPattern)
        return true;
    const regex = new RegExp(this.trackingNumberPattern);
    return regex.test(trackingNumber);
};
exports.CarrierKeySchema.methods.incrementUsage = function () {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
};
exports.CarrierKeySchema.methods.isRateLimited = function (requestsInLastMinute) {
    return requestsInLastMinute >= this.rateLimitPerMinute;
};
exports.CarrierKeySchema.methods.isExpired = function () {
    return this.expiresAt ? new Date() > this.expiresAt : false;
};
exports.CarrierKeySchema.methods.canBeUsed = function () {
    return this.isActive && !this.isExpired();
};
exports.CarrierKeySchema.statics.findActiveByCarrier = function (carrierCode) {
    return this.findOne({ carrierCode, isActive: true });
};
exports.CarrierKeySchema.statics.findActiveCarriers = function () {
    return this.find({ isActive: true }).select('carrierCode carrierName carrierType');
};


/***/ }),

/***/ "./src/entities/customer.entity.ts":
/*!*****************************************!*\
  !*** ./src/entities/customer.entity.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerSchema = exports.Customer = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let Customer = class Customer {
};
exports.Customer = Customer;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Customer.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Customer.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Customer.prototype, "company", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Customer.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['active', 'inactive', 'pending'], default: 'active' }),
    __metadata("design:type", String)
], Customer.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['shipper', 'consignee', 'both'], required: true }),
    __metadata("design:type", String)
], Customer.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "creditLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Net 30' }),
    __metadata("design:type", String)
], Customer.prototype, "paymentTerms", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Customer.prototype, "preferredServices", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "totalShipments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Customer.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Customer.prototype, "lastActivity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Customer.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Customer.prototype, "updatedAt", void 0);
exports.Customer = Customer = __decorate([
    (0, mongoose_1.Schema)({ collection: 'customers' })
], Customer);
exports.CustomerSchema = mongoose_1.SchemaFactory.createForClass(Customer);


/***/ }),

/***/ "./src/entities/document.entity.ts":
/*!*****************************************!*\
  !*** ./src/entities/document.entity.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentSchema = exports.DocumentEntity = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let DocumentEntity = class DocumentEntity {
};
exports.DocumentEntity = DocumentEntity;
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        trim: true,
        index: 'text',
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['commercial_invoice', 'packing_list', 'bill_of_lading', 'certificate_of_origin', 'customs_declaration', 'insurance_certificate', 'other'],
        required: true,
        index: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['customs', 'shipping', 'insurance', 'compliance', 'financial'],
        required: true,
        index: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        index: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "shipmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        index: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Number,
        required: true,
        min: 0,
        set: (v) => Math.round(v),
    }),
    __metadata("design:type", Number)
], DocumentEntity.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['pending', 'approved', 'rejected', 'expired'],
        default: 'pending',
        index: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required: true,
        index: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "uploadedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        index: true,
    }),
    __metadata("design:type", String)
], DocumentEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        index: true,
    }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], DocumentEntity.prototype, "expiryDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        default: [],
        index: true,
    }),
    __metadata("design:type", Array)
], DocumentEntity.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: {},
    }),
    __metadata("design:type", Object)
], DocumentEntity.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: Date.now,
        index: true,
    }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], DocumentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Date,
        default: Date.now,
    }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], DocumentEntity.prototype, "updatedAt", void 0);
exports.DocumentEntity = DocumentEntity = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'documents',
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })
], DocumentEntity);
exports.DocumentSchema = mongoose_1.SchemaFactory.createForClass(DocumentEntity);
exports.DocumentSchema.index({ customerId: 1, status: 1 });
exports.DocumentSchema.index({ shipmentId: 1, type: 1 });
exports.DocumentSchema.index({ type: 1, category: 1 });
exports.DocumentSchema.index({ expiryDate: 1, status: 1 });
exports.DocumentSchema.index({ 'metadata.rejectedAt': 1 });
exports.DocumentSchema.index({ 'metadata.approvedAt': 1 });
exports.DocumentSchema.index({ uploadedBy: 1, status: 1 });
exports.DocumentSchema.index({ approvedBy: 1, status: 1 });
exports.DocumentSchema.index({ tags: 1, status: 1 });
exports.DocumentSchema.virtual('isExpired').get(function () {
    return this.expiryDate ? this.expiryDate < new Date() : false;
});
exports.DocumentSchema.virtual('fileExtension').get(function () {
    return this.fileName ? this.fileName.split('.').pop().toLowerCase() : '';
});
exports.DocumentSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});
exports.DocumentSchema.methods.toJSON = function () {
    const doc = this.toObject();
    delete doc.__v;
    return doc;
};


/***/ }),

/***/ "./src/entities/inventory-item.entity.ts":
/*!***********************************************!*\
  !*** ./src/entities/inventory-item.entity.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InventoryItemSchema = exports.InventoryItem = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let InventoryItem = class InventoryItem {
};
exports.InventoryItem = InventoryItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "sku", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "reservedQuantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "availableQuantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "unitPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], InventoryItem.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            warehouse: { type: String, required: true },
            zone: { type: String, required: true },
            aisle: { type: String, required: true },
            shelf: { type: String, required: true },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], InventoryItem.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            length: { type: Number, required: true, min: 0 },
            width: { type: Number, required: true, min: 0 },
            height: { type: Number, required: true, min: 0 },
            weight: { type: Number, required: true, min: 0 },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], InventoryItem.prototype, "dimensions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'], default: 'in_stock' }),
    __metadata("design:type", String)
], InventoryItem.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InventoryItem.prototype, "supplier", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], InventoryItem.prototype, "lastRestocked", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], InventoryItem.prototype, "expiryDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], InventoryItem.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], InventoryItem.prototype, "updatedAt", void 0);
exports.InventoryItem = InventoryItem = __decorate([
    (0, mongoose_1.Schema)({ collection: 'inventory_items' })
], InventoryItem);
exports.InventoryItemSchema = mongoose_1.SchemaFactory.createForClass(InventoryItem);


/***/ }),

/***/ "./src/entities/notification-preferences.entity.ts":
/*!*********************************************************!*\
  !*** ./src/entities/notification-preferences.entity.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationPreferencesSchema = exports.NotificationPreferencesEntity = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let NotificationPreferencesEntity = class NotificationPreferencesEntity {
};
exports.NotificationPreferencesEntity = NotificationPreferencesEntity;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], NotificationPreferencesEntity.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferencesEntity.prototype, "emailNotifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], NotificationPreferencesEntity.prototype, "smsNotifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferencesEntity.prototype, "pushNotifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreferencesEntity.prototype, "inAppNotifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            shipmentUpdates: { type: Boolean, default: true },
            deliveryAlerts: { type: Boolean, default: true },
            customsClearance: { type: Boolean, default: true },
            documentRequired: { type: Boolean, default: true },
            paymentDue: { type: Boolean, default: true },
            systemAlerts: { type: Boolean, default: false },
        },
        _id: false,
        default: {},
    }),
    __metadata("design:type", Object)
], NotificationPreferencesEntity.prototype, "notificationTypes", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            enabled: { type: Boolean, default: false },
            startTime: { type: String, default: '22:00' },
            endTime: { type: String, default: '08:00' },
            timezone: { type: String, default: 'UTC' },
        },
        _id: false,
        default: {},
    }),
    __metadata("design:type", Object)
], NotificationPreferencesEntity.prototype, "quietHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: ['immediate', 'hourly', 'daily', 'weekly'],
        default: 'immediate',
    }),
    __metadata("design:type", String)
], NotificationPreferencesEntity.prototype, "frequency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], NotificationPreferencesEntity.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], NotificationPreferencesEntity.prototype, "updatedAt", void 0);
exports.NotificationPreferencesEntity = NotificationPreferencesEntity = __decorate([
    (0, mongoose_1.Schema)({ collection: 'notification_preferences' })
], NotificationPreferencesEntity);
exports.NotificationPreferencesSchema = mongoose_1.SchemaFactory.createForClass(NotificationPreferencesEntity);
exports.NotificationPreferencesSchema.index({ userId: 1 }, { unique: true });
exports.NotificationPreferencesSchema.index({ 'notificationTypes.shipmentUpdates': 1 });
exports.NotificationPreferencesSchema.index({ 'notificationTypes.deliveryAlerts': 1 });
exports.NotificationPreferencesSchema.index({ 'quietHours.enabled': 1 });


/***/ }),

/***/ "./src/entities/notification.entity.ts":
/*!*********************************************!*\
  !*** ./src/entities/notification.entity.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationSchema = exports.NotificationEntity = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let NotificationEntity = class NotificationEntity {
};
exports.NotificationEntity = NotificationEntity;
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['shipment_update', 'delivery_alert', 'customs_clearance', 'document_required', 'payment_due', 'system_alert'],
        required: true,
        index: true,
    }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true,
        index: true,
    }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            trackingNumber: { type: String, default: null },
            shipmentId: { type: String, default: null },
            customerId: { type: String, default: null },
            documentId: { type: String, default: null },
            actionUrl: { type: String, default: null },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], NotificationEntity.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true, index: true }),
    __metadata("design:type", Array)
], NotificationEntity.prototype, "recipients", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [String],
        enum: ['email', 'sms', 'push', 'in_app'],
        required: true,
        index: true,
    }),
    __metadata("design:type", Array)
], NotificationEntity.prototype, "channels", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
        default: 'pending',
        index: true,
    }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, index: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], NotificationEntity.prototype, "scheduledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, index: true }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], NotificationEntity.prototype, "sentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, index: true }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], NotificationEntity.prototype, "readAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, index: true }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], NotificationEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], NotificationEntity.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, index: true }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], NotificationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], NotificationEntity.prototype, "updatedAt", void 0);
exports.NotificationEntity = NotificationEntity = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'notifications',
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })
], NotificationEntity);
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(NotificationEntity);
exports.NotificationSchema.index({ recipients: 1, status: 1, createdAt: -1 });
exports.NotificationSchema.index({ 'data.shipmentId': 1 });
exports.NotificationSchema.index({ 'data.customerId': 1 });
exports.NotificationSchema.index({ 'data.documentId': 1 });
exports.NotificationSchema.index({ type: 1, status: 1, priority: 1 });
exports.NotificationSchema.index({ createdAt: -1 });
exports.NotificationSchema.index({ status: 1, scheduledAt: 1 });
exports.NotificationSchema.virtual('isRead').get(function () {
    return !!this.readAt;
});
exports.NotificationSchema.virtual('isExpired').get(function () {
    return this.expiresAt ? this.expiresAt < new Date() : false;
});
exports.NotificationSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});
exports.NotificationSchema.methods.toJSON = function () {
    const notification = this.toObject();
    delete notification.__v;
    return notification;
};
exports.NotificationSchema.statics.findUnreadByRecipient = function (recipientId) {
    return this.find({
        recipients: recipientId,
        readAt: { $exists: false },
        status: { $in: ['sent', 'delivered'] },
    }).sort({ createdAt: -1 });
};
exports.NotificationSchema.statics.markAsRead = function (ids, userId) {
    return this.updateMany({
        _id: { $in: ids },
        recipients: userId,
        readAt: { $exists: false },
    }, {
        $set: {
            status: 'read',
            readAt: new Date(),
        },
    });
};
exports.NotificationSchema.virtual('isExpired').get(function () {
    return this.expiresAt ? this.expiresAt < new Date() : false;
});
exports.NotificationSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = new Date();
    }
    next();
});


/***/ }),

/***/ "./src/entities/tracking-event.entity.ts":
/*!***********************************************!*\
  !*** ./src/entities/tracking-event.entity.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrackingEventSchema = exports.TrackingEvent = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let TrackingEvent = class TrackingEvent {
};
exports.TrackingEvent = TrackingEvent;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "trackingNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "carrierCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], TrackingEvent.prototype, "statusDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], TrackingEvent.prototype, "eventTimestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: 'text' }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], TrackingEvent.prototype, "latitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], TrackingEvent.prototype, "longitude", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], TrackingEvent.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "externalEventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], TrackingEvent.prototype, "isLatest", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], TrackingEvent.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'CarrierKey' }),
    __metadata("design:type", typeof (_c = typeof mongoose_2.Types !== "undefined" && mongoose_2.Types.ObjectId) === "function" ? _c : Object)
], TrackingEvent.prototype, "carrierKey", void 0);
exports.TrackingEvent = TrackingEvent = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'tracking_events',
    })
], TrackingEvent);
exports.TrackingEventSchema = mongoose_1.SchemaFactory.createForClass(TrackingEvent);
exports.TrackingEventSchema.index({ trackingNumber: 1, carrierCode: 1 });
exports.TrackingEventSchema.index({ trackingNumber: 1, carrierCode: 1, isLatest: 1 });
exports.TrackingEventSchema.index({ eventTimestamp: -1 });
exports.TrackingEventSchema.index({ status: 1, eventTimestamp: -1 });
exports.TrackingEventSchema.index({ carrierCode: 1, trackingNumber: 1, eventTimestamp: -1 });
exports.TrackingEventSchema.index({ carrierCode: 1, externalEventId: 1 }, { sparse: true });
exports.TrackingEventSchema.index({ status: 1 }, { partialFilterExpression: { status: 'DELIVERED' } });
exports.TrackingEventSchema.index({ latitude: 1, longitude: 1 }, { sparse: true });
exports.TrackingEventSchema.index({ location: 'text', description: 'text' });
exports.TrackingEventSchema.pre('save', async function (next) {
    if (this.isLatest) {
        await this.model('TrackingEvent').updateMany({
            trackingNumber: this.trackingNumber,
            carrierCode: this.carrierCode,
            _id: { $ne: this._id }
        }, { isLatest: false });
    }
    next();
});
exports.TrackingEventSchema.statics.findLatestByTracking = function (trackingNumber, carrierCode) {
    const query = { trackingNumber, isLatest: true };
    if (carrierCode) {
        query.carrierCode = carrierCode;
    }
    return this.findOne(query).populate('carrierKey');
};
exports.TrackingEventSchema.statics.findHistoryByTracking = function (trackingNumber, carrierCode) {
    const query = { trackingNumber };
    if (carrierCode) {
        query.carrierCode = carrierCode;
    }
    return this.find(query).sort({ eventTimestamp: -1 }).populate('carrierKey');
};


/***/ }),

/***/ "./src/entities/warehouse.entity.ts":
/*!******************************************!*\
  !*** ./src/entities/warehouse.entity.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WarehouseSchema = exports.Warehouse = void 0;
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
let Warehouse = class Warehouse {
};
exports.Warehouse = Warehouse;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Warehouse.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Warehouse.prototype, "capacity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Warehouse.prototype, "utilization", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Warehouse.prototype, "zones", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Warehouse.prototype, "manager", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            phone: { type: String, required: true },
            email: { type: String, required: true },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Warehouse.prototype, "contact", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            open: { type: String, required: true },
            close: { type: String, required: true },
            timezone: { type: String, required: true },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Warehouse.prototype, "operatingHours", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['active', 'inactive', 'maintenance'], default: 'active' }),
    __metadata("design:type", String)
], Warehouse.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Warehouse.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Warehouse.prototype, "updatedAt", void 0);
exports.Warehouse = Warehouse = __decorate([
    (0, mongoose_1.Schema)({ collection: 'warehouses' })
], Warehouse);
exports.WarehouseSchema = mongoose_1.SchemaFactory.createForClass(Warehouse);


/***/ }),

/***/ "./src/services/carrier-adapter.factory.ts":
/*!*************************************************!*\
  !*** ./src/services/carrier-adapter.factory.ts ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var CarrierAdapterFactory_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CarrierAdapterFactory = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const carrier_key_entity_1 = __webpack_require__(/*! ../entities/carrier-key.entity */ "./src/entities/carrier-key.entity.ts");
const ups_adapter_1 = __webpack_require__(/*! ../adapters/ups-adapter */ "./src/adapters/ups-adapter.ts");
const fedex_adapter_1 = __webpack_require__(/*! ../adapters/fedex-adapter */ "./src/adapters/fedex-adapter.ts");
const maersk_adapter_1 = __webpack_require__(/*! ../adapters/maersk-adapter */ "./src/adapters/maersk-adapter.ts");
let CarrierAdapterFactory = CarrierAdapterFactory_1 = class CarrierAdapterFactory {
    constructor(carrierKeyModel, configService, upsAdapter, fedexAdapter, maerskAdapter) {
        this.carrierKeyModel = carrierKeyModel;
        this.configService = configService;
        this.upsAdapter = upsAdapter;
        this.fedexAdapter = fedexAdapter;
        this.maerskAdapter = maerskAdapter;
        this.logger = new common_1.Logger(CarrierAdapterFactory_1.name);
        this.adapters = new Map();
        this.adapterClasses = new Map();
        this.adapterClasses.set('UPS', ups_adapter_1.UpsAdapter);
        this.adapterClasses.set('FEDEX', fedex_adapter_1.FedexAdapter);
        this.adapterClasses.set('MAERSK', maersk_adapter_1.MaerskAdapter);
    }
    async onModuleInit() {
        await this.initializeAdapters();
    }
    async initializeAdapters() {
        try {
            const carrierKeys = await this.carrierKeyModel
                .find({ isActive: true })
                .exec();
            this.logger.log(`Initializing ${carrierKeys.length} carrier adapters`);
            for (const carrierKey of carrierKeys) {
                try {
                    const config = {
                        carrierCode: carrierKey.carrierCode,
                        carrierName: carrierKey.carrierName,
                        apiKey: carrierKey.apiKey,
                        apiSecret: carrierKey.apiSecret,
                        baseUrl: carrierKey.baseUrl,
                        timeout: carrierKey.timeout,
                        retries: carrierKey.retries,
                        maxRetries: carrierKey.retries,
                        rateLimitPerMinute: carrierKey.rateLimitPerMinute,
                    };
                    let adapter;
                    switch (carrierKey.carrierCode.toUpperCase()) {
                        case 'UPS':
                            adapter = new ups_adapter_1.UpsAdapter(config);
                            break;
                        case 'FEDEX':
                            adapter = new fedex_adapter_1.FedexAdapter(config);
                            break;
                        case 'MAERSK':
                            adapter = new maersk_adapter_1.MaerskAdapter(config);
                            break;
                        default:
                            console.warn(`Unknown carrier code: ${carrierKey.carrierCode}`);
                            continue;
                    }
                    this.adapters.set(carrierKey.carrierCode.toUpperCase(), adapter);
                }
                catch (error) {
                    this.logger.error(`Failed to initialize adapter for ${carrierKey.carrierCode}:`, error);
                }
            }
            this.logger.log(`Successfully initialized ${this.adapters.size} carrier adapters`);
        }
        catch (error) {
            this.logger.error('Failed to initialize carrier adapters:', error);
        }
    }
    async getAdapter(carrierCode) {
        const adapter = this.adapters.get(carrierCode.toUpperCase());
        if (!adapter) {
            throw new Error(`No adapter found for carrier: ${carrierCode}`);
        }
        return adapter;
    }
    async createAdapter(carrierKey) {
        try {
            const AdapterClass = this.adapterClasses.get(carrierKey.carrierCode);
            if (!AdapterClass) {
                this.logger.warn(`No adapter class found for carrier: ${carrierKey.carrierCode}`);
                return null;
            }
            const config = {
                carrierCode: carrierKey.carrierCode,
                carrierName: carrierKey.carrierName,
                apiKey: carrierKey.apiKey,
                apiSecret: carrierKey.apiSecret,
                baseUrl: carrierKey.baseUrl,
                timeout: carrierKey.timeout,
                retries: carrierKey.retries,
                maxRetries: carrierKey.retries,
                rateLimitPerMinute: carrierKey.rateLimitPerMinute,
            };
            let adapter;
            switch (carrierKey.carrierCode) {
                case 'UPS':
                    adapter = this.upsAdapter;
                    break;
                case 'FEDEX':
                    adapter = this.fedexAdapter;
                    break;
                case 'MAERSK':
                    adapter = this.maerskAdapter;
                    break;
                default:
                    this.logger.warn(`Unknown carrier code: ${carrierKey.carrierCode}`);
                    return null;
            }
            this.adapters.set(carrierKey.carrierCode, adapter);
            this.logger.debug(`Created adapter for carrier: ${carrierKey.carrierCode}`);
            return adapter;
        }
        catch (error) {
            this.logger.error(`Failed to create adapter for ${carrierKey.carrierCode}:`, error);
            return null;
        }
    }
    async detectCarrierFromTrackingNumber(trackingNumber) {
        try {
            const carrierKeys = await this.carrierKeyModel
                .find({ isActive: true })
                .exec();
            for (const carrierKey of carrierKeys) {
                if (carrierKey.validateTrackingNumber(trackingNumber)) {
                    this.logger.debug(`Detected carrier ${carrierKey.carrierCode} for tracking number: ${trackingNumber}`);
                    return carrierKey.carrierCode;
                }
            }
            this.logger.warn(`Could not detect carrier for tracking number: ${trackingNumber}`);
            return null;
        }
        catch (error) {
            this.logger.error('Error detecting carrier from tracking number:', error);
            return null;
        }
    }
    detectCarrier(trackingNumber) {
        const cleanTrackingNumber = trackingNumber.replace(/\s+/g, '').toUpperCase();
        if (/^1Z[0-9A-Z]{16}$/.test(cleanTrackingNumber)) {
            return 'UPS';
        }
        if (/^[0-9]{12}$/.test(cleanTrackingNumber) || /^[0-9]{14}$/.test(cleanTrackingNumber)) {
            return 'FEDEX';
        }
        if (/^[A-Z]{4}[0-9]{7}$/.test(cleanTrackingNumber)) {
            return 'MAERSK';
        }
        return null;
    }
    async getAvailableCarriers() {
        try {
            const carrierKeys = await this.carrierKeyModel
                .find({ isActive: true })
                .select('carrierCode')
                .exec();
            return carrierKeys.map(key => key.carrierCode);
        }
        catch (error) {
            this.logger.error('Error getting available carriers:', error);
            return [];
        }
    }
    async getAvailableCarriersDetailed() {
        try {
            const carriers = await this.carrierKeyModel.find({ isActive: true }).exec();
            return carriers.map(carrier => ({
                carrierCode: carrier.carrierCode,
                carrierName: carrier.carrierName,
                carrierType: carrier.carrierType,
                isActive: carrier.isActive,
            }));
        }
        catch (error) {
            console.error('Error fetching available carriers:', error);
            return [
                { carrierCode: 'UPS', carrierName: 'United Parcel Service', carrierType: 'UPS', isActive: true },
                { carrierCode: 'FEDEX', carrierName: 'FedEx Corporation', carrierType: 'FEDEX', isActive: true },
                { carrierCode: 'MAERSK', carrierName: 'A.P. Moller-Maersk', carrierType: 'MAERSK', isActive: true },
            ];
        }
    }
    async getCarrierHealthStatus() {
        const healthStatuses = [];
        try {
            const carrierKeys = await this.carrierKeyModel
                .find({ isActive: true })
                .exec();
            for (const carrierKey of carrierKeys) {
                try {
                    const adapter = await this.getAdapter(carrierKey.carrierCode);
                    const isHealthy = adapter ? await adapter.healthCheck() : false;
                    healthStatuses.push({
                        carrierCode: carrierKey.carrierCode,
                        isHealthy,
                        lastChecked: new Date(),
                    });
                }
                catch (error) {
                    healthStatuses.push({
                        carrierCode: carrierKey.carrierCode,
                        isHealthy: false,
                        lastChecked: new Date(),
                        errorMessage: error.message,
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error getting carrier health status:', error);
        }
        return healthStatuses;
    }
    async healthCheck() {
        const healthStatus = {};
        for (const [carrierCode, adapter] of this.adapters.entries()) {
            try {
                healthStatus[carrierCode] = true;
            }
            catch (error) {
                console.error(`Health check failed for ${carrierCode}:`, error);
                healthStatus[carrierCode] = false;
            }
        }
        return healthStatus;
    }
    async refreshAdapter(carrierCode) {
        try {
            const normalizedCode = carrierCode.toUpperCase();
            this.adapters.delete(normalizedCode);
            const carrierKey = await this.carrierKeyModel
                .findOne({ carrierCode: normalizedCode, isActive: true })
                .exec();
            if (!carrierKey) {
                this.logger.warn(`No active carrier key found for refresh: ${normalizedCode}`);
                return false;
            }
            const adapter = await this.createAdapter(carrierKey);
            return adapter !== null;
        }
        catch (error) {
            this.logger.error(`Error refreshing adapter for ${carrierCode}:`, error);
            return false;
        }
    }
    async validateCarrierConfig(carrierCode) {
        try {
            const adapter = await this.getAdapter(carrierCode);
            if (!adapter) {
                return false;
            }
            return await adapter.healthCheck();
        }
        catch (error) {
            this.logger.error(`Error validating config for ${carrierCode}:`, error);
            return false;
        }
    }
    getCacheStats() {
        return {
            totalAdapters: this.adapters.size,
            activeAdapters: Array.from(this.adapters.keys()),
        };
    }
};
exports.CarrierAdapterFactory = CarrierAdapterFactory;
exports.CarrierAdapterFactory = CarrierAdapterFactory = CarrierAdapterFactory_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(carrier_key_entity_1.CarrierKey.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object, typeof (_c = typeof ups_adapter_1.UpsAdapter !== "undefined" && ups_adapter_1.UpsAdapter) === "function" ? _c : Object, typeof (_d = typeof fedex_adapter_1.FedexAdapter !== "undefined" && fedex_adapter_1.FedexAdapter) === "function" ? _d : Object, typeof (_e = typeof maersk_adapter_1.MaerskAdapter !== "undefined" && maersk_adapter_1.MaerskAdapter) === "function" ? _e : Object])
], CarrierAdapterFactory);


/***/ }),

/***/ "./src/services/customer.service.ts":
/*!******************************************!*\
  !*** ./src/services/customer.service.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomerService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let CustomerService = class CustomerService {
    constructor(customerModel) {
        this.customerModel = customerModel;
    }
    async getCustomers(filters) {
        const { search, status, type, page, limit } = filters;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }
        if (status) {
            query.status = status;
        }
        if (type) {
            query.type = type;
        }
        const [customers, total] = await Promise.all([
            this.customerModel
                .find(query)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.customerModel.countDocuments(query).exec(),
        ]);
        return {
            customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getCustomerById(id) {
        return await this.customerModel.findById(id).exec();
    }
    async createCustomer(createCustomerDto) {
        const customer = new this.customerModel({
            ...createCustomerDto,
            status: 'active',
            totalShipments: 0,
            totalValue: 0,
            lastActivity: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await customer.save();
    }
    async updateCustomer(id, updateCustomerDto) {
        return await this.customerModel
            .findByIdAndUpdate(id, { ...updateCustomerDto, updatedAt: new Date() }, { new: true })
            .exec();
    }
    async deleteCustomer(id) {
        const result = await this.customerModel.findByIdAndDelete(id).exec();
        return !!result;
    }
    async getCustomerShipments(customerId, page, limit) {
        const mockShipments = [
            {
                id: '1',
                trackingNumber: 'SS123456789',
                origin: 'Los Angeles, CA',
                destination: 'Shanghai, China',
                service: 'Ocean Freight',
                status: 'In Transit',
                cost: 2450.00,
                createdAt: new Date('2024-01-15'),
                estimatedDelivery: new Date('2024-02-15'),
            },
            {
                id: '2',
                trackingNumber: 'SS987654321',
                origin: 'New York, NY',
                destination: 'Hamburg, Germany',
                service: 'Air Freight',
                status: 'Delivered',
                cost: 3200.00,
                createdAt: new Date('2024-01-10'),
                estimatedDelivery: new Date('2024-01-12'),
            },
        ];
        const skip = (page - 1) * limit;
        const shipments = mockShipments.slice(skip, skip + limit);
        const total = mockShipments.length;
        return {
            shipments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getCustomerAnalytics(customerId) {
        return {
            totalShipments: 156,
            totalValue: 485000,
            averageShipmentValue: 3109,
            preferredServices: [
                { service: 'Ocean Freight', percentage: 65 },
                { service: 'Air Freight', percentage: 25 },
                { service: 'Ground Transportation', percentage: 10 },
            ],
            monthlyTrends: [
                { month: 'Jan', shipments: 12, value: 38500 },
                { month: 'Feb', shipments: 15, value: 42000 },
                { month: 'Mar', shipments: 18, value: 55000 },
                { month: 'Apr', shipments: 14, value: 41000 },
                { month: 'May', shipments: 16, value: 48000 },
                { month: 'Jun', shipments: 20, value: 62000 },
            ],
            topDestinations: [
                { destination: 'Shanghai, China', count: 45 },
                { destination: 'Hamburg, Germany', count: 32 },
                { destination: 'Rotterdam, Netherlands', count: 28 },
                { destination: 'Singapore', count: 25 },
                { destination: 'Tokyo, Japan', count: 18 },
            ],
            performanceMetrics: {
                onTimeDelivery: 94.5,
                customerSatisfaction: 4.7,
                averageTransitTime: 12.5,
                claimsRate: 0.8,
            },
        };
    }
    async updateCustomerActivity(customerId) {
        await this.customerModel
            .findByIdAndUpdate(customerId, { lastActivity: new Date() })
            .exec();
    }
    async incrementCustomerShipments(customerId, shipmentValue) {
        await this.customerModel
            .findByIdAndUpdate(customerId, {
            $inc: { totalShipments: 1, totalValue: shipmentValue },
            lastActivity: new Date(),
        })
            .exec();
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Customer')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], CustomerService);


/***/ }),

/***/ "./src/services/document.service.ts":
/*!******************************************!*\
  !*** ./src/services/document.service.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
let DocumentService = class DocumentService {
    constructor(documentModel) {
        this.documentModel = documentModel;
    }
    async getDocuments(filters) {
        const { type, category, status, shipmentId, customerId, search, page, limit } = filters;
        const skip = (page - 1) * limit;
        const query = {};
        if (type) {
            query.type = type;
        }
        if (category) {
            query.category = category;
        }
        if (status) {
            query.status = status;
        }
        if (shipmentId) {
            query.shipmentId = shipmentId;
        }
        if (customerId) {
            query.customerId = customerId;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { fileName: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }
        const [documents, total] = await Promise.all([
            this.documentModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.documentModel.countDocuments(query).exec(),
        ]);
        return {
            documents,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getDocumentById(id) {
        return await this.documentModel.findById(id).exec();
    }
    async uploadDocument(file, createDocumentDto) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        const document = new this.documentModel({
            ...createDocumentDto,
            fileName: file.originalname,
            fileUrl: `/uploads/documents/${fileName}`,
            fileSize: file.size,
            mimeType: file.mimetype,
            status: 'pending',
            tags: createDocumentDto.tags || [],
            metadata: createDocumentDto.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await document.save();
    }
    async updateDocument(id, updateDocumentDto) {
        return await this.documentModel
            .findByIdAndUpdate(id, { ...updateDocumentDto, updatedAt: new Date() }, { new: true })
            .exec();
    }
    async approveDocument(id, approvedBy, notes) {
        const document = await this.documentModel
            .findByIdAndUpdate(id, {
            status: 'approved',
            approvedBy,
            'metadata.approvalNotes': notes || '',
            'metadata.approvedAt': new Date(),
            updatedAt: new Date(),
        }, { new: true })
            .exec();
        if (!document) {
            throw new Error('Document not found');
        }
        return document;
    }
    async rejectDocument(id, rejectedBy, reason) {
        const document = await this.documentModel
            .findByIdAndUpdate(id, {
            status: 'rejected',
            'metadata.rejectedBy': rejectedBy,
            'metadata.rejectionReason': reason,
            'metadata.rejectedAt': new Date(),
            updatedAt: new Date(),
        }, { new: true })
            .exec();
        if (!document) {
            throw new Error('Document not found');
        }
        return document;
    }
    async deleteDocument(id) {
        const document = await this.documentModel.findById(id).exec();
        if (!document) {
            return false;
        }
        try {
            const filePath = path.join(process.cwd(), 'uploads', 'documents', path.basename(document.fileUrl));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
        const result = await this.documentModel.findByIdAndDelete(id).exec();
        return !!result;
    }
    async getDocumentTypes() {
        return {
            types: [
                { value: 'commercial_invoice', label: 'Commercial Invoice', description: 'Invoice for goods sold' },
                { value: 'packing_list', label: 'Packing List', description: 'Detailed list of packed items' },
                { value: 'bill_of_lading', label: 'Bill of Lading', description: 'Transport document' },
                { value: 'certificate_of_origin', label: 'Certificate of Origin', description: 'Country of origin certification' },
                { value: 'customs_declaration', label: 'Customs Declaration', description: 'Customs clearance document' },
                { value: 'insurance_certificate', label: 'Insurance Certificate', description: 'Cargo insurance document' },
                { value: 'other', label: 'Other', description: 'Other document types' },
            ],
            categories: [
                { value: 'customs', label: 'Customs', description: 'Customs and border control documents' },
                { value: 'shipping', label: 'Shipping', description: 'Transportation and logistics documents' },
                { value: 'insurance', label: 'Insurance', description: 'Insurance and risk management documents' },
                { value: 'compliance', label: 'Compliance', description: 'Regulatory compliance documents' },
                { value: 'financial', label: 'Financial', description: 'Financial and payment documents' },
            ],
            statuses: [
                { value: 'pending', label: 'Pending', description: 'Awaiting review' },
                { value: 'approved', label: 'Approved', description: 'Document approved' },
                { value: 'rejected', label: 'Rejected', description: 'Document rejected' },
                { value: 'expired', label: 'Expired', description: 'Document has expired' },
            ],
        };
    }
    async getExpiringDocuments(days = 30) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        return await this.documentModel
            .find({
            expiryDate: { $exists: true, $lte: expiryDate },
            status: { $ne: 'expired' }
        })
            .sort({ expiryDate: 1 })
            .exec();
    }
    async getDocumentAnalytics() {
        return {
            totalDocuments: 1847,
            pendingApproval: 23,
            approvedDocuments: 1654,
            rejectedDocuments: 89,
            expiredDocuments: 81,
            expiringIn30Days: 15,
            typeBreakdown: [
                { type: 'Commercial Invoice', count: 542, percentage: 29.3 },
                { type: 'Packing List', count: 398, percentage: 21.6 },
                { type: 'Bill of Lading', count: 287, percentage: 15.5 },
                { type: 'Certificate of Origin', count: 234, percentage: 12.7 },
                { type: 'Customs Declaration', count: 198, percentage: 10.7 },
                { type: 'Insurance Certificate', count: 145, percentage: 7.8 },
                { type: 'Other', count: 43, percentage: 2.3 },
            ],
            categoryBreakdown: [
                { category: 'Customs', count: 678, percentage: 36.7 },
                { category: 'Shipping', count: 589, percentage: 31.9 },
                { category: 'Financial', count: 298, percentage: 16.1 },
                { category: 'Insurance', count: 187, percentage: 10.1 },
                { category: 'Compliance', count: 95, percentage: 5.1 },
            ],
            monthlyTrends: [
                { month: 'Jan', uploaded: 142, approved: 135, rejected: 7 },
                { month: 'Feb', uploaded: 156, approved: 148, rejected: 8 },
                { month: 'Mar', uploaded: 178, approved: 165, rejected: 13 },
                { month: 'Apr', uploaded: 165, approved: 158, rejected: 7 },
                { month: 'May', uploaded: 189, approved: 175, rejected: 14 },
                { month: 'Jun', uploaded: 203, approved: 192, rejected: 11 },
            ],
            processingMetrics: {
                averageApprovalTime: 2.3,
                approvalRate: 94.2,
                documentsPerShipment: 4.8,
                digitalAdoption: 87.5,
            },
            topUploaders: [
                { uploader: 'John Smith', count: 89 },
                { uploader: 'Sarah Johnson', count: 76 },
                { uploader: 'Mike Chen', count: 65 },
                { uploader: 'Lisa Brown', count: 58 },
                { uploader: 'David Wilson', count: 52 },
            ],
        };
    }
    async markExpiredDocuments() {
        const now = new Date();
        const result = await this.documentModel
            .updateMany({
            expiryDate: { $lt: now },
            status: { $ne: 'expired' }
        }, {
            status: 'expired',
            updatedAt: now
        })
            .exec();
        return result.modifiedCount;
    }
    async getDocumentsByShipment(shipmentId) {
        return await this.documentModel
            .find({ shipmentId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getDocumentsByCustomer(customerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [documents, total] = await Promise.all([
            this.documentModel
                .find({ customerId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.documentModel.countDocuments({ customerId }).exec(),
        ]);
        return {
            documents,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async bulkApproveDocuments(documentIds, approvedBy) {
        const result = await this.documentModel
            .updateMany({ _id: { $in: documentIds }, status: 'pending' }, {
            status: 'approved',
            approvedBy,
            'metadata.approvedAt': new Date(),
            updatedAt: new Date(),
        })
            .exec();
        return result.modifiedCount;
    }
    async getDocumentStatistics() {
        const [totalCount, pendingCount, approvedCount, rejectedCount, expiredCount,] = await Promise.all([
            this.documentModel.countDocuments().exec(),
            this.documentModel.countDocuments({ status: 'pending' }).exec(),
            this.documentModel.countDocuments({ status: 'approved' }).exec(),
            this.documentModel.countDocuments({ status: 'rejected' }).exec(),
            this.documentModel.countDocuments({ status: 'expired' }).exec(),
        ]);
        return {
            total: totalCount,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            expired: expiredCount,
            approvalRate: totalCount > 0 ? (approvedCount / totalCount) * 100 : 0,
        };
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Document')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], DocumentService);


/***/ }),

/***/ "./src/services/inventory.service.ts":
/*!*******************************************!*\
  !*** ./src/services/inventory.service.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InventoryService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let InventoryService = class InventoryService {
    constructor(inventoryItemModel, warehouseModel) {
        this.inventoryItemModel = inventoryItemModel;
        this.warehouseModel = warehouseModel;
    }
    async getInventoryItems(filters) {
        const { search, category, status, warehouse, page, limit } = filters;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$or = [
                { sku: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) {
            query.category = category;
        }
        if (status) {
            query.status = status;
        }
        if (warehouse) {
            query['location.warehouse'] = warehouse;
        }
        const [items, total] = await Promise.all([
            this.inventoryItemModel
                .find(query)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.inventoryItemModel.countDocuments(query).exec(),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getInventoryItemById(id) {
        return await this.inventoryItemModel.findById(id).exec();
    }
    async createInventoryItem(createItemDto) {
        const availableQuantity = createItemDto.quantity;
        const totalValue = createItemDto.quantity * createItemDto.unitPrice;
        let status = 'in_stock';
        if (createItemDto.quantity === 0) {
            status = 'out_of_stock';
        }
        else if (createItemDto.quantity < 10) {
            status = 'low_stock';
        }
        const item = new this.inventoryItemModel({
            ...createItemDto,
            reservedQuantity: 0,
            availableQuantity,
            totalValue,
            status,
            lastRestocked: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await item.save();
    }
    async updateInventoryItem(id, updateItemDto) {
        const updateData = { ...updateItemDto, updatedAt: new Date() };
        if (updateItemDto.quantity !== undefined || updateItemDto.unitPrice !== undefined) {
            const currentItem = await this.inventoryItemModel.findById(id).exec();
            if (currentItem) {
                const newQuantity = updateItemDto.quantity ?? currentItem.quantity;
                const newUnitPrice = updateItemDto.unitPrice ?? currentItem.unitPrice;
                updateData.availableQuantity = newQuantity - currentItem.reservedQuantity;
                updateData.totalValue = newQuantity * newUnitPrice;
                if (newQuantity === 0) {
                    updateData.status = 'out_of_stock';
                }
                else if (newQuantity < 10) {
                    updateData.status = 'low_stock';
                }
                else {
                    updateData.status = 'in_stock';
                }
            }
        }
        return await this.inventoryItemModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
    }
    async deleteInventoryItem(id) {
        const result = await this.inventoryItemModel.findByIdAndDelete(id).exec();
        return !!result;
    }
    async getWarehouses() {
        return await this.warehouseModel.find({ status: 'active' }).exec();
    }
    async getWarehouseById(id) {
        return await this.warehouseModel.findById(id).exec();
    }
    async getInventoryAnalytics() {
        return {
            totalItems: 1247,
            totalValue: 2847500,
            lowStockItems: 23,
            outOfStockItems: 8,
            categoryBreakdown: [
                { category: 'Electronics', count: 342, value: 1250000 },
                { category: 'Automotive', count: 198, value: 680000 },
                { category: 'Textiles', count: 156, value: 320000 },
                { category: 'Machinery', count: 89, value: 450000 },
                { category: 'Chemicals', count: 67, value: 147500 },
            ],
            warehouseUtilization: [
                { warehouse: 'Main Warehouse LA', utilization: 78, capacity: 10000 },
                { warehouse: 'East Coast Hub NY', utilization: 65, capacity: 8000 },
                { warehouse: 'Midwest Center IL', utilization: 82, capacity: 6000 },
                { warehouse: 'West Coast Hub WA', utilization: 71, capacity: 7500 },
            ],
            monthlyTrends: [
                { month: 'Jan', inbound: 450, outbound: 380, value: 285000 },
                { month: 'Feb', inbound: 520, outbound: 420, value: 315000 },
                { month: 'Mar', inbound: 480, outbound: 510, value: 298000 },
                { month: 'Apr', inbound: 610, outbound: 580, value: 342000 },
                { month: 'May', inbound: 580, outbound: 620, value: 368000 },
                { month: 'Jun', inbound: 650, outbound: 590, value: 385000 },
            ],
            topMovingItems: [
                { sku: 'ELC-001', name: 'Smartphone Components', moves: 156 },
                { sku: 'AUT-045', name: 'Engine Parts', moves: 134 },
                { sku: 'TEX-023', name: 'Cotton Fabric', moves: 98 },
                { sku: 'MAC-012', name: 'Industrial Bearings', moves: 87 },
                { sku: 'CHE-008', name: 'Cleaning Chemicals', moves: 76 },
            ],
        };
    }
    async reserveInventory(id, quantity, reason) {
        const item = await this.inventoryItemModel.findById(id).exec();
        if (!item) {
            throw new Error('Inventory item not found');
        }
        if (item.availableQuantity < quantity) {
            throw new Error('Insufficient available quantity');
        }
        const updatedItem = await this.inventoryItemModel
            .findByIdAndUpdate(id, {
            $inc: { reservedQuantity: quantity, availableQuantity: -quantity },
            updatedAt: new Date(),
        }, { new: true })
            .exec();
        console.log(`Reserved ${quantity} units of ${item.sku} - Reason: ${reason || 'Not specified'}`);
        return updatedItem;
    }
    async restockInventory(id, restockDto) {
        const item = await this.inventoryItemModel.findById(id).exec();
        if (!item) {
            throw new Error('Inventory item not found');
        }
        const { quantity, unitPrice, supplier } = restockDto;
        const newTotalQuantity = item.quantity + quantity;
        const newAvailableQuantity = item.availableQuantity + quantity;
        let newUnitPrice = item.unitPrice;
        if (unitPrice !== undefined) {
            const totalValue = (item.quantity * item.unitPrice) + (quantity * unitPrice);
            newUnitPrice = totalValue / newTotalQuantity;
        }
        const newTotalValue = newTotalQuantity * newUnitPrice;
        let newStatus = 'in_stock';
        if (newTotalQuantity === 0) {
            newStatus = 'out_of_stock';
        }
        else if (newTotalQuantity < 10) {
            newStatus = 'low_stock';
        }
        const updateData = {
            quantity: newTotalQuantity,
            availableQuantity: newAvailableQuantity,
            unitPrice: newUnitPrice,
            totalValue: newTotalValue,
            status: newStatus,
            lastRestocked: new Date(),
            updatedAt: new Date(),
        };
        if (supplier) {
            updateData.supplier = supplier;
        }
        const updatedItem = await this.inventoryItemModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        console.log(`Restocked ${quantity} units of ${item.sku} from ${supplier || item.supplier}`);
        return updatedItem;
    }
    async getCategories() {
        return await this.inventoryItemModel.distinct('category').exec();
    }
    async getLowStockItems(threshold = 10) {
        return await this.inventoryItemModel
            .find({ availableQuantity: { $lt: threshold }, status: { $ne: 'discontinued' } })
            .sort({ availableQuantity: 1 })
            .exec();
    }
    async getExpiringItems(days = 30) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        return await this.inventoryItemModel
            .find({
            expiryDate: { $exists: true, $lte: expiryDate },
            status: { $ne: 'discontinued' }
        })
            .sort({ expiryDate: 1 })
            .exec();
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('InventoryItem')),
    __param(1, (0, mongoose_1.InjectModel)('Warehouse')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _b : Object])
], InventoryService);


/***/ }),

/***/ "./src/services/notification-simple.service.ts":
/*!*****************************************************!*\
  !*** ./src/services/notification-simple.service.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var NotificationSimpleService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationSimpleService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const notification_entity_1 = __webpack_require__(/*! ../entities/notification.entity */ "./src/entities/notification.entity.ts");
const notification_preferences_entity_1 = __webpack_require__(/*! ../entities/notification-preferences.entity */ "./src/entities/notification-preferences.entity.ts");
let NotificationSimpleService = NotificationSimpleService_1 = class NotificationSimpleService {
    constructor(notificationModel, preferencesModel) {
        this.notificationModel = notificationModel;
        this.preferencesModel = preferencesModel;
        this.logger = new common_1.Logger(NotificationSimpleService_1.name);
        this.notificationStreams = new Map();
        this.SSE_PING_INTERVAL = 30000;
    }
    async createNotification(createNotificationDto) {
        try {
            const notification = new this.notificationModel({
                ...createNotificationDto,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const savedNotification = await notification.save();
            this.emitToRecipients(savedNotification.toObject());
            await this.processNotificationDelivery(savedNotification.toObject());
            return savedNotification.toObject();
        }
        catch (error) {
            this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNotifications(filters) {
        try {
            const { type, priority, status, recipient, unreadOnly, page = 1, limit = 10 } = filters;
            const skip = (page - 1) * limit;
            const query = {};
            if (type)
                query.type = type;
            if (priority)
                query.priority = priority;
            if (status)
                query.status = status;
            if (recipient)
                query.recipients = { $in: [recipient] };
            if (unreadOnly)
                query.readAt = { $exists: false };
            const [notifications, total] = await Promise.all([
                this.notificationModel
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.notificationModel.countDocuments(query),
            ]);
            return {
                data: notifications,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get notifications: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNotificationById(id) {
        try {
            const notification = await this.notificationModel.findById(id).lean();
            if (!notification) {
                throw new Error('Notification not found');
            }
            return notification;
        }
        catch (error) {
            this.logger.error(`Failed to get notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markAsRead(id, userId) {
        try {
            const notification = await this.notificationModel.findOneAndUpdate({ _id: id, recipients: { $in: [userId] } }, { $set: { status: 'read', readAt: new Date() } }, { new: true });
            if (!notification) {
                throw new Error('Notification not found or user not authorized');
            }
            return notification.toObject();
        }
        catch (error) {
            this.logger.error(`Failed to mark notification as read: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markMultipleAsRead(ids, userId) {
        try {
            const result = await this.notificationModel.updateMany({ _id: { $in: ids }, recipients: { $in: [userId] } }, { $set: { status: 'read', readAt: new Date() } });
            return { count: result.modifiedCount };
        }
        catch (error) {
            this.logger.error(`Failed to mark notifications as read: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteNotification(id, userId) {
        try {
            const result = await this.notificationModel.deleteOne({
                _id: id,
                $or: [
                    { createdBy: userId },
                    { recipients: { $in: [userId] } }
                ]
            });
            if (result.deletedCount === 0) {
                throw new Error('Notification not found or user not authorized');
            }
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to delete notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNotificationPreferences(userId) {
        try {
            let preferences = await this.preferencesModel.findOne({ userId }).lean();
            if (!preferences) {
                preferences = await this.preferencesModel.create({
                    userId,
                    emailNotifications: true,
                    smsNotifications: false,
                    pushNotifications: true,
                    inAppNotifications: true,
                    notificationTypes: {
                        shipmentUpdates: true,
                        deliveryAlerts: true,
                        customsClearance: true,
                        documentRequired: true,
                        paymentDue: true,
                        systemAlerts: false,
                    },
                    quietHours: {
                        enabled: false,
                        startTime: '22:00',
                        endTime: '08:00',
                        timezone: 'UTC',
                    },
                    frequency: 'immediate',
                });
            }
            return preferences;
        }
        catch (error) {
            this.logger.error(`Failed to get notification preferences: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateNotificationPreferences(userId, updates) {
        try {
            const preferences = await this.preferencesModel.findOneAndUpdate({ userId }, { $set: updates }, { new: true, upsert: true, setDefaultsOnInsert: true });
            return preferences.toObject();
        }
        catch (error) {
            this.logger.error(`Failed to update notification preferences: ${error.message}`, error.stack);
            throw error;
        }
    }
    subscribeToNotifications(userId) {
        if (!this.notificationStreams.has(userId)) {
            this.notificationStreams.set(userId, new rxjs_1.Subject());
        }
        const ping$ = (0, rxjs_1.interval)(this.SSE_PING_INTERVAL).pipe((0, operators_1.map)(() => ({
            type: 'ping',
            timestamp: new Date().toISOString(),
        })));
        return new rxjs_1.Observable(subscriber => {
            const userStream = this.notificationStreams.get(userId);
            if (userStream) {
                const subscription = userStream.subscribe(subscriber);
                subscriber.next({
                    type: 'connected',
                    timestamp: new Date().toISOString(),
                });
                const pingInterval = setInterval(() => {
                    subscriber.next({
                        type: 'ping',
                        timestamp: new Date().toISOString(),
                    });
                }, this.SSE_PING_INTERVAL);
                return () => {
                    subscription.unsubscribe();
                    clearInterval(pingInterval);
                    if (userStream.observers.length === 0) {
                        this.notificationStreams.delete(userId);
                    }
                };
            }
            return () => { };
        });
    }
    emitToRecipients(notification) {
        try {
            for (const recipient of notification.recipients) {
                const userStream = this.notificationStreams.get(recipient);
                if (userStream) {
                    userStream.next({
                        type: 'notification',
                        data: notification,
                        timestamp: new Date().toISOString(),
                    });
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to emit notification to recipients: ${error.message}`, error.stack);
        }
    }
    async processNotificationDelivery(notification) {
        try {
            const preferences = await this.preferencesModel.find({
                userId: { $in: notification.recipients }
            });
            const preferencesMap = new Map(preferences.map(p => [p.userId, p]));
            for (const recipient of notification.recipients) {
                const userPrefs = preferencesMap.get(recipient) || {
                    emailNotifications: true,
                    smsNotifications: false,
                    pushNotifications: true,
                    inAppNotifications: true,
                };
                const channelsToUse = notification.channels.filter(channel => {
                    switch (channel) {
                        case 'email':
                            return userPrefs.emailNotifications !== false;
                        case 'sms':
                            return userPrefs.smsNotifications !== false;
                        case 'push':
                            return userPrefs.pushNotifications !== false;
                        case 'in_app':
                            return userPrefs.inAppNotifications !== false;
                        default:
                            return false;
                    }
                });
                if (channelsToUse.length === 0)
                    continue;
                this.logger.log(`Delivering notification ${notification._id} to ${recipient} via ${channelsToUse.join(', ')}`);
            }
            await this.notificationModel.updateOne({ _id: notification._id }, { $set: { status: 'sent', sentAt: new Date() } });
        }
        catch (error) {
            this.logger.error(`Failed to process notification delivery: ${error.message}`, error.stack);
            await this.notificationModel.updateOne({ _id: notification._id }, { $set: { status: 'failed' } });
        }
    }
};
exports.NotificationSimpleService = NotificationSimpleService;
exports.NotificationSimpleService = NotificationSimpleService = NotificationSimpleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_entity_1.NotificationEntity.name)),
    __param(1, (0, mongoose_1.InjectModel)(notification_preferences_entity_1.NotificationPreferencesEntity.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _b : Object])
], NotificationSimpleService);


/***/ }),

/***/ "./src/services/notification.service.ts":
/*!**********************************************!*\
  !*** ./src/services/notification.service.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var NotificationService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
const event_emitter_1 = __webpack_require__(/*! @nestjs/event-emitter */ "@nestjs/event-emitter");
const events_1 = __webpack_require__(/*! events */ "events");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationModel, preferencesModel, eventEmitter2) {
        this.notificationModel = notificationModel;
        this.preferencesModel = preferencesModel;
        this.eventEmitter2 = eventEmitter2;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.notificationStreams = new Map();
        this.eventEmitter = new events_1.EventEmitter();
        this.SSE_PING_INTERVAL = 30000;
    }
    onModuleInit() {
        this.eventEmitter2.on('notification.created', (notification) => {
            this.emitToRecipients(notification);
        });
    }
    async createNotification(createNotificationDto) {
        try {
            const notification = new this.notificationModel({
                ...createNotificationDto,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const savedNotification = await notification.save();
            this.eventEmitter2.emit('notification.created', savedNotification);
            await this.processNotificationDelivery(savedNotification);
            return savedNotification.toObject();
        }
        catch (error) {
            this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNotifications(filters) {
        try {
            const { type, priority, status, recipient, unreadOnly, page = 1, limit = 10 } = filters;
            const skip = (page - 1) * limit;
            const query = {};
            if (type)
                query.type = type;
            if (priority)
                query.priority = priority;
            if (status)
                query.status = status;
            if (recipient)
                query.recipients = { $in: [recipient] };
            if (unreadOnly)
                query.readAt = { $exists: false };
            const [notifications, total] = await Promise.all([
                this.notificationModel
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.notificationModel.countDocuments(query),
            ]);
            return {
                data: notifications,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get notifications: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNotificationById(id) {
        return await this.notificationModel.findById(id).exec();
    }
    async createNotification(createNotificationDto) {
        const notification = new this.notificationModel({
            ...createNotificationDto,
            data: createNotificationDto.data || {},
            status: createNotificationDto.scheduledAt ? 'pending' : 'sent',
            sentAt: createNotificationDto.scheduledAt ? undefined : new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const savedNotification = await notification.save();
        if (!createNotificationDto.scheduledAt) {
            await this.sendNotification(savedNotification);
        }
        this.emitToStreams(savedNotification);
        return savedNotification;
    }
    async markAsRead(id, userId) {
        const notification = await this.notificationModel
            .findOneAndUpdate({ _id: id, recipients: { $in: [userId] } }, {
            status: 'read',
            readAt: new Date(),
            updatedAt: new Date(),
        }, { new: true })
            .exec();
        if (!notification) {
            throw new Error('Notification not found or user not authorized');
        }
        return notification;
    }
    async bulkMarkAsRead(notificationIds, userId) {
        const result = await this.notificationModel
            .updateMany({
            _id: { $in: notificationIds },
            recipients: { $in: [userId] },
            readAt: { $exists: false }
        }, {
            status: 'read',
            readAt: new Date(),
            updatedAt: new Date(),
        })
            .exec();
        return result.modifiedCount;
    }
    async deleteNotification(id) {
        const result = await this.notificationModel.findByIdAndDelete(id).exec();
        return !!result;
    }
    async getNotificationPreferences(userId) {
        let preferences = await this.preferencesModel.findOne({ userId }).exec();
        if (!preferences) {
            preferences = new this.preferencesModel({
                userId,
                emailNotifications: true,
                smsNotifications: false,
                pushNotifications: true,
                inAppNotifications: true,
                notificationTypes: {
                    shipmentUpdates: true,
                    deliveryAlerts: true,
                    customsClearance: true,
                    documentRequired: true,
                    paymentDue: true,
                    systemAlerts: false,
                },
                quietHours: {
                    enabled: false,
                    startTime: '22:00',
                    endTime: '08:00',
                    timezone: 'UTC',
                },
                frequency: 'immediate',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            preferences = await preferences.save();
        }
        return preferences;
    }
    async updateNotificationPreferences(userId, updates) {
        const preferences = await this.preferencesModel
            .findOneAndUpdate({ userId }, { ...updates, updatedAt: new Date() }, { new: true, upsert: true })
            .exec();
        return preferences;
    }
    getNotificationStream(userId) {
        if (!this.notificationStreams.has(userId)) {
            const stream = new rxjs_1.Subject();
            this.notificationStreams.set(userId, stream);
            const heartbeat = (0, rxjs_1.interval)(30000).pipe((0, operators_1.map)(() => ({
                data: JSON.stringify({
                    type: 'heartbeat',
                    timestamp: new Date().toISOString(),
                }),
            })));
            return new rxjs_1.Observable(observer => {
                const heartbeatSub = heartbeat.subscribe(observer);
                const streamSub = stream.subscribe(observer);
                return () => {
                    heartbeatSub.unsubscribe();
                    streamSub.unsubscribe();
                    this.notificationStreams.delete(userId);
                };
            });
        }
        return this.notificationStreams.get(userId).asObservable();
    }
    async sendShipmentUpdateNotification(updateDto) {
        const notification = await this.createNotification({
            type: 'shipment_update',
            priority: 'medium',
            title: `Shipment Update: ${updateDto.trackingNumber}`,
            message: `Your shipment ${updateDto.trackingNumber} status has been updated to: ${updateDto.status}`,
            data: {
                trackingNumber: updateDto.trackingNumber,
                status: updateDto.status,
                location: updateDto.location,
                estimatedDelivery: updateDto.estimatedDelivery,
                actionUrl: `/tracking/${updateDto.trackingNumber}`,
            },
            recipients: updateDto.recipients,
            channels: ['email', 'in_app', 'push'],
            createdBy: updateDto.createdBy,
        });
        return notification;
    }
    async sendDeliveryAlertNotification(alertDto) {
        const notification = await this.createNotification({
            type: 'delivery_alert',
            priority: 'high',
            title: `Delivery Alert: ${alertDto.trackingNumber}`,
            message: `Your shipment ${alertDto.trackingNumber} is scheduled for delivery on ${alertDto.deliveryDate.toLocaleDateString()}`,
            data: {
                trackingNumber: alertDto.trackingNumber,
                deliveryDate: alertDto.deliveryDate,
                deliveryAddress: alertDto.deliveryAddress,
                actionUrl: `/tracking/${alertDto.trackingNumber}`,
            },
            recipients: alertDto.recipients,
            channels: ['email', 'sms', 'in_app', 'push'],
            createdBy: alertDto.createdBy,
        });
        return notification;
    }
    async getNotificationAnalytics() {
        return {
            totalNotifications: 2847,
            sentToday: 156,
            unreadCount: 342,
            deliveryRate: 94.8,
            openRate: 67.3,
            clickRate: 23.7,
            typeBreakdown: [
                { type: 'Shipment Updates', count: 1245, percentage: 43.7 },
                { type: 'Delivery Alerts', count: 687, percentage: 24.1 },
                { type: 'Customs Clearance', count: 398, percentage: 14.0 },
                { type: 'Document Required', count: 287, percentage: 10.1 },
                { type: 'Payment Due', count: 156, percentage: 5.5 },
                { type: 'System Alerts', count: 74, percentage: 2.6 },
            ],
            channelPerformance: [
                { channel: 'Email', sent: 2847, delivered: 2698, opened: 1817, clicked: 542 },
                { channel: 'In-App', sent: 2847, delivered: 2847, opened: 2156, clicked: 892 },
                { channel: 'Push', sent: 1823, delivered: 1734, opened: 1245, clicked: 387 },
                { channel: 'SMS', sent: 456, delivered: 445, opened: 398, clicked: 156 },
            ],
            priorityBreakdown: [
                { priority: 'Critical', count: 23, percentage: 0.8 },
                { priority: 'High', count: 287, percentage: 10.1 },
                { priority: 'Medium', count: 1834, percentage: 64.4 },
                { priority: 'Low', count: 703, percentage: 24.7 },
            ],
            monthlyTrends: [
                { month: 'Jan', sent: 2156, delivered: 2045, opened: 1378 },
                { month: 'Feb', sent: 2398, delivered: 2287, opened: 1542 },
                { month: 'Mar', sent: 2687, delivered: 2534, opened: 1698 },
                { month: 'Apr', sent: 2456, delivered: 2334, opened: 1587 },
                { month: 'May', sent: 2789, delivered: 2645, opened: 1789 },
                { month: 'Jun', sent: 2847, delivered: 2698, opened: 1817 },
            ],
            responseMetrics: {
                averageResponseTime: 2.3,
                peakSendingHour: 14,
                optimalSendingDay: 'Tuesday',
                unsubscribeRate: 0.8,
            },
        };
    }
    async sendNotification(notification) {
        console.log(`Sending notification: ${notification.title} to ${notification.recipients.length} recipients`);
        for (const channel of notification.channels) {
            switch (channel) {
                case 'email':
                    await this.sendEmailNotification(notification);
                    break;
                case 'sms':
                    await this.sendSmsNotification(notification);
                    break;
                case 'push':
                    await this.sendPushNotification(notification);
                    break;
                case 'in_app':
                    break;
            }
        }
    }
    async sendEmailNotification(notification) {
        console.log(`📧 Email sent: ${notification.title}`);
    }
    async sendSmsNotification(notification) {
        console.log(`📱 SMS sent: ${notification.title}`);
    }
    async sendPushNotification(notification) {
        console.log(`🔔 Push notification sent: ${notification.title}`);
    }
    emitToStreams(notification) {
        for (const recipient of notification.recipients) {
            const stream = this.notificationStreams.get(recipient);
            if (stream) {
                stream.next({
                    data: JSON.stringify({
                        type: 'notification',
                        notification,
                        timestamp: new Date().toISOString(),
                    }),
                });
            }
        }
    }
    async processScheduledNotifications() {
        const now = new Date();
        const scheduledNotifications = await this.notificationModel
            .find({
            status: 'pending',
            scheduledAt: { $lte: now },
        })
            .exec();
        let processed = 0;
        for (const notification of scheduledNotifications) {
            try {
                await this.sendNotification(notification);
                await this.notificationModel
                    .findByIdAndUpdate(notification._id, {
                    status: 'sent',
                    sentAt: now,
                    updatedAt: now,
                })
                    .exec();
                processed++;
            }
            catch (error) {
                console.error(`Failed to send scheduled notification ${notification._id}:`, error);
                await this.notificationModel
                    .findByIdAndUpdate(notification._id, {
                    status: 'failed',
                    updatedAt: now,
                })
                    .exec();
            }
        }
        return processed;
    }
    async cleanupExpiredNotifications() {
        const now = new Date();
        const result = await this.notificationModel
            .deleteMany({
            expiresAt: { $lt: now },
        })
            .exec();
        return result.deletedCount;
    }
    async getUserUnreadCount(userId) {
        return await this.notificationModel
            .countDocuments({
            recipients: { $in: [userId] },
            readAt: { $exists: false },
        })
            .exec();
    }
    async getNotificationById(id) {
        try {
            const notification = await this.notificationModel.findById(id).lean();
            if (!notification) {
                throw new Error('Notification not found');
            }
            return notification;
        }
        catch (error) {
            this.logger.error(`Failed to get notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markAsRead(id, userId) {
        try {
            const notification = await this.notificationModel.findOneAndUpdate({ _id: id, recipients: { $in: [userId] } }, { $set: { status: 'read', readAt: new Date() } }, { new: true });
            if (!notification) {
                throw new Error('Notification not found or user not authorized');
            }
            return notification.toObject();
        }
        catch (error) {
            this.logger.error(`Failed to mark notification as read: ${error.message}`, error.stack);
            throw error;
        }
    }
    async markMultipleAsRead(ids, userId) {
        try {
            const result = await this.notificationModel.updateMany({ _id: { $in: ids }, recipients: { $in: [userId] } }, { $set: { status: 'read', readAt: new Date() } });
            return { count: result.modifiedCount };
        }
        catch (error) {
            this.logger.error(`Failed to mark notifications as read: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteNotification(id, userId) {
        try {
            const result = await this.notificationModel.deleteOne({
                _id: id,
                $or: [
                    { createdBy: userId },
                    { recipients: { $in: [userId] } }
                ]
            });
            if (result.deletedCount === 0) {
                throw new Error('Notification not found or user not authorized');
            }
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Failed to delete notification: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNotificationPreferences(userId) {
        try {
            let preferences = await this.preferencesModel.findOne({ userId }).lean();
            if (!preferences) {
                preferences = await this.preferencesModel.create({
                    userId,
                });
            }
            return preferences;
        }
        catch (error) {
            this.logger.error(`Failed to get notification preferences: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateNotificationPreferences(userId, updates) {
        try {
            const preferences = await this.preferencesModel.findOneAndUpdate({ userId }, { $set: updates }, { new: true, upsert: true, setDefaultsOnInsert: true });
            return preferences.toObject();
        }
        catch (error) {
            this.logger.error(`Failed to update notification preferences: ${error.message}`, error.stack);
            throw error;
        }
    }
    subscribeToNotifications(userId) {
        if (!this.notificationStreams.has(userId)) {
            this.notificationStreams.set(userId, new rxjs_1.Subject());
        }
        const ping$ = (0, rxjs_1.interval)(this.SSE_PING_INTERVAL).pipe((0, operators_1.map)(() => ({
            type: 'ping',
            timestamp: new Date().toISOString(),
        })));
        return new rxjs_1.Observable(subscriber => {
            const userStream = this.notificationStreams.get(userId);
            if (userStream) {
                const subscription = userStream.subscribe(subscriber);
                const pingSubscription = ping$.subscribe(subscriber);
                return () => {
                    subscription.unsubscribe();
                    pingSubscription.unsubscribe();
                    if (userStream.observers.length === 0) {
                        this.notificationStreams.delete(userId);
                    }
                };
            }
            return () => { };
        });
    }
    async emitToRecipients(notification) {
        try {
            for (const recipient of notification.recipients) {
                const userStream = this.notificationStreams.get(recipient);
                if (userStream) {
                    userStream.next(notification);
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to emit notification to recipients: ${error.message}`, error.stack);
        }
    }
    async processNotificationDelivery(notification) {
        try {
            const preferences = await this.preferencesModel.find({
                userId: { $in: notification.recipients }
            });
            const preferencesMap = new Map(preferences.map(p => [p.userId, p]));
            for (const recipient of notification.recipients) {
                const userPrefs = preferencesMap.get(recipient) || {};
                const channelsToUse = notification.channels.filter(channel => {
                    switch (channel) {
                        case 'email':
                            return userPrefs.emailNotifications !== false;
                        case 'sms':
                            return userPrefs.smsNotifications !== false;
                        case 'push':
                            return userPrefs.pushNotifications !== false;
                        case 'in_app':
                            return userPrefs.inAppNotifications !== false;
                        default:
                            return false;
                    }
                });
                if (channelsToUse.length === 0)
                    continue;
                this.logger.log(`Delivering notification ${notification._id} to ${recipient} via ${channelsToUse.join(', ')}`);
            }
            await this.notificationModel.updateOne({ _id: notification._id }, { $set: { status: 'sent', sentAt: new Date() } });
        }
        catch (error) {
            this.logger.error(`Failed to process notification delivery: ${error.message}`, error.stack);
            await this.notificationModel.updateOne({ _id: notification._id }, { $set: { status: 'failed' } });
            throw error;
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Notification')),
    __param(1, (0, mongoose_1.InjectModel)('NotificationPreferences')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _b : Object, typeof (_c = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _c : Object])
], NotificationService);


/***/ }),

/***/ "./src/services/shipping-rate.service.ts":
/*!***********************************************!*\
  !*** ./src/services/shipping-rate.service.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ShippingRateService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let ShippingRateService = class ShippingRateService {
    constructor() {
        this.majorLocations = [
            'Los Angeles, CA', 'Long Beach, CA', 'New York, NY', 'Savannah, GA', 'Seattle, WA',
            'Oakland, CA', 'Norfolk, VA', 'Charleston, SC', 'Houston, TX', 'Tacoma, WA',
            'Shanghai, China', 'Shenzhen, China', 'Singapore', 'Rotterdam, Netherlands',
            'Hamburg, Germany', 'Antwerp, Belgium', 'Dubai, UAE', 'Hong Kong',
            'Tokyo, Japan', 'Busan, South Korea', 'Mumbai, India', 'Felixstowe, UK'
        ];
        this.packageTypes = [
            { value: 'package', label: 'Package', description: 'Small parcels up to 150 lbs' },
            { value: 'pallet', label: 'Pallet', description: 'Palletized freight up to 2,500 lbs' },
            { value: 'container', label: 'Container', description: '20ft/40ft container loads' },
            { value: 'bulk', label: 'Bulk Cargo', description: 'Loose cargo, liquids, grains' },
            { value: 'hazmat', label: 'Hazardous Materials', description: 'Dangerous goods requiring special handling' },
            { value: 'refrigerated', label: 'Refrigerated', description: 'Temperature-controlled cargo' }
        ];
        this.rateCache = new Map();
    }
    async calculateRates(request) {
        const weight = this.calculateDimensionalWeight(request);
        const distance = this.calculateDistance(request.origin, request.destination);
        const urgencyMultiplier = this.getUrgencyMultiplier(request.urgency);
        const insuranceCost = request.insurance ? request.value * 0.002 : 0;
        const baseRates = {
            ocean: 2.5,
            air: 8.5,
            ground: 1.8
        };
        const fuelSurcharge = 0.15;
        const securityFee = weight > 100 ? 75 : 35;
        const customsFee = distance > 3000 ? 150 : 0;
        const results = [];
        if (request.serviceType === 'all' || request.serviceType === 'ocean') {
            const oceanCost = this.calculateServiceCost(baseRates.ocean, weight, distance, fuelSurcharge, urgencyMultiplier, securityFee, customsFee, insuranceCost);
            const oceanTransit = Math.max(15, Math.round(distance / 500));
            results.push({
                id: 1,
                service: 'Ocean Freight (FCL/LCL)',
                carrier: 'ShipSmart Ocean Lines',
                transitDays: oceanTransit,
                cost: Math.round(oceanCost * 100) / 100,
                currency: 'USD',
                reliability: 95,
                features: [
                    'Door-to-door service',
                    'Customs clearance included',
                    'Container tracking',
                    'Cargo insurance available',
                    'Consolidation services'
                ],
                co2Savings: '85% less CO2 vs air freight',
                carbonFootprint: weight * 0.02,
                breakdown: {
                    baseCost: oceanCost * 0.6,
                    fuelSurcharge: oceanCost * 0.15,
                    securityFee,
                    customsFee,
                    insurance: insuranceCost
                }
            });
        }
        if (request.serviceType === 'all' || request.serviceType === 'air') {
            const airCost = this.calculateServiceCost(baseRates.air, weight, distance, fuelSurcharge, urgencyMultiplier, securityFee, customsFee, insuranceCost);
            const airTransit = Math.max(2, Math.round(distance / 2000));
            results.push({
                id: 2,
                service: 'Air Freight Express',
                carrier: 'ShipSmart Airways',
                transitDays: airTransit,
                cost: Math.round(airCost * 100) / 100,
                currency: 'USD',
                reliability: 98,
                features: [
                    'Express delivery',
                    'Real-time tracking',
                    'Priority handling',
                    'Temperature controlled',
                    '24/7 customer support'
                ],
                co2Savings: 'Fastest delivery option',
                carbonFootprint: weight * 0.5,
                breakdown: {
                    baseCost: airCost * 0.65,
                    fuelSurcharge: airCost * 0.20,
                    securityFee,
                    customsFee,
                    insurance: insuranceCost
                }
            });
        }
        if (request.serviceType === 'all' || request.serviceType === 'ground') {
            const groundCost = this.calculateServiceCost(baseRates.ground, weight, distance, fuelSurcharge, urgencyMultiplier, securityFee, 0, insuranceCost);
            const groundTransit = Math.max(3, Math.round(distance / 800));
            results.push({
                id: 3,
                service: 'Ground Transportation',
                carrier: 'ShipSmart Logistics',
                transitDays: groundTransit,
                cost: Math.round(groundCost * 100) / 100,
                currency: 'USD',
                reliability: 92,
                features: [
                    'Cost-effective solution',
                    'Flexible pickup times',
                    'LTL and FTL options',
                    'Regional coverage',
                    'Eco-friendly transport'
                ],
                co2Savings: '60% less CO2 vs air freight',
                carbonFootprint: weight * 0.15,
                breakdown: {
                    baseCost: groundCost * 0.70,
                    fuelSurcharge: groundCost * 0.12,
                    securityFee,
                    customsFee: 0,
                    insurance: insuranceCost
                }
            });
        }
        results.sort((a, b) => a.cost - b.cost);
        const cacheKey = this.generateCacheKey(request);
        this.rateCache.set(cacheKey, results);
        return results;
    }
    async refreshRates(rateIds) {
        const allCachedRates = Array.from(this.rateCache.values()).flat();
        const ratesToRefresh = allCachedRates.filter(rate => rateIds.includes(rate.id));
        return ratesToRefresh.map(rate => {
            const fluctuation = (Math.random() - 0.5) * 0.1;
            const newCost = rate.cost * (1 + fluctuation);
            return {
                ...rate,
                cost: Math.round(newCost * 100) / 100,
                breakdown: {
                    ...rate.breakdown,
                    baseCost: rate.breakdown.baseCost * (1 + fluctuation)
                }
            };
        });
    }
    async getLocationSuggestions(query) {
        if (!query || query.length < 2)
            return [];
        return this.majorLocations
            .filter(location => location.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);
    }
    async getPackageTypes() {
        return this.packageTypes;
    }
    calculateDimensionalWeight(request) {
        const { length, width, height, weight } = request;
        const dimWeight = (length * width * height) / 166;
        return Math.max(weight, dimWeight);
    }
    calculateDistance(origin, destination) {
        const routes = {
            'domestic': 2500,
            'transpacific': 6000,
            'transatlantic': 4000,
            'intra-asia': 2000,
            'intra-europe': 1500
        };
        const isUS = (loc) => loc.includes('CA') || loc.includes('NY') || loc.includes('TX') || loc.includes('WA');
        const isAsia = (loc) => loc.includes('China') || loc.includes('Japan') || loc.includes('Korea') || loc.includes('Singapore');
        const isEurope = (loc) => loc.includes('Germany') || loc.includes('Netherlands') || loc.includes('UK');
        if (isUS(origin) && isUS(destination))
            return routes.domestic;
        if ((isUS(origin) && isAsia(destination)) || (isAsia(origin) && isUS(destination)))
            return routes.transpacific;
        if ((isUS(origin) && isEurope(destination)) || (isEurope(origin) && isUS(destination)))
            return routes.transatlantic;
        if (isAsia(origin) && isAsia(destination))
            return routes['intra-asia'];
        if (isEurope(origin) && isEurope(destination))
            return routes['intra-europe'];
        return routes.transpacific;
    }
    getUrgencyMultiplier(urgency) {
        switch (urgency) {
            case 'express': return 1.25;
            case 'urgent': return 1.5;
            case 'critical': return 2.0;
            default: return 1.0;
        }
    }
    calculateServiceCost(baseRate, weight, distance, fuelSurcharge, urgencyMultiplier, securityFee, customsFee, insuranceCost) {
        const baseCost = (weight * 0.453592) * (distance / 1000) * baseRate;
        const fuelCost = baseCost * fuelSurcharge;
        const totalBeforeExtras = (baseCost + fuelCost) * urgencyMultiplier;
        return totalBeforeExtras + securityFee + customsFee + insuranceCost;
    }
    generateCacheKey(request) {
        return `${request.origin}-${request.destination}-${request.weight}-${request.serviceType}`;
    }
};
exports.ShippingRateService = ShippingRateService;
exports.ShippingRateService = ShippingRateService = __decorate([
    (0, common_1.Injectable)()
], ShippingRateService);


/***/ }),

/***/ "./src/services/tracking.service.ts":
/*!******************************************!*\
  !*** ./src/services/tracking.service.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrackingService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const carrier_adapter_factory_1 = __webpack_require__(/*! ./carrier-adapter.factory */ "./src/services/carrier-adapter.factory.ts");
const tracking_event_entity_1 = __webpack_require__(/*! ../entities/tracking-event.entity */ "./src/entities/tracking-event.entity.ts");
let TrackingService = class TrackingService {
    constructor(trackingEventModel, carrierAdapterFactory) {
        this.trackingEventModel = trackingEventModel;
        this.carrierAdapterFactory = carrierAdapterFactory;
    }
    async trackShipment(trackingNumber, carrierCode) {
        try {
            let adapter;
            if (carrierCode) {
                adapter = await this.carrierAdapterFactory.getAdapter(carrierCode);
            }
            else {
                const detectedCarrier = this.carrierAdapterFactory.detectCarrier(trackingNumber);
                if (!detectedCarrier) {
                    throw new Error(`Unable to detect carrier for tracking number: ${trackingNumber}`);
                }
                adapter = await this.carrierAdapterFactory.getAdapter(detectedCarrier);
            }
            const trackingData = await adapter.track(trackingNumber);
            await this.saveTrackingEvents(trackingData);
            return trackingData;
        }
        catch (error) {
            throw error;
        }
    }
    async trackBatchShipments(request) {
        const results = [];
        for (const trackingNumber of request.trackingNumbers) {
            try {
                const result = await this.trackShipment(trackingNumber, request.carrierCode);
                results.push(result);
            }
            catch (error) {
                results.push({
                    trackingNumber,
                    error: error.message,
                    status: 'error'
                });
            }
        }
        return results;
    }
    async getTrackingHistory(trackingNumber, carrierCode) {
        const whereCondition = { trackingNumber };
        if (carrierCode) {
            whereCondition.carrierCode = carrierCode.toUpperCase();
        }
        return this.trackingEventModel
            .find(whereCondition)
            .sort({ eventTimestamp: -1 })
            .exec();
    }
    async getLatestStatus(trackingNumber, carrierCode) {
        const whereCondition = { trackingNumber, isLatest: true };
        if (carrierCode) {
            whereCondition.carrierCode = carrierCode.toUpperCase();
        }
        return this.trackingEventModel
            .findOne(whereCondition)
            .exec();
    }
    async saveTrackingEvents(trackingResponse) {
        try {
            const { trackingNumber, carrierCode, events } = trackingResponse;
            if (!events || events.length === 0) {
                return;
            }
            const trackingEvents = events.map((event, index) => {
                const trackingEvent = new this.trackingEventModel();
                trackingEvent.trackingNumber = trackingNumber;
                trackingEvent.carrierCode = carrierCode;
                trackingEvent.status = event.status;
                trackingEvent.description = event.description;
                trackingEvent.eventTimestamp = event.timestamp;
                trackingEvent.externalEventId = event.externalEventId;
                trackingEvent.isLatest = index === 0;
                if (event.location) {
                    trackingEvent.location = event.location;
                    trackingEvent.latitude = event.latitude;
                    trackingEvent.longitude = event.longitude;
                }
                return trackingEvent;
            });
            await this.trackingEventModel.insertMany(trackingEvents);
        }
        catch (error) {
            throw error;
        }
    }
    async getAvailableCarriers() {
        return await this.carrierAdapterFactory.getAvailableCarriersDetailed();
    }
    async getHealthStatus() {
        try {
            const carrierHealth = await this.carrierAdapterFactory.healthCheck();
            const overallStatus = Object.values(carrierHealth).some(healthy => healthy) ? 'healthy' : 'unhealthy';
            return {
                status: overallStatus,
                timestamp: new Date(),
                carriers: Object.entries(carrierHealth).map(([code, healthy]) => ({
                    carrierCode: code,
                    isHealthy: healthy,
                    lastChecked: new Date()
                })),
                database: {
                    status: 'connected'
                },
                cache: {
                    status: 'connected'
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date(),
                error: error.message
            };
        }
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tracking_event_entity_1.TrackingEvent.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof carrier_adapter_factory_1.CarrierAdapterFactory !== "undefined" && carrier_adapter_factory_1.CarrierAdapterFactory) === "function" ? _b : Object])
], TrackingService);


/***/ }),

/***/ "./src/shared/config/storage.config.ts":
/*!*********************************************!*\
  !*** ./src/shared/config/storage.config.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deleteFile = exports.getFileUrl = exports.storageConfig = void 0;
const multer_1 = __webpack_require__(/*! multer */ "multer");
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
exports.storageConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = path.extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            cb(null, filename);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
};
const getFileUrl = (filename) => {
    return `/uploads/documents/${filename}`;
};
exports.getFileUrl = getFileUrl;
const deleteFile = (filePath) => {
    return new Promise((resolve) => {
        const fullPath = path.join(process.cwd(), filePath);
        fs.unlink(fullPath, (err) => {
            if (err) {
                console.error(`Error deleting file ${filePath}:`, err);
                return resolve(false);
            }
            resolve(true);
        });
    });
};
exports.deleteFile = deleteFile;


/***/ }),

/***/ "./src/types/tracking.types.ts":
/*!*************************************!*\
  !*** ./src/types/tracking.types.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValidationError = exports.RateLimitError = exports.CarrierApiError = exports.TrackingError = exports.TrackingResponseSchema = exports.TrackingEventSchema = exports.TrackingLocationSchema = exports.BatchTrackingRequestSchema = exports.TrackingRequestSchema = exports.TrackingStatus = void 0;
const zod_1 = __webpack_require__(/*! zod */ "zod");
var TrackingStatus;
(function (TrackingStatus) {
    TrackingStatus["PENDING"] = "pending";
    TrackingStatus["IN_TRANSIT"] = "in_transit";
    TrackingStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    TrackingStatus["DELIVERED"] = "delivered";
    TrackingStatus["EXCEPTION"] = "exception";
    TrackingStatus["RETURNED"] = "returned";
    TrackingStatus["CANCELLED"] = "cancelled";
    TrackingStatus["UNKNOWN"] = "unknown";
})(TrackingStatus || (exports.TrackingStatus = TrackingStatus = {}));
exports.TrackingRequestSchema = zod_1.z.object({
    trackingNumber: zod_1.z.string().min(1, 'Tracking number is required'),
    carrierCode: zod_1.z.string().optional(),
});
exports.BatchTrackingRequestSchema = zod_1.z.object({
    trackingNumbers: zod_1.z.array(zod_1.z.string()).min(1, 'At least one tracking number is required'),
    carrierCode: zod_1.z.string().optional(),
});
exports.TrackingLocationSchema = zod_1.z.object({
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    address: zod_1.z.string().optional(),
});
exports.TrackingEventSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(TrackingStatus),
    description: zod_1.z.string().optional(),
    location: exports.TrackingLocationSchema.optional(),
    timestamp: zod_1.z.date(),
    estimatedDelivery: zod_1.z.string().optional(),
    signedBy: zod_1.z.string().optional(),
    externalEventId: zod_1.z.string().optional(),
    rawData: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.TrackingResponseSchema = zod_1.z.object({
    trackingNumber: zod_1.z.string(),
    carrierCode: zod_1.z.string(),
    carrierName: zod_1.z.string(),
    currentStatus: zod_1.z.nativeEnum(TrackingStatus),
    events: zod_1.z.array(exports.TrackingEventSchema),
    estimatedDelivery: zod_1.z.string().optional(),
    actualDelivery: zod_1.z.string().optional(),
    origin: exports.TrackingLocationSchema.optional(),
    destination: exports.TrackingLocationSchema.optional(),
    lastUpdated: zod_1.z.date(),
    isDelivered: zod_1.z.boolean(),
    rawData: zod_1.z.record(zod_1.z.any()).optional(),
});
class TrackingError extends Error {
    constructor(message, code, carrierCode, trackingNumber, originalError) {
        super(message);
        this.code = code;
        this.carrierCode = carrierCode;
        this.trackingNumber = trackingNumber;
        this.originalError = originalError;
        this.name = 'TrackingError';
    }
}
exports.TrackingError = TrackingError;
class CarrierApiError extends TrackingError {
    constructor(message, statusCode, carrierCode, trackingNumber, originalError) {
        super(message, 'CARRIER_API_ERROR', carrierCode, trackingNumber, originalError);
        this.statusCode = statusCode;
        this.name = 'CarrierApiError';
    }
}
exports.CarrierApiError = CarrierApiError;
class RateLimitError extends TrackingError {
    constructor(message, retryAfter, carrierCode) {
        super(message, 'RATE_LIMIT_ERROR', carrierCode);
        this.retryAfter = retryAfter;
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
class ValidationError extends TrackingError {
    constructor(message, field) {
        super(message, 'VALIDATION_ERROR');
        this.field = field;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/event-emitter":
/*!****************************************!*\
  !*** external "@nestjs/event-emitter" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@nestjs/event-emitter");

/***/ }),

/***/ "@nestjs/mongoose":
/*!***********************************!*\
  !*** external "@nestjs/mongoose" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),

/***/ "@nestjs/platform-express":
/*!*******************************************!*\
  !*** external "@nestjs/platform-express" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

module.exports = require("axios");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "multer":
/*!*************************!*\
  !*** external "multer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("multer");

/***/ }),

/***/ "opossum":
/*!**************************!*\
  !*** external "opossum" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("opossum");

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),

/***/ "zod":
/*!**********************!*\
  !*** external "zod" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("zod");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:5173',
            configService.get('FRONTEND_URL', 'http://localhost:3000'),
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ShipSmart Tracking API')
        .setDescription('Comprehensive shipment tracking microservice with multi-carrier support')
        .setVersion('1.0')
        .addTag('tracking', 'Shipment tracking operations')
        .addTag('health', 'System health and monitoring')
        .addServer('http://localhost:3001', 'Development server')
        .addServer('https://api.shipmart.com', 'Production server')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
        },
    });
    app.getHttpAdapter().get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: configService.get('NODE_ENV', 'development'),
            version: '1.0.0',
        });
    });
    const port = configService.get('PORT', 3001);
    await app.listen(port);
    console.log(`🚀 ShipSmart Tracking API is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
    console.log(`🏥 Health check available at: http://localhost:${port}/health`);
}
bootstrap().catch((error) => {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
});

})();

/******/ })()
;