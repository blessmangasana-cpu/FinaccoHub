import { extractEquities } from '../../src/scraper/extractEquities.js';

test('extractEquities parses valid equity rows from sample HTML', () => {
  const html = `
    <table>
      <tr><th>Security</th><th>Open</th><th>Close</th><th>Volume</th><th>Value</th></tr>
      <tr><td>BK</td><td>35</td><td>36</td><td>1,000</td><td>36,000</td></tr>
    </table>
  `;
  const records = extractEquities(html, '2026-01-02');
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ security: 'BK', closing_price: '36' });
});
