#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { promisify } = require('util');

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

async function checkDatabaseRunning() {
  try {
    // Check if prisma dev is actually running
    const { stdout } = await execAsync('npx prisma dev ls');
    const isRunning = stdout.includes('running');
    
    if (!isRunning) {
      return false;
    }
    
    // Double-check by testing the connection
    try {
      await execAsync('npx prisma db push --accept-data-loss', { timeout: 5000 });
      return true;
    } catch (dbError) {
      // If connection fails, the database is not properly running
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function startDatabase() {
  log('📊 Starting Prisma dev database...', 'blue');
  
  // Start the database in background with proper stdio handling
  const dbProcess = spawn('npx', ['prisma', 'dev'], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Keep a reference to prevent garbage collection
  global.dbProcess = dbProcess;
  
  // Don't unref - we want to keep the process alive
  // dbProcess.unref();
  
  // Wait for database to be ready
  log('⏳ Waiting for database to be ready...', 'yellow');
  
  for (let i = 0; i < 45; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (await checkDatabaseRunning()) {
      log('✅ Database is ready!', 'green');
      return true;
    }
    
    if (i % 5 === 0 && i > 0) {
      log(`⏳ Still waiting... (${i}/45 seconds)`, 'yellow');
    }
  }
  
  log('❌ Database failed to start after 45 seconds', 'red');
  process.exit(1);
}

async function ensureSchema() {
  log('🔄 Ensuring database schema is up to date...', 'blue');
  try {
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss');
    if (stdout.includes('already in sync')) {
      log('✅ Schema is already up to date', 'green');
    } else {
      log('✅ Schema updated successfully', 'green');
    }
  } catch (error) {
    log(`⚠️  Schema update error: ${error.message}`, 'yellow');
    log('Continuing anyway...', 'yellow');
  }
}

async function seedDatabase() {
  log('🌱 Checking database data...', 'blue');
  try {
    const { stdout, stderr } = await execAsync('npm run db:seed');
    if (stdout.includes('Database seeding completed!')) {
      log('📦 Database seeded with sample data', 'green');
    } else {
      log('📦 Database seeding completed', 'green');
    }
  } catch (error) {
    // Database might already have data
    if (error.message.includes('unique constraint') || error.message.includes('Unique constraint')) {
      log('📦 Database already has data', 'green');
    } else {
      log(`⚠️  Database seeding error: ${error.message}`, 'yellow');
      log('This is usually fine if the database already has data', 'yellow');
    }
  }
}

async function startDevServer() {
  log('🎉 Development environment ready!', 'green');
  log('📍 Database running on: localhost:51214', 'cyan');
  log('🌐 Starting Next.js development server...', 'blue');
  log('', 'reset');
  
  // Start the development server
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  devProcess.on('close', (code) => {
    log(`\n👋 Development server stopped with code ${code}`, 'yellow');
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Shutting down development server...', 'yellow');
    devProcess.kill('SIGINT');
    
    // Keep database running - don't kill it
    // The database will continue running in the background
    log('💾 Database will remain running for future use', 'cyan');
  });
  
  // Handle other shutdown signals
  process.on('SIGTERM', () => {
    log('\n🛑 Shutting down development server...', 'yellow');
    devProcess.kill('SIGTERM');
    log('💾 Database will remain running for future use', 'cyan');
  });
}

async function main() {
  try {
    log('🚀 Starting TrustedTenancy development environment...', 'green');
    
    // Check if database is already running
    if (await checkDatabaseRunning()) {
      log('✅ Database is already running', 'green');
    } else {
      await startDatabase();
    }
    
    // Ensure database schema is up to date
    await ensureSchema();
    
    // Seed database if needed
    await seedDatabase();
    
    // Start the development server
    await startDevServer();
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();