import { getExistingRecords } from './checkDuplicates.js';
import env from '../config/env.js';
import prisma from './prismaClient.js';

export const insertData = async (records) => {
  if (!records.length) {
    return { inserted: 0, skipped: 0 };
  }

  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required for local Postgres access.');
  }

  const tradeDates = [...new Set(records.map((record) => record.trade_date))];
  const existingSets = await Promise.all(tradeDates.map((tradeDate) => getExistingRecords(tradeDate)));
  const existingSet = new Set(existingSets.flatMap((set) => [...set]));
  const newRecords = records.filter((record) => !existingSet.has(`${record.trade_date}|${record.security}`));

  if (newRecords.length === 0) {
    return { inserted: 0, skipped: records.length };
  }

  const created = await prisma.$transaction(async (prismaTx) => {
    return Promise.all(newRecords.map((rec) =>
      prismaTx.equity.create({
        data: {
          tradeDate: new Date(rec.trade_date),
          security: rec.security,
          openingPrice: rec.opening_price !== null && rec.opening_price !== undefined ? parseFloat(rec.opening_price) : 0,
          closingPrice: rec.closing_price !== null && rec.closing_price !== undefined ? parseFloat(rec.closing_price) : 0,
          volume: rec.volume !== null && rec.volume !== undefined ? BigInt(String(rec.volume).replace(/,/g, '')) : 0n,
          value: rec.value !== null && rec.value !== undefined ? parseFloat(String(rec.value).replace(/,/g, '')) : 0,
        }
      })
    ));
  });

  return { inserted: created.length, skipped: records.length - created.length };
};
