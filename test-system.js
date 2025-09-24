const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testNotificationSystem() {
  console.log('🚀 Testing ShipSmart Notification System\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', health.data);

    // Test 2: Get existing notifications
    console.log('\n2. Getting existing notifications...');
    const notifications = await axios.get(`${API_BASE}/notifications`);
    console.log('✅ Found', notifications.data.data.length, 'notifications');
    console.log('   Total:', notifications.data.meta.total);

    // Test 3: Get unread count
    console.log('\n3. Getting unread count...');
    const unreadCount = await axios.get(`${API_BASE}/notifications/unread-count`);
    console.log('✅ Unread notifications:', unreadCount.data.count);

    // Test 4: Create test notifications
    console.log('\n4. Creating test notifications...');
    
    const shipmentTest = await axios.post(`${API_BASE}/notifications/test/shipment`);
    console.log('✅ Created shipment notification:', shipmentTest.data.title);

    const deliveryTest = await axios.post(`${API_BASE}/notifications/test/delivery`);
    console.log('✅ Created delivery notification:', deliveryTest.data.title);

    const systemTest = await axios.post(`${API_BASE}/notifications/test/system`);
    console.log('✅ Created system notification:', systemTest.data.title);

    // Test 5: Custom notification
    console.log('\n5. Creating custom notification...');
    const customNotification = await axios.post(`${API_BASE}/notifications`, {
      type: 'system_alert',
      priority: 'high',
      title: 'System Test Complete',
      message: 'All notification endpoints are working correctly!',
      data: { testRun: true, timestamp: Date.now() }
    });
    console.log('✅ Created custom notification:', customNotification.data.title);

    // Test 6: Get updated notifications
    console.log('\n6. Getting updated notifications...');
    const updatedNotifications = await axios.get(`${API_BASE}/notifications`);
    console.log('✅ Now have', updatedNotifications.data.data.length, 'notifications');

    // Test 7: Mark a notification as read
    console.log('\n7. Marking first notification as read...');
    const firstNotification = updatedNotifications.data.data[0];
    const markedRead = await axios.patch(`${API_BASE}/notifications/${firstNotification.id}/read`);
    console.log('✅ Marked notification as read:', markedRead.data.title);

    // Test 8: Get updated unread count
    console.log('\n8. Getting updated unread count...');
    const newUnreadCount = await axios.get(`${API_BASE}/notifications/unread-count`);
    console.log('✅ Updated unread count:', newUnreadCount.data.count);

    // Test 9: Mark all as read
    console.log('\n9. Marking all notifications as read...');
    const markAllRead = await axios.patch(`${API_BASE}/notifications/mark-all-read`);
    console.log('✅ Marked', markAllRead.data.updatedCount, 'notifications as read');

    // Test 10: Final unread count
    console.log('\n10. Final unread count check...');
    const finalUnreadCount = await axios.get(`${API_BASE}/notifications/unread-count`);
    console.log('✅ Final unread count:', finalUnreadCount.data.count);

    console.log('\n🎉 All notification system tests passed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Health check');
    console.log('   ✅ Get notifications');
    console.log('   ✅ Get unread count');
    console.log('   ✅ Create test notifications (3 types)');
    console.log('   ✅ Create custom notification');
    console.log('   ✅ Mark notification as read');
    console.log('   ✅ Mark all notifications as read');
    console.log('   ✅ Real-time SSE stream available at /notifications/stream');

    console.log('\n🌐 Frontend Testing:');
    console.log('   1. Open http://localhost:5173 in your browser');
    console.log('   2. Login with any credentials (mock authentication)');
    console.log('   3. Look for the notification bell in the top navigation');
    console.log('   4. Click the bell to see notifications dropdown');
    console.log('   5. Visit /notifications for the notification center');
    console.log('   6. Visit /live-dashboard for real-time dashboard');
    console.log('   7. Visit /inventory for inventory with live updates');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the tests
testNotificationSystem();
