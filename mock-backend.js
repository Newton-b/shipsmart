const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Mock notification data
let notifications = [
  {
    id: '1',
    type: 'shipment_update',
    priority: 'medium',
    title: 'Shipment Update',
    message: 'Your shipment TRK123456 has been picked up',
    recipient: 'user@example.com',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    data: { trackingNumber: 'TRK123456' }
  },
  {
    id: '2',
    type: 'delivery_alert',
    priority: 'high',
    title: 'Delivery Alert',
    message: 'Package will be delivered today between 2-4 PM',
    recipient: 'user@example.com',
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    data: { trackingNumber: 'TRK789012' }
  },
  {
    id: '3',
    type: 'system_alert',
    priority: 'low',
    title: 'System Maintenance',
    message: 'Scheduled maintenance tonight from 2-4 AM EST',
    recipient: 'user@example.com',
    readAt: new Date(Date.now() - 1000 * 60 * 2), // Read 2 minutes ago
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    data: {}
  }
];

let notificationIdCounter = 4;

// SSE endpoint for real-time notifications
app.get('/notifications/stream', (req, res) => {
  console.log('SSE connection established');
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Credentials': 'true'
  });

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

  // Send a test notification every 10 seconds
  const interval = setInterval(() => {
    const testNotification = {
      id: String(notificationIdCounter++),
      type: 'system_alert',
      priority: 'medium',
      title: 'Live Update',
      message: `Real-time notification at ${new Date().toLocaleTimeString()}`,
      recipient: 'user@example.com',
      readAt: null,
      createdAt: new Date(),
      data: { timestamp: Date.now() }
    };
    
    notifications.unshift(testNotification);
    res.write(`data: ${JSON.stringify(testNotification)}\n\n`);
    console.log('Sent test notification:', testNotification.title);
  }, 10000);

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE connection closed');
    clearInterval(interval);
  });
});

// Get all notifications
app.get('/notifications', (req, res) => {
  const { page = 1, limit = 10, unreadOnly } = req.query;
  
  let filteredNotifications = notifications;
  if (unreadOnly === 'true') {
    filteredNotifications = notifications.filter(n => !n.readAt);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
  
  res.json({
    data: paginatedNotifications,
    meta: {
      total: filteredNotifications.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredNotifications.length / limit)
    }
  });
});

// Get unread count
app.get('/notifications/unread-count', (req, res) => {
  const unreadCount = notifications.filter(n => !n.readAt).length;
  res.json({ count: unreadCount });
});

// Mark notification as read
app.patch('/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notification = notifications.find(n => n.id === id);
  
  if (notification) {
    notification.readAt = new Date();
    res.json(notification);
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// Mark all notifications as read
app.patch('/notifications/mark-all-read', (req, res) => {
  const updatedCount = notifications.filter(n => !n.readAt).length;
  notifications.forEach(n => {
    if (!n.readAt) {
      n.readAt = new Date();
    }
  });
  
  res.json({ updatedCount });
});

// Create new notification
app.post('/notifications', (req, res) => {
  const newNotification = {
    id: String(notificationIdCounter++),
    ...req.body,
    recipient: req.body.recipient || 'user@example.com',
    readAt: null,
    createdAt: new Date()
  };
  
  notifications.unshift(newNotification);
  console.log('Created notification:', newNotification.title);
  
  res.status(201).json(newNotification);
});

// Test endpoints
app.post('/notifications/test/shipment', (req, res) => {
  const notification = {
    id: String(notificationIdCounter++),
    type: 'shipment_update',
    priority: 'medium',
    title: 'Test Shipment Update',
    message: 'This is a test shipment notification',
    recipient: 'user@example.com',
    readAt: null,
    createdAt: new Date(),
    data: { trackingNumber: 'TEST123' }
  };
  
  notifications.unshift(notification);
  res.json(notification);
});

app.post('/notifications/test/delivery', (req, res) => {
  const notification = {
    id: String(notificationIdCounter++),
    type: 'delivery_alert',
    priority: 'high',
    title: 'Test Delivery Alert',
    message: 'This is a test delivery notification',
    recipient: 'user@example.com',
    readAt: null,
    createdAt: new Date(),
    data: { trackingNumber: 'TEST456' }
  };
  
  notifications.unshift(notification);
  res.json(notification);
});

app.post('/notifications/test/system', (req, res) => {
  const notification = {
    id: String(notificationIdCounter++),
    type: 'system_alert',
    priority: 'critical',
    title: 'Test System Alert',
    message: 'This is a test system notification',
    recipient: 'user@example.com',
    readAt: null,
    createdAt: new Date(),
    data: {}
  };
  
  notifications.unshift(notification);
  res.json(notification);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Mock backend server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- GET /notifications/stream (SSE)');
  console.log('- GET /notifications');
  console.log('- GET /notifications/unread-count');
  console.log('- PATCH /notifications/:id/read');
  console.log('- PATCH /notifications/mark-all-read');
  console.log('- POST /notifications');
  console.log('- POST /notifications/test/shipment');
  console.log('- POST /notifications/test/delivery');
  console.log('- POST /notifications/test/system');
  console.log('- GET /health');
});
