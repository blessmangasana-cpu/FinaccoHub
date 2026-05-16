import { load } from 'cheerio';

const normalizeHeader = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

const findEquityTable = ($) => {
  const tables = $('table');
  let equityTable = null;

  tables.each((_, table) => {
    const $table = $(table);
    const headers = $table.find('thead tr th, tr').first().find('th, td')
      .map((_, el) => $(el).text().trim())
      .get();

    const normalized = headers.map(normalizeHeader);
    const hasSecurities = normalized.some(h => h.includes('securities') || h.includes('security'));
    const hasClosing = normalized.some(h => h.includes('closing') || h === 'close' || h.includes('closeprice'));
    const hasVolume = normalized.some(h => h.includes('volume'));

    if (hasSecurities && hasClosing && hasVolume) {
      equityTable = table;
    }
  });

  return equityTable;
};

const buildHeaderMap = (headers) => {
  const normalized = headers.map(h => normalizeHeader(h));
  const mapping = {};

  normalized.forEach((header, index) => {
    if (header.includes('securities') || header.includes('security')) mapping.security = index;
    if (header.includes('closing') || header === 'close' || header.includes('closeprice')) mapping.closing_price = index;
    if (header.includes('previous') || header === 'open' || header.includes('opening')) mapping.opening_price = index;
    if (header.includes('volume')) mapping.volume = index;
    if (header.includes('value')) mapping.value = index;
  });

  return mapping;
};

export const extractEquities = (html, tradeDate) => {
  const $ = load(html);
  const equityTable = findEquityTable($);

  if (!equityTable) {
    throw new Error('Unable to find equity table on the RSE page.');
  }

  const $table = $(equityTable);
  const foundRows = [];

  // Get headers from the table
  const headerRow = $table.find('thead tr, tr').first();
  const headers = headerRow.find('th, td').map((_, el) => $(el).text().trim()).get();
  const columnMap = buildHeaderMap(headers);

  if (columnMap.security === undefined || columnMap.closing_price === undefined) {
    throw new Error('Missing required columns: Security or Closing Price.');
  }

  // Extract data rows
  const dataRows = $table.find('tbody tr, tr').slice(1);

  dataRows.each((_, row) => {
    const $row = $(row);
    const cells = $row.find('td').map((_, cell) => $(cell).text().trim()).get();

    if (cells.length === 0) return;

    const security = cells[columnMap.security] || '';
    const closingPrice = cells[columnMap.closing_price] || '';

    if (!security || !closingPrice) return;

    const record = {
      trade_date: tradeDate,
      security: security.trim(),
      opening_price: columnMap.opening_price !== undefined ? cells[columnMap.opening_price] : null,
      closing_price: closingPrice.trim(),
      volume: columnMap.volume !== undefined ? cells[columnMap.volume] : null,
      value: columnMap.value !== undefined ? cells[columnMap.value] : null
    };

    foundRows.push(record);
  });

  if (foundRows.length === 0) {
    throw new Error('Unable to extract equity rows from the RSE page.');
  }

  return foundRows;
};
