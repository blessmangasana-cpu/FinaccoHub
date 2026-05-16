const parseNumber = (input) => {
  if (input === null || input === undefined) return 0;
  const value = String(input).replace(/[\s,]/g, '').replace(/–|—/g, '').replace(/[\(\)]/g, '');
  if (value === '' || value === '-') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const cleanData = (rows) => {
  return rows.map((row) => ({
    trade_date: row.trade_date,
    security: String(row.security || '').trim(),
    opening_price: parseNumber(row.opening_price),
    closing_price: parseNumber(row.closing_price),
    volume: parseNumber(row.volume),
    value: parseNumber(row.value)
  }));
};
