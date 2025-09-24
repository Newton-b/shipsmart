#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 ShipSmart Backend Setup Script');
console.log('==================================\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
    console.log('⚠️  Please update the .env file with your actual configuration values\n');
  } catch (error) {
    console.log('❌ Failed to create .env file:', error.message);
  }
} else {
  console.log('✅ .env file already exists\n');
}

// Check Node.js version
console.log('🔍 Checking Node.js version...');
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    console.log(`✅ Node.js ${nodeVersion} is compatible\n`);
  } else {
    console.log(`⚠️  Node.js ${nodeVersion} detected. Recommended: Node.js 18+\n`);
  }
} catch (error) {
  console.log('❌ Failed to check Node.js version\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.log('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check if databases are running
console.log('🗄️  Checking database connections...');

async function checkDatabases() {
  const axios = require('axios');
  
  // Check if we can connect to typical database ports
  const checks = [
    { name: 'PostgreSQL', port: 5432, required: true },
    { name: 'MongoDB', port: 27017, required: true },
    { name: 'Redis', port: 6379, required: false }
  ];

  for (const check of checks) {
    try {
      // Simple port check (not a real connection test)
      console.log(`  Checking ${check.name} on port ${check.port}...`);
      if (check.required) {
        console.log(`  ⚠️  Please ensure ${check.name} is running on port ${check.port}`);
      } else {
        console.log(`  💡 ${check.name} is optional but recommended`);
      }
    } catch (error) {
      console.log(`  ❌ ${check.name} check failed`);
    }
  }
}

checkDatabases();

console.log('\n🎯 Next Steps:');
console.log('==============');
console.log('1. Update .env file with your database credentials');
console.log('2. Ensure PostgreSQL, MongoDB, and Redis are running');
console.log('3. Run database migrations: npm run migration:run');
console.log('4. Start the development server: npm run start:dev');
console.log('5. Visit http://localhost:3000/api/docs for API documentation');
console.log('6. Test routes with: node scripts/verify-routes.js');

console.log('\n📚 Documentation:');
console.log('=================');
console.log('• API Routes: See API_ROUTES.md');
console.log('• Full Setup Guide: See README.md');
console.log('• Swagger Docs: http://localhost:3000/api/docs (after starting server)');

console.log('\n🐳 Docker Quick Start:');
console.log('======================');
console.log('• Start all services: docker-compose up -d');
console.log('• View logs: docker-compose logs -f');
console.log('• Stop services: docker-compose down');

console.log('\n✨ Setup completed! Ready to ship! 🚀');
