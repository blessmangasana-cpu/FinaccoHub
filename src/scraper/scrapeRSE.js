import fs from 'fs';
import path from 'path';
import env from '../config/env.js';
import { fetchHTML } from './fetchHTML.js';
import { extractEquities } from './extractEquities.js';
import { cleanData } from '../parser/cleanData.js';
import { validateData } from '../parser/validateData.js';
import { transformData } from '../parser/transformData.js';
import { insertData } from '../database/insertData.js';
import { info, error } from '../utils/logger.js';
import { currentRwandaDate } from '../utils/dateHelpers.js';
import { RAW_BACKUP_DIR } from '../utils/constants.js';

const backupRawJson = (payload, tradeDate) => {
  if (!env.backupRawJson) return;
  const rawDir = path.resolve(process.cwd(), RAW_BACKUP_DIR);
  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
  }
  fs.writeFileSync(path.join(rawDir, `${tradeDate}.json`), JSON.stringify(payload, null, 2), 'utf8');
};

export const runScraper = async ({ tradeDate = currentRwandaDate(), url } = {}) => {
  info(`Starting RSE scraper for trade date ${tradeDate}`);

  const configuredUrl = url ?? env.rseScrapeUrl;
  if (!configuredUrl) {
    throw new Error('Missing required environment variable: RSE_SCRAPE_URL or RSE_URL');
  }

  const today = currentRwandaDate();
  if (!url && tradeDate !== today && !configuredUrl.includes('{date}')) {
    throw new Error('Historical scraping requires RSE_SCRAPE_URL to include a {date} placeholder or an explicit URL argument.');
  }

  const targetUrl = configuredUrl.replace('{date}', tradeDate);
  const html = await fetchHTML(targetUrl);
  const extracted = extractEquities(html, tradeDate);
  backupRawJson(extracted, tradeDate);

  const cleaned = cleanData(extracted);
  const validated = validateData(cleaned);
  const transformed = transformData(validated);

  const result = await insertData(transformed);
  info(`Completed scraping for ${tradeDate}: inserted=${result.inserted}, skipped=${result.skipped}`);
  return result;
};

const runScraperDefault = async () => runScraper();

if (process.argv[1]?.endsWith('scrapeRSE.js')) {
  runScraperDefault().catch((err) => {
    error(`Scraper failed: ${err.message}`);
    process.exit(1);
  });
}

export default runScraper;
