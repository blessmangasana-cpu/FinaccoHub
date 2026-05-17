import { setInterval } from 'node:timers';
import { isTradingDay, currentRwandaDate } from '../utils/marketCalendar.js';
import job from './dailyJob.js';
import { info, error } from '../utils/logger.js';

const checkIntervalMs = 1000 * 60; // Check every 1 minute
const defaultScheduleTime = '17:15';

export const getRwandaHourMinute = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Kigali',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);

  const hour = parts.find((part) => part.type === 'hour')?.value;
  const minute = parts.find((part) => part.type === 'minute')?.value;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const initializeScheduler = async () => {
  const scheduleTime = process.env.SCHEDULER_TIME || defaultScheduleTime;
  let lastRunKey = null;

  info(`RSE Scheduler: Running daily checks at ${scheduleTime} Africa/Kigali time on trading days.`);

  const check = async () => {
    const tradeDate = currentRwandaDate();
    const hourMinute = getRwandaHourMinute();
    const runKey = `${tradeDate}|${hourMinute}`;

    if (isTradingDay(tradeDate) && hourMinute === scheduleTime && lastRunKey !== runKey) {
      lastRunKey = runKey;
      info(`Market close time reached at ${hourMinute}. Running daily scrape for ${tradeDate}...`);
      try {
        await job();
      } catch (err) {
        error(`Scheduled job failed: ${err.message}`);
      }
    }
  };

  await check();
  return setInterval(check, checkIntervalMs);
};

if (process.argv[1]?.endsWith('scheduler.js')) {
  initializeScheduler().catch((err) => {
    error(`Scheduler error: ${err.message}`);
    process.exit(1);
  });
}

export default initializeScheduler;
