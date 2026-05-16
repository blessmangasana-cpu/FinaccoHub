import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const rseScrapeUrl = process.env.RSE_SCRAPE_URL || process.env.RSE_URL || '';

const env = {
  rseScrapeUrl,
  logLevel: process.env.LOG_LEVEL || 'info',
  backupRawJson: process.env.BACKUP_RAW_JSON === 'false' ? false : true,
  databaseUrl: process.env.DATABASE_URL || ''
};

export default env;
