import { currentRwandaDate, formatDate } from './dateHelpers.js';

export { currentRwandaDate };

// Rwanda public holidays 2026 (add as needed)
const RW_HOLIDAYS_2026 = [
  '2026-01-01', // New Year's Day
  '2026-01-02', // Fete Day
  '2026-02-01', // Unity Day
  '2026-03-29', // Easter Sunday (approximate)
  '2026-03-30', // Easter Monday (approximate)
  '2026-04-07', // Genocide Remembrance Day
  '2026-05-01', // Labour Day
  '2026-05-14', // Ascension Day (approximate)
  '2026-05-24', // Whit Sunday (approximate)
  '2026-05-25', // Whit Monday (approximate)
  '2026-08-01', // Independence Day
  '2026-08-15', // Assumption of Mary
  '2026-09-25', // Umuganda
  '2026-11-01', // All Saints' Day
  '2026-12-25'  // Christmas Day
];

export const isWeekend = (dateString) => {
  const date = new Date(dateString);
  const day = date.getUTCDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

export const isPublicHoliday = (dateString) => RW_HOLIDAYS_2026.includes(dateString);

export const isTradingDay = (dateString = currentRwandaDate()) => {
  return !isWeekend(dateString) && !isPublicHoliday(dateString);
};

export const getNextTradingDay = (dateString = currentRwandaDate()) => {
  const date = new Date(dateString);

  do {
    date.setUTCDate(date.getUTCDate() + 1);
  } while (!isTradingDay(formatDate(date)));

  return formatDate(date);
};

