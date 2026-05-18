import prisma from '../src/database/prismaClient.js';

const checkData = async () => {
  try {
    // Total records
    const totalCount = await prisma.equity.count();
    console.log('📊 Total records in database:', totalCount);
    
    // Records by date
    const byDate = await prisma.equity.groupBy({
      by: ['tradeDate'],
      _count: true,
      orderBy: { tradeDate: 'desc' }
    });
    
    console.log('\n📅 Records by date:');
    byDate.forEach(d => {
      const date = d.tradeDate.toISOString().slice(0, 10);
      console.log(`  ${date}: ${d._count} records`);
    });
    
    // Date range
    const oldest = await prisma.equity.findFirst({
      orderBy: { tradeDate: 'asc' },
      select: { tradeDate: true }
    });
    
    const newest = await prisma.equity.findFirst({
      orderBy: { tradeDate: 'desc' },
      select: { tradeDate: true }
    });
    
    if (oldest && newest) {
      console.log('\n📆 Date range:');
      console.log(`  Oldest: ${oldest.tradeDate.toISOString().slice(0, 10)}`);
      console.log(`  Newest: ${newest.tradeDate.toISOString().slice(0, 10)}`);
    }
    
    // Sample data from different dates
    console.log('\n📋 Sample records (3 most recent dates):');
    const recentDates = byDate.slice(0, 3).map(d => d.tradeDate);
    
    for (const date of recentDates) {
      const records = await prisma.equity.findMany({
        where: { tradeDate: date },
        select: { tradeDate: true, security: true, closingPrice: true },
        take: 3
      });
      
      console.log(`\n  ${date.toISOString().slice(0, 10)}:`);
      records.forEach(r => {
        console.log(`    - ${r.security}: ${r.closingPrice}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

checkData();
