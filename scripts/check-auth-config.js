#!/usr/bin/env node

/**
 * TrustedTenancy Authentication Configuration Checker
 * 
 * Checks that all required environment variables and configurations are present
 * for Google OAuth authentication to work properly.
 */

// Load environment variables from .env file
const fs = require('fs')
const path = require('path')

try {
  const envPath = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const [key, ...value] = line.split('=')
      if (key && value.length > 0) {
        process.env[key.trim()] = value.join('=').trim()
      }
    })
  }
} catch (error) {
  console.log('Could not load .env file, using system environment variables only')
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkEnvVar(name, required = true) {
  const value = process.env[name]
  const exists = !!value
  const status = exists ? '✅' : (required ? '❌' : '⚠️')
  const statusColor = exists ? 'green' : (required ? 'red' : 'yellow')
  
  log(`${status} ${name}: ${exists ? '***set***' : 'not set'}`, statusColor)
  
  if (exists && name.includes('URL')) {
    log(`   Value: ${value}`, 'blue')
  }
  
  return exists
}

function checkGoogleOAuthConfig() {
  log('\n🔍 Checking Google OAuth Configuration...', 'cyan')
  
  const googleClientId = checkEnvVar('GOOGLE_CLIENT_ID', true)
  const googleClientSecret = checkEnvVar('GOOGLE_CLIENT_SECRET', true)
  
  if (googleClientId && process.env.GOOGLE_CLIENT_ID) {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId.endsWith('.apps.googleusercontent.com')) {
      log('⚠️  GOOGLE_CLIENT_ID format may be incorrect (should end with .apps.googleusercontent.com)', 'yellow')
    }
  }
  
  return googleClientId && googleClientSecret
}

function checkNextAuthConfig() {
  log('\n🔧 Checking NextAuth Configuration...', 'cyan')
  
  const nextAuthUrl = checkEnvVar('NEXTAUTH_URL', true)
  const nextAuthSecret = checkEnvVar('NEXTAUTH_SECRET', true)
  
  if (nextAuthUrl && process.env.NEXTAUTH_URL) {
    const url = process.env.NEXTAUTH_URL
    if (!url.startsWith('http')) {
      log('❌ NEXTAUTH_URL should start with http:// or https://', 'red')
    }
  }
  
  return nextAuthUrl && nextAuthSecret
}

function checkDatabaseConfig() {
  log('\n🗄️  Checking Database Configuration...', 'cyan')
  
  const databaseUrl = checkEnvVar('DATABASE_URL', true)
  
  return databaseUrl
}

function main() {
  log(`${colors.bold}🔐 TrustedTenancy Authentication Configuration Check${colors.reset}`, 'cyan')
  log('─'.repeat(60), 'blue')
  
  const googleOk = checkGoogleOAuthConfig()
  const nextAuthOk = checkNextAuthConfig()
  const databaseOk = checkDatabaseConfig()
  
  log('\n📋 Summary:', 'cyan')
  log(`Google OAuth: ${googleOk ? '✅ Ready' : '❌ Needs configuration'}`, googleOk ? 'green' : 'red')
  log(`NextAuth: ${nextAuthOk ? '✅ Ready' : '❌ Needs configuration'}`, nextAuthOk ? 'green' : 'red')
  log(`Database: ${databaseOk ? '✅ Ready' : '❌ Needs configuration'}`, databaseOk ? 'green' : 'red')
  
  if (googleOk && nextAuthOk && databaseOk) {
    log('\n🎉 All configurations look good!', 'green')
    
    log('\n💡 Next steps to test authentication:', 'blue')
    log('1. Visit http://localhost:3000/auth/signup', 'blue')
    log('2. Click "Sign up with Google"', 'blue')
    log('3. Check logs/ directory for detailed authentication logs', 'blue')
  } else {
    log('\n⚠️  Some configurations are missing. Authentication may not work properly.', 'yellow')
    
    if (!googleOk) {
      log('\n🔧 To set up Google OAuth:', 'blue')
      log('1. Go to https://console.developers.google.com/', 'blue')
      log('2. Create a new project or select existing one', 'blue')
      log('3. Enable Google+ API', 'blue')
      log('4. Create OAuth 2.0 credentials', 'blue')
      log('5. Add http://localhost:3000/api/auth/callback/google to authorized redirect URIs', 'blue')
      log('6. Copy Client ID and Client Secret to .env file', 'blue')
    }
  }
  
  process.exit(googleOk && nextAuthOk && databaseOk ? 0 : 1)
}

main()