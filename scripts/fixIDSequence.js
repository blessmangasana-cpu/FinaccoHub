import prisma from '../src/database/prismaClient.js';

const fixIDSequence = async () => {
  try {
    console.log('🔧 Fixing ID sequence and gaps...\n');
    
    // Step 1: Check current state
    const beforeCount = await prisma.equity.count();
    const beforeMax = await prisma.$queryRaw`SELECT MAX(id) as max_id FROM rse_equities`;
    
    console.log('📊 Before Fix:');
    console.log(`   Total records: ${beforeCount}`);
    console.log(`   Max ID: ${beforeMax[0].max_id}`);
    console.log(`   ID gaps: ${Number(beforeMax[0].max_id) - beforeCount}`);
    
    // Step 2: Create temporary table with continuous IDs
    console.log('\n🔄 Renumbering IDs to be continuous...');
    
    await prisma.$executeRaw`
      -- Create temp table with new continuous IDs
      CREATE TEMP TABLE temp_equities AS
      SELECT 
        ROW_NUMBER() OVER (ORDER BY id) as new_id,
        trade_date,
        security,
        opening_price,
        closing_price,
        volume,
        value,
        inserted_at
      FROM rse_equities
      ORDER BY id
    `;
    
    // Step 3: Clear original table
    console.log('🗑️  Clearing original table...');
    await prisma.$executeRaw`TRUNCATE TABLE rse_equities RESTART IDENTITY CASCADE`;
    
    // Step 4: Insert with new continuous IDs
    console.log('📥 Inserting records with continuous IDs...');
    await prisma.$executeRaw`
      INSERT INTO rse_equities (id, trade_date, security, opening_price, closing_price, volume, value, inserted_at)
      SELECT new_id, trade_date, security, opening_price, closing_price, volume, value, inserted_at
      FROM temp_equities
      ORDER BY new_id
    `;
    
    // Step 5: Reset sequence to match max ID
    console.log('🔢 Resetting sequence...');
    await prisma.$executeRaw`
      SELECT setval('rse_equities_id_seq', (SELECT MAX(id) FROM rse_equities))
    `;
    
    // Step 6: Verify fix
    const afterCount = await prisma.equity.count();
    const afterMax = await prisma.$queryRaw`SELECT MAX(id) as max_id FROM rse_equities`;
    const afterSeq = await prisma.$queryRaw`SELECT last_value FROM rse_equities_id_seq`;
    
    console.log('\n✅ After Fix:');
    console.log(`   Total records: ${afterCount}`);
    console.log(`   Max ID: ${afterMax[0].max_id}`);
    console.log(`   Sequence value: ${afterSeq[0].last_value}`);
    console.log(`   ID gaps: ${Number(afterMax[0].max_id) - afterCount}`);
    
    // Step 7: Verify no gaps
    const gaps = await prisma.$queryRaw`
      SELECT COUNT(*) as gap_count
      FROM (
        SELECT id, LEAD(id) OVER (ORDER BY id) as next_id
        FROM rse_equities
      ) t
      WHERE next_id - id > 1
    `;
    
    if (Number(gaps[0].gap_count) === 0) {
      console.log('\n🎉 Success! IDs are now continuous from 1 to ' + afterMax[0].max_id);
      console.log('✅ Next insert will use ID ' + (Number(afterSeq[0].last_value) + 1));
    } else {
      console.log('\n⚠️  Warning: Some gaps still exist');
    }
    
    // Show sample
    console.log('\n📋 Sample Records:');
    const sample = await prisma.equity.findMany({
      take: 5,
      orderBy: { id: 'asc' },
      select: { id: true, tradeDate: true, security: true }
    });
    
    sample.forEach(r => {
      console.log(`   ID ${r.id}: ${r.tradeDate.toISOString().slice(0, 10)} - ${r.security}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

// Confirm before running
console.log('⚠️  WARNING: This will renumber all IDs in the database!');
console.log('📝 This is safe but will change ID values.');
console.log('💾 Make sure you have a backup if needed.\n');

const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  fixIDSequence();
} else {
  console.log('❌ Aborted. Run with --confirm flag to proceed:');
  console.log('   node scripts/fixIDSequence.js --confirm');
  process.exit(0);
}
