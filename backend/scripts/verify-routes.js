const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test routes that don't require authentication
const publicRoutes = [
  { method: 'POST', path: '/auth/register', data: { email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' } },
  { method: 'POST', path: '/auth/login', data: { email: 'test@example.com', password: 'password123' } },
];

// Test routes that require authentication
const protectedRoutes = [
  { method: 'GET', path: '/auth/profile' },
  { method: 'GET', path: '/users/profile' },
  { method: 'GET', path: '/shipments' },
  { method: 'GET', path: '/payments' },
  { method: 'GET', path: '/carriers/supported' },
  { method: 'GET', path: '/notifications' },
  { method: 'GET', path: '/notifications/unread-count' },
  { method: 'GET', path: '/analytics/dashboard' },
];

let authToken = null;

async function testRoute(route) {
  try {
    const config = {
      method: route.method.toLowerCase(),
      url: `${BASE_URL}${route.path}`,
      headers: {},
    };

    if (route.data) {
      config.data = route.data;
      config.headers['Content-Type'] = 'application/json';
    }

    if (authToken && !route.path.startsWith('/auth/')) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios(config);
    console.log(`✅ ${route.method} ${route.path} - Status: ${response.status}`);
    return response.data;
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.message || error.message;
    console.log(`❌ ${route.method} ${route.path} - Status: ${status} - Error: ${message}`);
    return null;
  }
}

async function verifyRoutes() {
  console.log('🚀 Starting ShipSmart API Route Verification\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Test public routes first
  console.log('📋 Testing Public Routes:');
  console.log('========================');
  
  for (const route of publicRoutes) {
    const result = await testRoute(route);
    
    // Extract auth token from login response
    if (route.path === '/auth/login' && result?.access_token) {
      authToken = result.access_token;
      console.log('🔑 Authentication token obtained');
    }
    
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }

  console.log('\n📋 Testing Protected Routes:');
  console.log('============================');
  
  if (!authToken) {
    console.log('❌ No auth token available, skipping protected routes');
    return;
  }

  for (const route of protectedRoutes) {
    await testRoute(route);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }

  console.log('\n🏁 Route verification completed!');
  console.log('\n📚 For detailed API documentation, visit: http://localhost:3000/api/docs');
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await axios.get('http://localhost:3000/health');
    console.log('✅ Server is running and healthy');
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not healthy');
    console.log('💡 Please start the server with: npm run start:dev');
    return false;
  }
}

async function main() {
  const isHealthy = await checkServerHealth();
  if (isHealthy) {
    await verifyRoutes();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifyRoutes, checkServerHealth };
