#!/usr/bin/env node

/**
 * TrustedTenancy Regression Test Script
 * 
 * Tests core functionality to ensure no regressions have been introduced.
 * Assumes the development server is already running.
 * 
 * Usage: node scripts/regression-test.js [port]
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logResult(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const statusColor = passed ? 'green' : 'red';
  log(`${status} ${testName}${details ? ' - ' + details : ''}`, statusColor);
}

async function makeRequest(url, options = {}) {
  const { timeout = 10000, expectJson = false } = options;
  
  try {
    const curlCmd = `curl -s -w "\\n%{http_code}\\n%{time_total}" --max-time ${timeout/1000} "${url}"`;
    const { stdout } = await execAsync(curlCmd);
    
    const lines = stdout.trim().split('\n');
    const statusCode = parseInt(lines[lines.length - 2]);
    const responseTime = parseFloat(lines[lines.length - 1]);
    const body = lines.slice(0, -2).join('\n');
    
    let jsonData = null;
    if (expectJson && body) {
      try {
        jsonData = JSON.parse(body);
      } catch (e) {
        // Invalid JSON
      }
    }
    
    return {
      statusCode,
      responseTime,
      body,
      jsonData,
      success: statusCode >= 200 && statusCode < 300
    };
  } catch (error) {
    return {
      statusCode: 0,
      responseTime: 0,
      body: '',
      jsonData: null,
      success: false,
      error: error.message
    };
  }
}

async function runRegressionTests(port = 3000) {
  const baseUrl = `http://localhost:${port}`;
  
  log(`\n${colors.bold}🧪 TrustedTenancy Regression Test Suite${colors.reset}`, 'cyan');
  log(`Testing against: ${baseUrl}`, 'blue');
  log('─'.repeat(60), 'blue');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test 1: Health Check
  totalTests++;
  log('\n📊 Testing database health...', 'yellow');
  const healthResponse = await makeRequest(`${baseUrl}/api/health`, { expectJson: true, timeout: 30000 });
  const healthPassed = healthResponse.success && 
                      healthResponse.jsonData?.status === 'healthy' &&
                      healthResponse.jsonData?.database?.connected === true;
  
  logResult('Database Health Check', healthPassed, 
    healthPassed ? `${healthResponse.responseTime}s` : `Status: ${healthResponse.statusCode}`);
  if (healthPassed) passedTests++;
  
  // Test 2: Homepage
  totalTests++;
  log('\n🏠 Testing homepage...', 'yellow');
  const homeResponse = await makeRequest(`${baseUrl}/`);
  const homePassed = homeResponse.success;
  
  logResult('Homepage Load', homePassed, 
    homePassed ? `${homeResponse.responseTime}s` : `Status: ${homeResponse.statusCode}`);
  if (homePassed) passedTests++;
  
  // Test 3: Properties Page
  totalTests++;
  log('\n🏘️  Testing properties page...', 'yellow');
  const propertiesPageResponse = await makeRequest(`${baseUrl}/properties`);
  const propertiesPagePassed = propertiesPageResponse.success;
  
  logResult('Properties Page', propertiesPagePassed, 
    propertiesPagePassed ? `${propertiesPageResponse.responseTime}s` : `Status: ${propertiesPageResponse.statusCode}`);
  if (propertiesPagePassed) passedTests++;
  
  // Test 4: Properties API
  totalTests++;
  log('\n🔌 Testing properties API...', 'yellow');
  const propertiesApiResponse = await makeRequest(`${baseUrl}/api/properties?limit=1`, { expectJson: true, timeout: 30000 });
  const propertiesApiPassed = propertiesApiResponse.success && 
                              propertiesApiResponse.jsonData?.properties !== undefined;
  
  logResult('Properties API', propertiesApiPassed, 
    propertiesApiPassed ? `${propertiesApiResponse.responseTime}s` : `Status: ${propertiesApiResponse.statusCode}`);
  if (propertiesApiPassed) passedTests++;
  
  // Test 5: Landlords Page
  totalTests++;
  log('\n👨‍💼 Testing landlords page...', 'yellow');
  const landlordsResponse = await makeRequest(`${baseUrl}/landlords`);
  const landlordsPassed = landlordsResponse.success;
  
  logResult('Landlords Page', landlordsPassed, 
    landlordsPassed ? `${landlordsResponse.responseTime}s` : `Status: ${landlordsResponse.statusCode}`);
  if (landlordsPassed) passedTests++;
  
  // Test 6: Individual Property Page (if we have properties)
  if (propertiesApiResponse.jsonData?.properties?.length > 0) {
    totalTests++;
    const propertyId = propertiesApiResponse.jsonData.properties[0].id;
    log('\n🏠 Testing individual property page...', 'yellow');
    const propertyResponse = await makeRequest(`${baseUrl}/properties/${propertyId}`);
    const propertyPassed = propertyResponse.success;
    
    logResult('Individual Property Page', propertyPassed, 
      propertyPassed ? `${propertyResponse.responseTime}s` : `Status: ${propertyResponse.statusCode}`);
    if (propertyPassed) passedTests++;
  }
  
  // Test 7: Circuit Breaker Status (from health endpoint)
  totalTests++;
  log('\n🔄 Testing circuit breaker status...', 'yellow');
  const circuitBreakerPassed = healthResponse.success && 
                               healthResponse.jsonData?.database?.circuit_breaker?.isOpen === false;
  
  logResult('Circuit Breaker Status', circuitBreakerPassed, 
    circuitBreakerPassed ? 'Closed (healthy)' : 'Open or unknown');
  if (circuitBreakerPassed) passedTests++;
  
  // Test Summary
  log('\n' + '─'.repeat(60), 'blue');
  log(`${colors.bold}📋 Test Results Summary${colors.reset}`, 'cyan');
  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, passedTests === totalTests ? 'green' : 'yellow');
  log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests === 0 ? 'green' : 'red');
  
  const successRate = Math.round((passedTests / totalTests) * 100);
  log(`Success Rate: ${successRate}%`, successRate === 100 ? 'green' : successRate >= 80 ? 'yellow' : 'red');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! No regressions detected.', 'green');
    return 0;
  } else {
    log('\n⚠️  Some tests failed. Check for regressions.', 'red');
    return 1;
  }
}

// Parse command line arguments
const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;

if (isNaN(port) || port < 1 || port > 65535) {
  log('❌ Invalid port number. Please provide a valid port (1-65535).', 'red');
  process.exit(1);
}

// Run the tests
runRegressionTests(port)
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    log(`❌ Test suite failed with error: ${error.message}`, 'red');
    process.exit(1);
  });