import prisma from '../database/prismaClient.js';
import { isTradingDay, getNextTradingDay } from '../utils/marketCalendar.js';
import { error as logError } from '../utils/logger.js';

class MarketService {
  async isTradingDay(date) {
    return isTradingDay(date);
  }

  getNextTradingDay(date) {
    return getNextTradingDay(date);
  }

  async getMarketStats(date) {
    try {
      const equities = await prisma.equity.findMany({
        where: {
          tradeDate: {
            equals: new Date(date)
          }
        }
      });

      if (equities.length === 0) {
        return {
          date,
          count: 0,
          totalVolume: '0',
          totalValue: '0.00',
          avgClosingPrice: '0.00'
        };
      }

      const totalVolume = equities.reduce((sum, e) => sum + (e.volume || 0n), 0n);
      const totalValue = equities.reduce((sum, e) => sum + parseFloat(e.value || 0), 0);
      const avgClosingPrice = equities.reduce((sum, e) => sum + parseFloat(e.closingPrice || 0), 0) / equities.length;

      return {
        date,
        count: equities.length,
        totalVolume: totalVolume.toString(),
        totalValue: totalValue.toFixed(2),
        avgClosingPrice: avgClosingPrice.toFixed(2)
      };
    } catch (err) {
      logError(`Error getting market stats: ${err.message}`);
      throw err;
    }
  }

  async getSecurityPriceChange(security, startDate, endDate) {
    try {
      const records = await prisma.equity.findMany({
        where: {
          security,
          tradeDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        orderBy: { tradeDate: 'asc' }
      });

      if (records.length < 2) {
        return { security, change: '0.00', percentChange: '0.00%' };
      }

      const first = parseFloat(records[0].openingPrice || records[0].closingPrice || 0);
      const last = parseFloat(records[records.length - 1].closingPrice || 0);
      const change = last - first;
      const percentChange = first === 0 ? '0.00' : ((change / first) * 100).toFixed(2);

      return {
        security,
        startDate: records[0].tradeDate,
        endDate: records[records.length - 1].tradeDate,
        openingPrice: first.toFixed(2),
        closingPrice: last.toFixed(2),
        change: change.toFixed(2),
        percentChange: `${percentChange}%`
      };
    } catch (err) {
      logError(`Error getting security price change: ${err.message}`);
      throw err;
    }
  }
}

export default new MarketService();
