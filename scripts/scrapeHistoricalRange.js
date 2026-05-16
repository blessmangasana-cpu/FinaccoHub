import runScraper from '../src/scraper/scrapeRSE.js';
import { isTradingDay } from '../src/utils/marketCalendar.js';
import { info, error } from '../src/utils/logger.js';

/**
 * Scrape historical data from a start date to an end date
 * Usage: node scripts/scrapeHistoricalRange.js --start=2026-01-01 --end=2026-05-15
 */

const parseArg = (name, defaultValue) => {
  const arg = process.argv.find((value) => value.startsWith(`--${name}=`));
  if (!arg) return defaultValue;
  return arg.split('=')[1];
};

const startDateStr = parseArg('start', '2026-01-01');
const endDateStr = parseArg('end', '2026-05-15');

const generateDateRange = (startStr, endStr) => {
  const dates = [];
  const current = new Date(startStr);
  const end = new Date(endStr);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    if (isTradingDay(dateStr)) {
      dates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const main = async () => {
  const dates = generateDateRange(startDateStr, endDateStr);
  
  info(`Starting historical scrape from ${startDateStr} to ${endDateStr}`);
  info(`Trading days to scrape: ${dates.length}`);

  let successCount = 0;
  let failureCount = 0;
  let skipCount = 0;

  for (const date of dates) {
    try {
      info(`Scraping trade date ${date}...`);
      const result = await runScraper({ tradeDate: date });
      
      if (result.inserted > 0) {
        successCount += 1;
        info(`  ✓ ${result.inserted} records inserted, ${result.skipped} skipped`);
      } else if (result.skipped > 0) {
        skipCount += 1;
        info(`  ⚠ All ${result.skipped} records already existed (skipped)`);
      }
    } catch (err) {
      failureCount += 1;
      error(`  ✗ Failed for ${date}: ${err.message}`);
    }
  }

  info(`\n=== HISTORICAL SCRAPE COMPLETED ===`);
  info(`Total trading days: ${dates.length}`);
  info(`Successfully scraped: ${successCount}`);
  info(`Skipped (duplicates): ${skipCount}`);
  info(`Failed: ${failureCount}`);
  info(`Total records expected: ~${dates.length * 10} (10 stocks per day)`);
};

main().catch((err) => {
  error(`Historical scrape failed: ${err.message}`);
  process.exit(1);
});
