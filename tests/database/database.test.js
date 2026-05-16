import { jest, test, expect } from '@jest/globals';

const findMany = jest.fn().mockResolvedValue([
  { tradeDate: new Date('2026-01-02'), security: 'BK' }
]);

jest.unstable_mockModule('../../src/database/prismaClient.js', () => ({
  default: {
    equity: { findMany }
  }
}));

const { getExistingRecords } = await import('../../src/database/checkDuplicates.js');

test('getExistingRecords returns a set of existing records', async () => {
  const existing = await getExistingRecords('2026-01-02');
  expect(existing.has('2026-01-02|BK')).toBe(true);
  expect(findMany).toHaveBeenCalledWith({
    where: { tradeDate: new Date('2026-01-02') },
    select: { tradeDate: true, security: true }
  });
});
