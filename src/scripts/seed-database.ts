import { connect, disconnect, model } from 'mongoose';
import { CarrierKeySchema } from '../entities/carrier-key.entity';
import { TrackingEventSchema } from '../entities/tracking-event.entity';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shipment_tracking';
    await connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create models
    const CarrierKeyModel = model('CarrierKey', CarrierKeySchema);
    const TrackingEventModel = model('TrackingEvent', TrackingEventSchema);

    // Clear existing carrier keys
    await CarrierKeyModel.deleteMany({});
    console.log('Cleared existing carrier keys');

    // Sample carrier configurations
    const carrierConfigs = [
      {
        carrierCode: 'UPS',
        carrierType: 'UPS',
        carrierName: 'United Parcel Service',
        apiKey: process.env.UPS_API_KEY || 'demo_ups_key',
        apiSecret: process.env.UPS_API_SECRET || 'demo:password',
        baseUrl: process.env.UPS_BASE_URL || 'https://onlinetools.ups.com/api',
        trackingNumberPattern: '^1Z[0-9A-Z]{16}$',
        timeout: 30000,
        retries: 3,
        rateLimitPerMinute: parseInt(process.env.UPS_RATE_LIMIT_PER_MINUTE || '1000'),
        isActive: true,
      },
      {
        carrierCode: 'FEDEX',
        carrierType: 'FEDEX',
        carrierName: 'FedEx Corporation',
        apiKey: process.env.FEDEX_API_KEY || 'demo_fedex_client_id',
        apiSecret: process.env.FEDEX_API_SECRET || 'demo_fedex_client_secret',
        baseUrl: process.env.FEDEX_BASE_URL || 'https://apis.fedex.com',
        trackingNumberPattern: '^[0-9]{12}$|^[0-9]{14}$',
        timeout: 30000,
        retries: 3,
        rateLimitPerMinute: parseInt(process.env.FEDEX_RATE_LIMIT_PER_MINUTE || '500'),
        isActive: true,
      },
      {
        carrierCode: 'MAERSK',
        carrierType: 'MAERSK',
        carrierName: 'A.P. Moller-Maersk',
        apiKey: process.env.MAERSK_API_KEY || 'demo_maersk_key',
        apiSecret: process.env.MAERSK_API_SECRET || 'demo_maersk_token',
        baseUrl: process.env.MAERSK_BASE_URL || 'https://api.maersk.com',
        trackingNumberPattern: '^[A-Z]{4}[0-9]{7}$',
        timeout: 30000,
        retries: 3,
        rateLimitPerMinute: parseInt(process.env.MAERSK_RATE_LIMIT_PER_MINUTE || '200'),
        isActive: true,
      },
    ];

    // Insert carrier configurations
    const insertedCarriers = await CarrierKeyModel.insertMany(carrierConfigs);
    console.log(`Inserted ${insertedCarriers.length} carrier configurations`);

    // Clear existing tracking events
    await TrackingEventModel.deleteMany({});
    console.log('Cleared existing tracking events');

    const sampleEvents = [
      {
        trackingNumber: '1Z999AA1234567890',
        carrierCode: 'UPS',
        status: 'DELIVERED',
        description: 'Package was delivered to the front door',
        eventTimestamp: new Date('2024-01-15T14:30:00Z'),
        location: 'New York, NY, US',
        latitude: 40.7128,
        longitude: -74.0060,
        isLatest: true,
        externalEventId: 'ups_event_001',
        carrierKey: insertedCarriers.find(c => c.carrierCode === 'UPS')?._id,
      },
      {
        trackingNumber: '1Z999AA1234567890',
        carrierCode: 'UPS',
        status: 'OUT_FOR_DELIVERY',
        description: 'Package is out for delivery',
        eventTimestamp: new Date('2024-01-15T08:00:00Z'),
        location: 'New York, NY, US',
        latitude: 40.7128,
        longitude: -74.0060,
        isLatest: false,
        externalEventId: 'ups_event_002',
        carrierKey: insertedCarriers.find(c => c.carrierCode === 'UPS')?._id,
      },
      {
        trackingNumber: '123456789012',
        carrierCode: 'FEDEX',
        status: 'IN_TRANSIT',
        description: 'Package is in transit to destination',
        eventTimestamp: new Date('2024-01-16T10:15:00Z'),
        location: 'Memphis, TN, US',
        latitude: 35.1495,
        longitude: -90.0490,
        isLatest: true,
        externalEventId: 'fedex_event_001',
        carrierKey: insertedCarriers.find(c => c.carrierCode === 'FEDEX')?._id,
      },
      {
        trackingNumber: 'MAEU1234567',
        carrierCode: 'MAERSK',
        status: 'IN_TRANSIT',
        description: 'Container departed from port',
        eventTimestamp: new Date('2024-01-14T06:00:00Z'),
        location: 'Port of Los Angeles, CA, US',
        latitude: 33.7361,
        longitude: -118.2639,
        isLatest: true,
        externalEventId: 'maersk_event_001',
        carrierKey: insertedCarriers.find(c => c.carrierCode === 'MAERSK')?._id,
      },
    ];

    const insertedEvents = await TrackingEventModel.insertMany(sampleEvents);
    console.log(`Inserted ${insertedEvents.length} sample tracking events`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\nSample tracking numbers to test:');
    console.log('- UPS: 1Z999AA1234567890');
    console.log('- FedEx: 123456789012');
    console.log('- Maersk: MAEU1234567');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
