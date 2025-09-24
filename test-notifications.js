// Simple test script for notification system
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testNotificationSystem() {
  console.log('🚀 Testing ShipSmart Notification System...\n');

  try {
    // Test 1: Create a test notification
    console.log('📝 Test 1: Creating a test notification...');
    const createResponse = await axios.post(`${BASE_URL}/notifications-test`, {
      type: 'shipment_update',
      priority: 'medium',
      title: 'Test Notification',
      message: 'This is a test notification for the ShipSmart system',
      data: {
        trackingNumber: 'TEST123456',
        status: 'In Transit',
        location: 'Los Angeles, CA'
      },
      recipients: ['test-user-1', 'test-user-2'],
      channels: ['in_app', 'email'],
      createdBy: 'system'
    });
    
    console.log('✅ Notification created:', createResponse.data);
    const notificationId = createResponse.data._id;

    // Test 2: Get all notifications
    console.log('\n📋 Test 2: Getting all notifications...');
    const getAllResponse = await axios.get(`${BASE_URL}/notifications-test?limit=5`);
    console.log('✅ Retrieved notifications:', getAllResponse.data.meta);

    // Test 3: Get specific notification
    console.log('\n🔍 Test 3: Getting specific notification...');
    const getOneResponse = await axios.get(`${BASE_URL}/notifications-test/${notificationId}`);
    console.log('✅ Retrieved notification:', getOneResponse.data.title);

    // Test 4: Mark notification as read
    console.log('\n📖 Test 4: Marking notification as read...');
    const markReadResponse = await axios.put(`${BASE_URL}/notifications-test/${notificationId}/read`, {
      userId: 'test-user-1'
    });
    console.log('✅ Marked as read:', markReadResponse.data.status);

    // Test 5: Create shipment update notification
    console.log('\n🚢 Test 5: Creating shipment update notification...');
    const shipmentResponse = await axios.post(`${BASE_URL}/notifications-test/test/shipment-update`, {
      trackingNumber: 'SHIP789012',
      status: 'Delivered',
      location: 'New York, NY',
      recipients: ['test-user-1']
    });
    console.log('✅ Shipment notification created:', shipmentResponse.data.title);

    // Test 6: Create delivery alert notification
    console.log('\n📦 Test 6: Creating delivery alert notification...');
    const deliveryResponse = await axios.post(`${BASE_URL}/notifications-test/test/delivery-alert`, {
      trackingNumber: 'DEL345678',
      estimatedDelivery: '2024-01-15T14:00:00Z',
      carrier: 'UPS',
      recipients: ['test-user-1']
    });
    console.log('✅ Delivery alert created:', deliveryResponse.data.title);

    // Test 7: Get user preferences
    console.log('\n⚙️ Test 7: Getting user preferences...');
    const prefsResponse = await axios.get(`${BASE_URL}/notifications-test/preferences/test-user-1`);
    console.log('✅ User preferences:', prefsResponse.data.frequency);

    // Test 8: Update user preferences
    console.log('\n🔧 Test 8: Updating user preferences...');
    const updatePrefsResponse = await axios.put(`${BASE_URL}/notifications-test/preferences/test-user-1`, {
      emailNotifications: false,
      smsNotifications: true,
      frequency: 'daily'
    });
    console.log('✅ Preferences updated:', updatePrefsResponse.data.frequency);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Notification creation');
    console.log('- ✅ Notification retrieval');
    console.log('- ✅ Mark as read functionality');
    console.log('- ✅ Shipment update notifications');
    console.log('- ✅ Delivery alert notifications');
    console.log('- ✅ User preferences management');
    console.log('\n🔗 Real-time SSE endpoint available at:');
    console.log(`   ${BASE_URL}/notifications-test/stream/test-user-1`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running:');
      console.log('   cd backend && npm run start:dev');
    }
  }
}

// Test SSE connection
async function testSSEConnection() {
  console.log('\n🌐 Testing SSE Connection...');
  console.log('Open this URL in your browser to test real-time notifications:');
  console.log(`${BASE_URL}/notifications-test/stream/test-user-1`);
  console.log('\nYou should see ping messages every 30 seconds.');
  console.log('Create new notifications to see them appear in real-time!');
}

// Run tests
if (require.main === module) {
  testNotificationSystem().then(() => {
    testSSEConnection();
  });
}

module.exports = { testNotificationSystem, testSSEConnection };
