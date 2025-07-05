#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

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
    const { stdout } = await execAsync('npx prisma dev ls');
    const isRunning = stdout.includes('running');
    log(`Database status check: ${isRunning ? 'running' : 'not running'}`, 'blue');
    return isRunning;
  } catch (error) {
    log(`Database status check failed: ${error.message}`, 'yellow');
    return false;
  }
}

async function startDatabasePersistent() {
  log('📊 Starting Prisma dev database in persistent mode...', 'blue');
  
  // Create a lock file to track the process
  const lockFile = path.join(__dirname, '..', '.prisma-dev.lock');
  
  try {
    // Start the database
    const dbProcess = spawn('npx', ['prisma', 'dev'], {
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore']
    });
    
    // Save the process ID
    fs.writeFileSync(lockFile, dbProcess.pid.toString());
    
    // Detach the process so it continues running
    dbProcess.unref();
    
    log('⏳ Waiting for database to be ready...', 'yellow');
    
    // Wait for database to be ready
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (await checkDatabaseRunning()) {
        log('✅ Database is ready and running persistently!', 'green');
        return true;
      }
      
      if (i % 10 === 0 && i > 0) {
        log(`⏳ Still waiting... (${i}/60 seconds)`, 'yellow');
      }
    }
    
    log('❌ Database failed to start after 60 seconds', 'red');
    return false;
    
  } catch (error) {
    log(`❌ Error starting database: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Starting persistent Prisma dev database...', 'green');
  
  // Check if database is already running
  if (await checkDatabaseRunning()) {
    log('✅ Database is already running', 'green');
    return;
  }
  
  // Start the database
  const success = await startDatabasePersistent();
  
  if (success) {
    log('🎉 Database started successfully!', 'green');
    log('📍 Database running on: localhost:51214', 'cyan');
    log('💡 Use "npm run db:stop" to stop the database', 'yellow');
  } else {
    log('❌ Failed to start database', 'red');
    process.exit(1);
  }
}

main().catch(error => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
});