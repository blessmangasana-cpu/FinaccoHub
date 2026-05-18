import prisma from '../src/database/prismaClient.js';

const testAppend = async () => {
  console.log('🧪 Testing append behavior...\n');
  
  // Count before
  const countBefore = await prisma.equity.count();
  console.log(`📊 Records before scraping: ${countBefore}`);
  
  // Get distinct dates before
  const datesBefore = await prisma.equity.groupBy({
    by: ['tradeDate'],
    _count: true
  });
  console.log(`📅 Unique dates before: ${datesBefore.length}`);
  
  // Simulate running scraper for today (2026-05-18)
  console.log('\n🔄 Running scraper for 2026-05-18...');
  const { default: runScraper } = await import('../src/scraper/scrapeRSE.js');
  
  try {
    const result = await runScraper({ tradeDate: '2026-05-18' });
    console.log(`   Result: inserted=${result.inserted}, skipped=${result.skipped}`);
  } catch (err) {
    console.log(`   Result: ${err.message}`);
  }
  
  // Count after
  const countAfter = await prisma.equity.count();
  console.log(`\n📊 Records after scraping: ${countAfter}`);
  
  // Get distinct dates after
  const datesAfter = await prisma.equity.groupBy({
    by: ['tradeDate'],
    _count: true
  });
  console.log(`📅 Unique dates after: ${datesAfter.length}`);
  
  // Verify old data still exists
  const oldestRecord = await prisma.equity.findFirst({
    where: { tradeDate: new Date('2026-01-05') },
    select: { security: true, closingPrice: true }
  });
  
  if (oldestRecord) {
    console.log(`\n✅ Old data preserved: 2026-01-05 record still exists`);
    console.log(`   ${oldestRecord.security}: ${oldestRecord.closingPrice}`);
  } else {
    console.log(`\n❌ Old data lost: 2026-01-05 record missing!`);
  }
  
  // Summary
  console.log(`\n📈 Summary:`);
  console.log(`   Records added: ${countAfter - countBefore}`);
  console.log(`   Behavior: ${countAfter >= countBefore ? '✅ APPEND (correct)' : '❌ REPLACE (wrong)'}`);
  console.log(`   Old data: ${oldestRecord ? '✅ PRESERVED' : '❌ DELETED'}`);
  
  await prisma.$disconnect();
};

testAppend().catch(console.error);
