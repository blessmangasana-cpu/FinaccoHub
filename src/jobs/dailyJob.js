import runScraper from '../scraper/scrapeRSE.js';
import { isTradingDay, currentRwandaDate } from '../utils/marketCalendar.js';
import { info, skip, error } from '../utils/logger.js';

const main = async () => {
  const tradeDate = currentRwandaDate();
  if (!isTradingDay(tradeDate)) {
    skip(`Skipped ${tradeDate}: not a trading day`);
    return;
  }

  try {
    await runScraper();
  } catch (err) {
    error(`Daily job failed: ${err.message}`);
    process.exit(1);
  }
};

if (process.argv[1]?.endsWith('dailyJob.js')) {
  main();
}

export default main;
