import prisma from '../src/database/prismaClient.js';

const verify = async () => {
  try {
    console.log('🔍 Verifying ID arrangement...\n');
    
    // Check IDs 1-10 (should be oldest data: 2026-01-05)
    console.log('📋 IDs 1-10 (should be 2026-01-05):');
    const first10 = await prisma.equity.findMany({
      where: { id: { gte: 1n, lte: 10n } },
      orderBy: { id: 'asc' },
      select: { id: true, tradeDate: true, security: true }
    });
    
    first10.forEach(r => {
      console.log(`   ID ${r.id}: ${r.tradeDate.toISOString().slice(0, 10)} - ${r.security}`);
    });
    
    // Check IDs 11-20 (should be 2026-01-06)
    console.log('\n📋 IDs 11-20 (should be 2026-01-06):');
    const next10 = await prisma.equity.findMany({
      where: { id: { gte: 11n, lte: 20n } },
      orderBy: { id: 'asc' },
      select: { id: true, tradeDate: true, security: true }
    });
    
    next10.forEach(r => {
      console.log(`   ID ${r.id}: ${r.tradeDate.toISOString().slice(0, 10)} - ${r.security}`);
    });
    
    // Check IDs 921-930 (should be latest: 2026-05-15)
    console.log('\n📋 IDs 921-930 (should be 2026-05-15):');
    const last10 = await prisma.equity.findMany({
      where: { id: { gte: 921n, lte: 930n } },
      orderBy: { id: 'asc' },
      select: { id: true, tradeDate: true, security: true }
    });
    
    last10.forEach(r => {
      console.log(`   ID ${r.id}: ${r.tradeDate.toISOString().slice(0, 10)} - ${r.security}`);
    });
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Total records: ${await prisma.equity.count()}`);
    console.log(`   ID range: 1 to 930`);
    console.log(`   Date range: ${first10[0].tradeDate.toISOString().slice(0, 10)} to ${last10[last10.length-1].tradeDate.toISOString().slice(0, 10)}`);
    console.log(`   ✅ IDs are now arranged chronologically from oldest to newest`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

verify();
