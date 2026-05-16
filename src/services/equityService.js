import prisma from '../database/prismaClient.js';
import { error as logError } from '../utils/logger.js';

class EquityService {
  async insertEquities(equities) {
    try {
      const results = {
        inserted: 0,
        updated: 0,
        failed: 0,
        errors: []
      };

      for (const equity of equities) {
        try {
          const existing = await prisma.equity.findUnique({
            where: {
              unique_trade_date_security: {
                tradeDate: new Date(equity.tradeDate),
                security: equity.security
              }
            }
          });

          await prisma.equity.upsert({
            where: {
              unique_trade_date_security: {
                tradeDate: new Date(equity.tradeDate),
                security: equity.security
              }
            },
            update: this.toPrismaData(equity),
            create: {
              tradeDate: new Date(equity.tradeDate),
              security: equity.security,
              ...this.toPrismaData(equity)
            }
          });

          if (existing) {
            results.updated += 1;
          } else {
            results.inserted += 1;
          }
        } catch (err) {
          results.failed += 1;
          results.errors.push({
            equity: equity.security,
            date: equity.tradeDate,
            error: err.message
          });
        }
      }

      return results;
    } catch (err) {
      logError(`Error inserting equities: ${err.message}`);
      throw err;
    }
  }

  toPrismaData(equity) {
    return {
      openingPrice: equity.openingPrice !== null && equity.openingPrice !== undefined ? parseFloat(equity.openingPrice) : 0,
      closingPrice: equity.closingPrice !== null && equity.closingPrice !== undefined ? parseFloat(equity.closingPrice) : 0,
      volume: equity.volume !== null && equity.volume !== undefined ? BigInt(equity.volume) : 0n,
      value: equity.value !== null && equity.value !== undefined ? parseFloat(equity.value) : 0
    };
  }

  async getEquitiesByDateRange(startDate, endDate) {
    try {
      return await prisma.equity.findMany({
        where: {
          tradeDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        orderBy: { tradeDate: 'desc' }
      });
    } catch (err) {
      logError(`Error fetching equities by date range: ${err.message}`);
      throw err;
    }
  }

  async getLatestEquities(limit = 10) {
    try {
      return await prisma.equity.findMany({
        take: limit,
        orderBy: { tradeDate: 'desc' }
      });
    } catch (err) {
      logError(`Error fetching latest equities: ${err.message}`);
      throw err;
    }
  }

  async checkDuplicates(equities) {
    try {
      const duplicates = [];

      for (const equity of equities) {
        const exists = await prisma.equity.findUnique({
          where: {
            unique_trade_date_security: {
              tradeDate: new Date(equity.tradeDate),
              security: equity.security
            }
          }
        });

        if (exists) {
          duplicates.push(equity);
        }
      }

      return duplicates;
    } catch (err) {
      logError(`Error checking duplicates: ${err.message}`);
      throw err;
    }
  }
}

export default new EquityService();
