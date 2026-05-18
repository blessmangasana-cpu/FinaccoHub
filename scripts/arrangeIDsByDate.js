import prisma from '../src/database/prismaClient.js';

const arrangeByDate = async () => {
  try {
    console.log('🔧 Arranging IDs chronologically by trade date...\n');
    
    // Step 1: Check current state
    const beforeCount = await prisma.equity.count();
    console.log(`📊 Total records: ${beforeCount}`);
    
    // Step 2: Create temp table with IDs ordered by date
    console.log('\n🔄 Renumbering IDs by trade date (oldest first)...');
    
    await prisma.$executeRaw`
      -- Create temp table with new IDs ordered by trade_date, then security
      CREATE TEMP TABLE temp_equities AS
      SELECT 
        ROW_NUMBER() OVER (ORDER BY trade_date ASC, security ASC) as new_id,
        trade_date,
        security,
        opening_price,
        closing_price,
        volume,
        value,
        inserted_at
      FROM rse_equities
      ORDER BY trade_date ASC, security ASC
    `;
    
    // Step 3: Clear original table
    console.log('🗑️  Clearing original table...');
    await prisma.$executeRaw`TRUNCATE TABLE rse_equities RESTART IDENTITY CASCADE`;
    
    // Step 4: Insert with new chronological IDs
    console.log('📥 Inserting records with chronological IDs...');
    await prisma.$executeRaw`
      INSERT INTO rse_equities (id, trade_date, security, opening_price, closing_price, volume, value, inserted_at)
      SELECT new_id, trade_date, security, opening_price, closing_price, volume, value, inserted_at
      FROM temp_equities
      ORDER BY new_id
    `;
    
    // Step 5: Reset sequence
    console.log('🔢 Resetting sequence...');
    await prisma.$executeRaw`
      SELECT setval('rse_equities_id_seq', (SELECT MAX(id) FROM rse_equities))
    `;
    
    // Step 6: Verify
    console.log('\n✅ Verification:');
    
    // Check first 10
    const first10 = await prisma.equity.findMany({
      where: { id: { lte: 10n } },
      orderBy: { id: 'asc' },
      select: { id: true, tradeDate: true, security: true }
    });
    
    console.log('\n📋 IDs 1-10 (oldest data):');
    first10.forEach(r => {
      console.log(`   ID ${r.id}: ${r.tradeDate.toISOString().slice(0, 10)} - ${r.security}`);
    });
    
    // Check last 10
    const last10 = await prisma.equity.findMany({
      orderBy: { id: 'desc' },
      take: 10,
      select: { id: true, tradeDate: true, security: true }
    });
    
    console.log(`\n📋 IDs ${Number(last10[9].id)}-${Number(last10[0].id)} (newest data):`);
    last10.reverse().forEach(r => {
      console.log(`   ID ${r.id}: ${r.tradeDate.toISOString().slice(0, 10)} - ${r.security}`);
    });
    
    const afterSeq = await prisma.$queryRaw`SELECT last_value FROM rse_equities_id_seq`;
    
    console.log('\n🎉 Success!');
    console.log(`   IDs arranged chronologically: 1 (oldest) to ${afterSeq[0].last_value} (newest)`);
    console.log(`   Next insert will use ID ${Number(afterSeq[0].last_value) + 1}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

console.log('⚠️  This will renumber IDs to be chronological by trade date.');
console.log('📝 Oldest dates will have lowest IDs, newest dates will have highest IDs.\n');

const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  arrangeByDate();
} else {
  console.log('❌ Aborted. Run with --confirm flag to proceed:');
  console.log('   node scripts/arrangeIDsByDate.js --confirm');
  process.exit(0);
}
