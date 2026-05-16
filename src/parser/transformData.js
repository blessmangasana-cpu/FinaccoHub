export const transformData = (records) => {
  return records.map((record) => ({
    trade_date: record.trade_date,
    security: record.security,
    opening_price: record.opening_price ?? 0,
    closing_price: record.closing_price,
    volume: record.volume ?? 0,
    value: record.value ?? 0
  }));
};
