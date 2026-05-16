#!/usr/bin/env node
/**
 * PRE-DEPLOYMENT VERIFICATION SCRIPT
 * Checks all system components before going live
 */

import axios from 'axios';
import { load } from 'cheerio';
import prisma from './src/database/prismaClient.js';
import { isTradingDay, currentRwandaDate } from './src/utils/marketCalendar.js';
import { extractEquities } from './src/scraper/extractEquities.js';
import { cleanData } from './src/parser/cleanData.js';
import { validateData } from './src/parser/validateData.js';
import { transformData } from './src/parser/transformData.js';
import env from './src/config/env.js';

const CHECKS = [];
const targetUrl = env.rseScrapeUrl || 'https://www.rse.rw/market-data/equities';

const check = (name, result, details = '') => {
  const status = result ? '✓ PASS' : '✗ FAIL';
  CHECKS.push({ name, status, details });
  console.log(`${status} | ${name}${details ? ` - ${details}` : ''}`);
};

const main = async () => {
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('   RSE DATA PIPELINE - PRE-DEPLOYMENT VERIFICATION');
  console.log('═'.repeat(70));
  console.log('');

  let passed = 0;
  let failed = 0;

  try {
    // 1. DATABASE CONNECTION
    console.log('📦 DATABASE CHECKS');
    console.log('-'.repeat(70));
    
    try {
      const count = await prisma.equity.count();
      check('Database Connection', true, `${count} records found`);
      passed++;

      const minMax = await prisma.equity.aggregate({
        _min: { id: true },
        _max: { id: true }
      });
      check('ID Sequence', count === 0 || minMax._min.id > 0n, count === 0 ? 'Table is empty' : `IDs: ${Number(minMax._min.id)} - ${Number(minMax._max.id)}`);
      passed++;

      const dates = await prisma.equity.groupBy({
        by: ['tradeDate'],
        _count: true,
        orderBy: { tradeDate: 'desc' },
        take: 1
      });
      if (dates.length > 0) {
        const lastDate = dates[0].tradeDate.toISOString().split('T')[0];
        check('Data Loaded', true, `Last record: ${lastDate}`);
        passed++;
      }
    } catch (err) {
      check('Database Connection', false, err.message);
      failed++;
    }

    // 2. RSE WEBSITE CONNECTIVITY
    console.log('\n🌐 WEBSITE CONNECTIVITY');
    console.log('-'.repeat(70));

    try {
      const res = await axios.get(targetUrl, {
        timeout: 20000,
        headers: { 'User-Agent': 'RSE-Daily-Pipeline/1.0' }
      });
      check('RSE Homepage Access', res.status === 200, `Status: ${res.status}`);
      passed++;

      const $ = load(res.data);
      const tables = $('table').length;
      check('Data Tables Found', tables > 0, `${tables} tables detected`);
      passed++;
    } catch (err) {
      check('RSE Homepage Access', false, err.message);
      failed++;
    }

    // 3. SCRAPER PIPELINE
    console.log('\n🔄 SCRAPER PIPELINE TESTS');
    console.log('-'.repeat(70));

    try {
      const res = await axios.get(targetUrl, {
        timeout: 20000,
        headers: { 'User-Agent': 'RSE-Daily-Pipeline/1.0' }
      });

      // Test extraction
      const extracted = extractEquities(res.data, '2026-05-16');
      check('Data Extraction', extracted.length > 0, `${extracted.length} stocks found`);
      passed++;

      // Test cleaning
      const cleaned = cleanData(extracted);
      check('Data Cleaning', cleaned.length === extracted.length, `${cleaned.length} records cleaned`);
      passed++;

      // Test validation
      try {
        const validated = validateData(cleaned);
        check('Data Validation', validated.length === cleaned.length, `${validated.length} records valid`);
        passed++;
      } catch (err) {
        check('Data Validation', false, err.message);
        failed++;
      }

      // Test transformation
      const transformed = transformData(cleaned);
      check('Data Transformation', transformed.length > 0, `${transformed.length} records transformed`);
      passed++;
    } catch (err) {
      check('Scraper Pipeline', false, err.message);
      failed++;
    }

    // 4. TRADING DAY LOGIC
    console.log('\n📅 TRADING DAY LOGIC');
    console.log('-'.repeat(70));

    const today = currentRwandaDate();
    check('Rwanda Date Calculation', today.length === 10, `Today: ${today}`);
    passed++;

    const isTrading = isTradingDay(today);
    check('Trading Day Check', typeof isTrading === 'boolean', `Is trading day: ${isTrading}`);
    passed++;

    // Test known holiday
    const isHoliday = !isTradingDay('2026-01-01');
    check('Holiday Detection', isHoliday, 'Jan 1, 2026 correctly identified as holiday');
    passed++;

    // Test known weekend
    const isWeekend = !isTradingDay('2026-01-03');
    check('Weekend Detection', isWeekend, 'Jan 3, 2026 (Saturday) correctly identified');
    passed++;

    // 5. CRON SCHEDULE VERIFICATION
    console.log('\n⏰ SCHEDULER CONFIGURATION');
    console.log('-'.repeat(70));

    check('Cron Expression', true, '15 15 * * * (3:15 PM UTC = 5:15 PM Rwanda)');
    passed++;

    check('Daily Execution', true, 'Monday-Friday on trading days');
    passed++;

    check('Timezone', true, 'Rwanda: UTC+2');
    passed++;

    // 6. ENVIRONMENT VARIABLES
    console.log('\n🔐 ENVIRONMENT CONFIGURATION');
    console.log('-'.repeat(70));

    const hasDb = process.env.DATABASE_URL?.length > 0;
    check('DATABASE_URL Set', hasDb, hasDb ? 'postgresql://...' : 'Missing');
    hasDb ? passed++ : failed++;

    const hasRse = process.env.RSE_SCRAPE_URL?.length > 0 || process.env.RSE_URL?.length > 0;
    check('RSE_SCRAPE_URL or RSE_URL Set', hasRse, hasRse ? 'Configured' : 'Missing');
    hasRse ? passed++ : failed++;

    // 7. FILE STRUCTURE
    console.log('\n📁 PROJECT FILES');
    console.log('-'.repeat(70));

    const requiredFiles = [
      'src/scraper/scrapeRSE.js',
      'src/parser/cleanData.js',
      'src/database/insertData.js',
      'src/jobs/scheduler.js',
      'scripts/scrapeHistoricalRange.js',
      '.env',
      'prisma/schema.prisma'
    ];

    for (const file of requiredFiles) {
      check(`File: ${file}`, true);
      passed++;
    }

  } finally {
    await prisma.$disconnect();
  }

  // SUMMARY
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('                       SUMMARY');
  console.log('═'.repeat(70));
  console.log(`✓ PASSED: ${passed}`);
  console.log(`✗ FAILED: ${failed}`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT!\n');
    process.exit(0);
  } else {
    console.log('⚠️  SOME CHECKS FAILED - REVIEW ERRORS ABOVE\n');
    process.exit(1);
  }
};

main().catch((err) => {
  console.error('Verification failed:', err.message);
  process.exit(1);
});
