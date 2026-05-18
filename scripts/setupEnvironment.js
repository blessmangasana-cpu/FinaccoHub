#!/usr/bin/env node
/**
 * Environment Setup Validator
 * Validates that all required environment variables are set correctly
 */

const requiredVars = {
  all: ['DATABASE_URL', 'RSE_SCRAPE_URL'],
  prisma: ['DIRECT_URL']
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log('\n🔍 Environment Configuration Check\n', 'blue');
  log('═'.repeat(60), 'blue');
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  // Check required variables
  log('\n📋 Required Variables:', 'blue');
  requiredVars.all.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log(`  ✅ ${varName}: Set`, 'green');
      passed++;
      
      // Validate format
      if (varName === 'DATABASE_URL') {
        if (value.includes('localhost')) {
          log(`     ℹ️  Using local database`, 'yellow');
        } else if (value.includes('supabase.com')) {
          log(`     ℹ️  Using Supabase (production)`, 'green');
          
          // Check for connection pooling
          if (value.includes('?pgbouncer=true')) {
            log(`     ✅ Connection pooling enabled`, 'green');
          } else {
            log(`     ⚠️  Connection pooling not enabled`, 'yellow');
            warnings++;
          }
          
          // Check port
          if (value.includes(':6543/')) {
            log(`     ✅ Using pooled port (6543)`, 'green');
          } else if (value.includes(':5432/')) {
            log(`     ⚠️  Using direct port (5432) - should be 6543 for DATABASE_URL`, 'yellow');
            warnings++;
          }
        }
      }
    } else {
      log(`  ❌ ${varName}: Missing`, 'red');
      failed++;
    }
  });
  
  // Check Prisma-specific variables
  log('\n🗄️  Prisma Configuration:', 'blue');
  requiredVars.prisma.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log(`  ✅ ${varName}: Set`, 'green');
      passed++;
      
      if (value.includes('localhost')) {
        log(`     ℹ️  Using local database`, 'yellow');
      } else if (value.includes('supabase.com')) {
        log(`     ℹ️  Using Supabase (production)`, 'green');
        
        // Check port for DIRECT_URL
        if (value.includes(':5432/')) {
          log(`     ✅ Using direct port (5432)`, 'green');
        } else if (value.includes(':6543/')) {
          log(`     ⚠️  Using pooled port (6543) - should be 5432 for DIRECT_URL`, 'yellow');
          warnings++;
        }
        
        // Check no pgbouncer
        if (!value.includes('pgbouncer')) {
          log(`     ✅ No pgbouncer (correct for DIRECT_URL)`, 'green');
        } else {
          log(`     ⚠️  Has pgbouncer - should not be in DIRECT_URL`, 'yellow');
          warnings++;
        }
      }
    } else {
      log(`  ❌ ${varName}: Missing`, 'red');
      failed++;
    }
  });
  
  // Check optional but recommended
  log('\n⚙️  Optional Configuration:', 'blue');
  const optional = ['NODE_ENV', 'LOG_LEVEL', 'ENABLE_SCHEDULER'];
  optional.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log(`  ✅ ${varName}: ${value}`, 'green');
    } else {
      log(`  ℹ️  ${varName}: Not set (using default)`, 'yellow');
    }
  });
  
  // Environment detection
  log('\n🌍 Environment Detection:', 'blue');
  const isLocal = process.env.DATABASE_URL?.includes('localhost');
  const isProduction = process.env.DATABASE_URL?.includes('supabase.com');
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  
  if (isLocal) {
    log('  📍 Environment: Local Development', 'green');
  } else if (isProduction) {
    log('  📍 Environment: Production (Supabase)', 'green');
  } else if (isCI) {
    log('  📍 Environment: CI/CD', 'green');
  } else {
    log('  ⚠️  Environment: Unknown', 'yellow');
  }
  
  // Summary
  log('\n' + '═'.repeat(60), 'blue');
  log('\n📊 Summary:', 'blue');
  log(`  ✅ Passed: ${passed}`, 'green');
  if (warnings > 0) {
    log(`  ⚠️  Warnings: ${warnings}`, 'yellow');
  }
  if (failed > 0) {
    log(`  ❌ Failed: ${failed}`, 'red');
  }
  
  log('');
  
  if (failed > 0) {
    log('❌ Environment check failed! Please fix the issues above.\n', 'red');
    process.exit(1);
  } else if (warnings > 0) {
    log('⚠️  Environment check passed with warnings.\n', 'yellow');
    process.exit(0);
  } else {
    log('✅ Environment check passed! All configurations are correct.\n', 'green');
    process.exit(0);
  }
}

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Run check
checkEnvironment();
