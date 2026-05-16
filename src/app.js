/**
 * Application Entry Point
 * 
 * This is the main application file that sets up the environment,
 * initializes services, and starts the scheduled jobs.
 */

import dotenv from 'dotenv';
import { info, error } from './utils/logger.js';
import { initializeScheduler } from './jobs/scheduler.js';

// Load environment variables
dotenv.config();

// Application version
const APP_VERSION = '1.0.0';
const APP_NAME = process.env.APP_NAME || 'rse-data-pipeline';

/**
 * Initialize the application
 */
export async function initializeApp() {
  try {
    info(`Starting ${APP_NAME} v${APP_VERSION}`);
    info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Validate required environment variables
    validateEnvironment();
    
    // Initialize scheduler
    if (process.env.ENABLE_SCHEDULER === 'true') {
      info('Initializing scheduler...');
      initializeScheduler();
      info(`Scheduler set to run at ${process.env.SCHEDULER_TIME || '17:15'} Africa/Kigali time`);
    } else {
      info('Scheduler is disabled');
    }
    
    info(`${APP_NAME} is ready`);
  } catch (err) {
    error(`Failed to initialize application: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const requiredVars = ['DATABASE_URL'];
  const missing = [];
  
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (!process.env.RSE_SCRAPE_URL && !process.env.RSE_URL) {
    throw new Error('Missing required environment variable: RSE_SCRAPE_URL or RSE_URL');
  }
}

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  error(`Unhandled Rejection at ${promise}: ${reason}`);
  process.exit(1);
});

if (process.argv[1]?.endsWith('app.js')) {
  initializeApp();
}

export default initializeApp;
