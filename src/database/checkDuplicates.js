import env from '../config/env.js';
import prisma from './prismaClient.js';

export const getExistingRecords = async (tradeDate) => {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required for local Postgres access.');
  }

  const rows = await prisma.equity.findMany({
    where: { tradeDate: new Date(tradeDate) },
    select: { tradeDate: true, security: true }
  });

  return new Set(rows.map((r) => `${r.tradeDate.toISOString().slice(0,10)}|${r.security}`));
};
