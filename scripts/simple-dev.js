#!/usr/bin/env node

const { spawn } = require('child_process');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function startDatabaseAndWait() {
  log('🚀 Starting TrustedTenancy with database...', 'green');
  
  // Clean up any existing connections first
  log('🧹 Cleaning up existing database connections...', 'blue');
  try {
    await execAsync('npx prisma dev stop default', { timeout: 5000 });
  } catch (error) {
    // Ignore if no database was running
  }
  
  // Wait a moment for cleanup
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Start the database process
  log('📊 Starting Prisma dev database...', 'blue');
  const dbProcess = spawn('npx', ['prisma', 'dev'], {
    stdio: ['ignore', 'ignore', 'ignore']
  });
  
  // Wait for the database to be ready
  log('⏳ Waiting for database to be ready...', 'yellow');
  
  // Give the database some time to start
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Create the dedicated development database
  log('🏗️  Creating development database...', 'blue');
  try {
    await execAsync('PGPASSWORD=postgres psql -h localhost -p 51214 -U postgres -d template1 -c "CREATE DATABASE trustedtenancy_dev;"', { timeout: 10000 });
    log('✅ Development database created!', 'green');
  } catch (error) {
    if (error.message.includes('already exists')) {
      log('✅ Development database already exists', 'green');
    } else {
      log('⚠️  Database creation had issues, but continuing...', 'yellow');
    }
  }
  
  // Test database connection with retries
  for (let i = 0; i < 20; i++) {
    try {
      await execAsync('npx prisma db push --accept-data-loss', { timeout: 10000 });
      log('✅ Database connection successful!', 'green');
      break;
    } catch (error) {
      if (i === 19) {
        log('❌ Database failed to connect after 20 attempts', 'red');
        log('Error details:', 'red');
        console.error(error.message);
        process.exit(1);
      }
      log(`⏳ Connection attempt ${i + 1}/20 failed, retrying...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Seed the database
  log('🌱 Seeding database...', 'blue');
  try {
    await execAsync('npm run db:seed');
    log('✅ Database seeded successfully', 'green');
  } catch (error) {
    if (error.message.includes('unique constraint')) {
      log('✅ Database already has data', 'green');
    } else {
      log('⚠️  Seeding had issues, but continuing...', 'yellow');
    }
  }
  
  // Start the dev server
  log('🌐 Starting Next.js development server...', 'blue');
  log('📍 Database running on: localhost:51214', 'cyan');
  log('🌍 App will be available at: http://localhost:3000', 'cyan');
  log('', 'reset');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Handle shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down...', 'yellow');
    devProcess.kill('SIGINT');
    dbProcess.kill('SIGINT');
    process.exit(0);
  });
  
  devProcess.on('close', (code) => {
    log(`\n👋 Development server stopped with code ${code}`, 'yellow');
    dbProcess.kill('SIGINT');
    process.exit(code);
  });
}

startDatabaseAndWait().catch(error => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
});