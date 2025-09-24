import axios, { AxiosInstance, AxiosResponse } from 'axios';
import CircuitBreaker from 'opossum';
import { CarrierAdapter } from './carrier-adapter.interface';
import {
  TrackingRequest,
  TrackingResponse,
  CarrierConfig,
  TrackingEventData,
  CarrierApiError,
  TrackingStatus,
} from '@/types/tracking.types';
import { TrackingResponseSchema } from '@/types/tracking.types';

interface FedexTrackingResponse {
  output: {
    completeTrackResults: Array<{
      trackingNumber: string;
      trackResults: Array<{
        trackingNumberInfo: {
          trackingNumber: string;
          carrierCode: string;
        };
        additionalTrackingInfo: {
          hasAssociatedShipments: boolean;
          nickname: string;
          packageIdentifiers: Array<{
            type: string;
            value: string;
          }>;
        };
        distanceToDestination: {
          units: string;
          value: number;
        };
        consolidationDetail: Array<{
          timeStamp: string;
          consolidationID: string;
          reasonDetail: {
            description: string;
            type: string;
          };
        }>;
        meterNumber: string;
        returnDetail: {
          authorizationName: string;
          reasonDetail: Array<{
            description: string;
            type: string;
          }>;
        };
        serviceDetail: {
          description: string;
          shortDescription: string;
          type: string;
        };
        destinationLocation: {
          locationContactAndAddress: {
            contact: {
              personName: string;
              phoneNumber: string;
            };
            address: {
              city: string;
              stateOrProvinceCode: string;
              postalCode: string;
              countryCode: string;
              residential: boolean;
            };
          };
        };
        latestStatusDetail: {
          code: string;
          derivedCode: string;
          statusByLocale: string;
          description: string;
          scanLocation: {
            city: string;
            stateOrProvinceCode: string;
            countryCode: string;
            postalCode: string;
          };
        };
        serviceCommitMessage: {
          message: string;
          type: string;
        };
        informationNotes: Array<{
          code: string;
          description: string;
        }>;
        error: {
          code: string;
          parameterList: Array<{
            key: string;
            value: string;
          }>;
          message: string;
        };
        specialHandlings: Array<{
          description: string;
          type: string;
          paymentType: string;
        }>;
        availableImages: Array<{
          size: string;
          type: string;
        }>;
        deliveryDetails: {
          receivedByName: string;
          destinationServiceArea: string;
          destinationServiceAreaDescription: string;
          locationDescription: string;
          actualDeliveryAddress: {
            city: string;
            stateOrProvinceCode: string;
            countryCode: string;
            postalCode: string;
            residential: boolean;
          };
          deliveryToday: boolean;
          locationType: string;
          signedByName: string;
          officeOrderDeliveryMethod: {
            description: string;
            type: string;
          };
          deliveryAttempts: string;
          deliveryOptionEligibilityDetails: Array<{
            option: string;
            eligibility: boolean;
          }>;
        };
        scanEvents: Array<{
          date: string;
          derivedStatus: string;
          scanLocation: {
            city: string;
            stateOrProvinceCode: string;
            countryCode: string;
            postalCode: string;
          };
          locationId: string;
          locationType: string;
          exceptionDescription: string;
          eventDescription: string;
          eventType: string;
          derivedStatusCode: string;
          exceptionCode: string;
        }>;
        dateAndTimes: Array<{
          dateTime: string;
          type: string;
        }>;
        packageDetails: {
          physicalPackagingType: string;
          sequenceNumber: string;
          count: string;
          weightAndDimensions: {
            weight: Array<{
              units: string;
              value: string;
            }>;
            dimensions: Array<{
              length: number;
              width: number;
              height: number;
              units: string;
            }>;
          };
          packageContent: Array<string>;
        };
        goodsClassificationCode: string;
        holdAtLocation: {
          locationContactAndAddress: {
            contact: {
              personName: string;
              phoneNumber: string;
            };
            address: {
              city: string;
              stateOrProvinceCode: string;
              postalCode: string;
              countryCode: string;
              residential: boolean;
            };
          };
        };
        customDeliveryOptions: Array<{
          requestedAppointmentDetail: {
            date: string;
            window: Array<{
              description: string;
              window: {
                begins: string;
                ends: string;
              };
            }>;
          };
          description: string;
          type: string;
          status: string;
        }>;
        estimatedDeliveryTimeWindow: {
          description: string;
          type: string;
          window: {
            begins: string;
            ends: string;
          };
        };
        pieceCounts: Array<{
          count: string;
          description: string;
          type: string;
        }>;
        originLocation: {
          locationContactAndAddress: {
            contact: {
              personName: string;
              phoneNumber: string;
            };
            address: {
              city: string;
              stateOrProvinceCode: string;
              postalCode: string;
              countryCode: string;
              residential: boolean;
            };
          };
        };
        recipientInformation: {
          contact: {
            personName: string;
            phoneNumber: string;
          };
          address: {
            city: string;
            stateOrProvinceCode: string;
            postalCode: string;
            countryCode: string;
            residential: boolean;
          };
        };
        standardTransitTimeWindow: {
          description: string;
          type: string;
          window: {
            begins: string;
            ends: string;
          };
        };
        shipmentDetails: {
          contents: Array<{
            itemNumber: string;
            receivedQuantity: string;
            description: string;
            partNumber: string;
          }>;
          beforePossessionStatus: boolean;
          weight: Array<{
            units: string;
            value: string;
          }>;
          contentPieceCount: string;
          splitShipments: Array<{
            pieceCount: string;
            statusDescription: string;
            timestamp: string;
            statusCode: string;
          }>;
        };
        reasonDetail: {
          description: string;
          type: string;
        };
        availableNotifications: Array<string>;
        shipperInformation: {
          contact: {
            personName: string;
            phoneNumber: string;
            companyName: string;
          };
          address: {
            city: string;
            stateOrProvinceCode: string;
            postalCode: string;
            countryCode: string;
            residential: boolean;
          };
        };
        lastUpdatedDestinationAddress: {
          city: string;
          stateOrProvinceCode: string;
          postalCode: string;
          countryCode: string;
          residential: boolean;
        };
      }>;
    }>;
  };

}

