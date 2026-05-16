export const validateData = (records) => {
  const requiredFields = ['trade_date', 'security', 'closing_price'];

  const invalid = records.filter((record) =>
    requiredFields.some((field) => record[field] === null || record[field] === undefined || record[field] === '')
  );

  if (invalid.length > 0) {
    throw new Error(`Validation failed for ${invalid.length} record(s). Missing required fields: trade_date, security, closing_price.`);
  }

  return records;
};
