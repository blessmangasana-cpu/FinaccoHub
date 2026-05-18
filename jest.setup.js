import { File } from "node:buffer";
import dotenv from 'dotenv';
import path from 'path';

// Make File available globally for tests
global.File = File;

// Load environment variables for tests
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Set test environment defaults if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/RSE';
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = 'postgresql://postgres:postgres@localhost:5432/RSE';
}

if (!process.env.RSE_SCRAPE_URL && !process.env.RSE_URL) {
  process.env.RSE_SCRAPE_URL = 'https://www.rse.rw/';
}

process.env.NODE_ENV = 'test';
