import { cleanData } from '../../src/parser/cleanData.js';
import { validateData } from '../../src/parser/validateData.js';

const sample = [
  {
    trade_date: '2026-01-02',
    security: 'BK',
    opening_price: '35',
    closing_price: '36',
    volume: '1,000',
    value: '36,000'
  }
];

test('cleanData converts string numbers to numeric values', () => {
  const cleaned = cleanData(sample);
  expect(cleaned[0].opening_price).toBe(35);
  expect(cleaned[0].volume).toBe(1000);
});

test('validateData passes valid records', () => {
  const cleaned = cleanData(sample);
  expect(validateData(cleaned)).toEqual(cleaned);
});
