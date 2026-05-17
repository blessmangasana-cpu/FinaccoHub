import runScraper from '../src/scraper/scrapeRSE.js';
import { currentRwandaDate, subtractDays } from '../src/utils/dateHelpers.js';
import { info, error } from '../src/utils/logger.js';

const parseArg = (name, defaultValue) => {
  const arg = process.argv.find((value) => value.startsWith(`--${name}=`));
  if (!arg) return defaultValue;
  return arg.split('=')[1];
};

const weeks = Number(parseArg('weeks', '7')) || 7;
const direction = parseArg('direction', 'past');
const currentDate = currentRwandaDate();

import { isTradingDay } from '../src/utils/marketCalendar.js';

const buildDates = () => {
  const dates = [];
  const totalDays = weeks * 7;
  for (let i = 0; i < totalDays; i += 1) {
    const offset = direction === 'future' ? -i : i;
    const dateStr = subtractDays(currentDate, offset);
    if (isTradingDay(dateStr)) {
      dates.push(dateStr);
    }
  }
  return dates;
};

const main = async () => {
  const dates = buildDates().reverse();
  info(`Starting historical scrape for ${weeks} week(s): ${dates.join(', ')}`);

  for (const date of dates) {
    info(`Scraping trade date ${date}`);
    try {
      await runScraper({ tradeDate: date });
    } catch (err) {
      error(`Failed for ${date}: ${err.message}`);
    }
  }
};

main().catch((err) => {
  error(`Historical scrape failed: ${err.message}`);
  process.exit(1);
});