export class FedexAdapter extends CarrierAdapter {
  private httpClient: AxiosInstance;
  private circuitBreaker: CircuitBreaker;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: CarrierConfig) {
    super(config);
    
    this.httpClient = axios.create({
      baseURL: config.baseUrl || 'https://apis.fedex.com',
      timeout: config.timeout * 1000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Circuit breaker configuration
    const circuitBreakerOptions = {
      timeout: config.timeout * 1000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10,
    };

    this.circuitBreaker = new CircuitBreaker(this.makeApiCall.bind(this), circuitBreakerOptions);
    
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

  async track(trackingNumber: string): Promise<TrackingResponse> {
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
    } catch (error) {
      console.error('FedEx tracking error:', error);
      throw new Error(`Failed to track FedEx shipment: ${error.message}`);
    }
  }

  async trackBatch(trackingNumbers: string[]): Promise<TrackingResponse[]> {
    const promises = trackingNumbers.map(trackingNumber =>
      this.track(trackingNumber)
        .catch(error => {
          console.error(`Batch tracking failed for ${trackingNumber}:`, error);
          return null;
        })
    );

    const results = await Promise.all(promises);
    return results.filter(result => result !== null) as TrackingResponse[];
  }

  private async ensureAuthenticated(): Promise<void> {
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
      
      // Update default headers
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
    } catch (error) {
      throw new CarrierApiError(
        `FedEx authentication failed: ${error.message}`,
        error.response?.status || 500,
        this.carrierCode,
      );
    }
  }

  private async makeApiCall(trackingNumber: string): Promise<AxiosResponse<FedexTrackingResponse>> {
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

  private parseTrackingResponse(data: FedexTrackingResponse, trackingNumber: string): TrackingResponse {
    const trackResult = data.output.completeTrackResults[0]?.trackResults[0];
    
    if (!trackResult) {
      throw new CarrierApiError(
        'No tracking information found',
        404,
        this.carrierCode,
        trackingNumber,
      );
    }

    const events: TrackingEventData[] = trackResult.scanEvents?.map(event => ({
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

    // Sort events by timestamp (newest first)
    events.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return bTime - aTime;
    });

    const estimatedDelivery = trackResult.dateAndTimes?.find(dt => dt.type === 'ESTIMATED_DELIVERY')?.dateTime;

    const response: TrackingResponse = {
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

    // Validate response
    return TrackingResponseSchema.parse(response);
  }

  private mapFedexStatusToTrackingStatus(fedexStatus: string): TrackingStatus {
    const statusMap: Record<string, TrackingStatus> = {
      'OC': TrackingStatus.PENDING,      // Order Created
      'PU': TrackingStatus.IN_TRANSIT,   // Picked Up
      'IT': TrackingStatus.IN_TRANSIT,   // In Transit
      'AR': TrackingStatus.IN_TRANSIT,   // At Destination Sort Facility
      'OD': TrackingStatus.OUT_FOR_DELIVERY, // Out for Delivery
      'DL': TrackingStatus.DELIVERED,    // Delivered
      'EX': TrackingStatus.EXCEPTION,    // Exception
      'CA': TrackingStatus.CANCELLED,    // Cancelled
      'RS': TrackingStatus.RETURNED,     // Return to Shipper
    };

    return statusMap[fedexStatus] || TrackingStatus.PENDING;
  }

  isTrackingNumberValid(trackingNumber: string): boolean {
    const patterns = this.getTrackingNumberPatterns();
    return patterns.some(pattern => pattern.test(trackingNumber));
  }

  getTrackingNumberPatterns(): RegExp[] {
    return [
      /^\d{12}$/,           // FedEx Express (12 digits)
      /^\d{14}$/,           // FedEx Express (14 digits)
      /^\d{15}$/,           // FedEx Ground (15 digits)
      /^\d{20}$/,           // FedEx Ground (20 digits)
      /^\d{22}$/,           // FedEx SmartPost (22 digits)
      /^96\d{20}$/,         // FedEx SmartPost (starts with 96)
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureAuthenticated();
      return this.accessToken !== null;
    } catch (error) {
      console.error('FedEx health check failed:', error.message);
      return false;
    }
  }
}
