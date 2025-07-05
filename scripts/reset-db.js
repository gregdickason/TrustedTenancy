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

async function resetDatabase() {
  log('🔄 Resetting TrustedTenancy database...', 'green');
  
  try {
    // Stop existing database
    log('🛑 Stopping existing database...', 'blue');
    try {
      await execAsync('npx prisma dev stop default', { timeout: 10000 });
      log('✅ Database stopped', 'green');
    } catch (error) {
      log('ℹ️  No database was running', 'cyan');
    }
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start fresh database
    log('🚀 Starting fresh database...', 'blue');
    const dbProcess = spawn('npx', ['prisma', 'dev'], {
      stdio: ['ignore', 'ignore', 'ignore']
    });
    
    // Wait for database to start
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Create development database
    log('🏗️  Creating development database...', 'blue');
    try {
      await execAsync('PGPASSWORD=postgres psql -h localhost -p 51214 -U postgres -d template1 -c "DROP DATABASE IF EXISTS trustedtenancy_dev;"', { timeout: 10000 });
      await execAsync('PGPASSWORD=postgres psql -h localhost -p 51214 -U postgres -d template1 -c "CREATE DATABASE trustedtenancy_dev;"', { timeout: 10000 });
      log('✅ Development database recreated!', 'green');
    } catch (error) {
      log('⚠️  Database creation had issues:', 'yellow');
      console.error(error.message);
    }
    
    // Push schema
    log('📊 Pushing database schema...', 'blue');
    try {
      await execAsync('npx prisma db push --force-reset', { timeout: 15000 });
      log('✅ Schema pushed successfully!', 'green');
    } catch (error) {
      log('❌ Schema push failed:', 'red');
      console.error(error.message);
      process.exit(1);
    }
    
    // Generate Prisma client
    log('🔧 Generating Prisma client...', 'blue');
    try {
      await execAsync('npx prisma generate', { timeout: 15000 });
      log('✅ Prisma client generated!', 'green');
    } catch (error) {
      log('⚠️  Client generation had issues:', 'yellow');
      console.error(error.message);
    }
    
    // Seed database
    log('🌱 Seeding database with fresh data...', 'blue');
    try {
      await execAsync('npm run db:seed', { timeout: 15000 });
      log('✅ Database seeded successfully!', 'green');
    } catch (error) {
      log('⚠️  Seeding had issues:', 'yellow');
      console.error(error.message);
    }
    
    log('🎉 Database reset complete!', 'green');
    log('📍 Database running on: localhost:51214', 'cyan');
    log('🌍 Ready for development!', 'cyan');
    
    // Keep database running
    log('💾 Database will continue running in background', 'cyan');
    dbProcess.unref();
    
  } catch (error) {
    log(`❌ Error during database reset: ${error.message}`, 'red');
    process.exit(1);
  }
}

resetDatabase().catch(error => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
});