import prisma from '../src/database/prismaClient.js';

const checkIDSequence = async () => {
  try {
    console.log('🔍 Checking ID sequence...\n');
    
    // Get ID range
    const minMax = await prisma.$queryRaw`
      SELECT 
        MIN(id) as min_id,
        MAX(id) as max_id,
        COUNT(*) as total_records
      FROM rse_equities
    `;
    
    console.log('📊 ID Statistics:');
    console.log(`   Min ID: ${minMax[0].min_id}`);
    console.log(`   Max ID: ${minMax[0].max_id}`);
    console.log(`   Total Records: ${minMax[0].total_records}`);
    console.log(`   Expected Max ID: ${minMax[0].total_records}`);
    
    // Check for gaps in ID sequence
    const gaps = await prisma.$queryRaw`
      SELECT 
        id + 1 as gap_start,
        next_id - 1 as gap_end
      FROM (
        SELECT id, LEAD(id) OVER (ORDER BY id) as next_id
        FROM rse_equities
      ) t
      WHERE next_id - id > 1
      LIMIT 10
    `;
    
    if (gaps.length > 0) {
      console.log('\n⚠️  ID Gaps Found:');
      gaps.forEach(gap => {
        console.log(`   Gap from ${gap.gap_start} to ${gap.gap_end}`);
      });
    } else {
      console.log('\n✅ No gaps in ID sequence');
    }
    
    // Check current sequence value
    const seqInfo = await prisma.$queryRaw`
      SELECT 
        last_value,
        is_called
      FROM rse_equities_id_seq
    `;
    
    console.log('\n🔢 Sequence Information:');
    console.log(`   Current sequence value: ${seqInfo[0].last_value}`);
    console.log(`   Is called: ${seqInfo[0].is_called}`);
    console.log(`   Next ID will be: ${Number(seqInfo[0].last_value) + 1}`);
    
    // Check if sequence is ahead of max ID
    const maxId = Number(minMax[0].max_id);
    const seqValue = Number(seqInfo[0].last_value);
    
    console.log('\n🎯 Sequence Status:');
    if (seqValue < maxId) {
      console.log(`   ❌ PROBLEM: Sequence (${seqValue}) is BEHIND max ID (${maxId})`);
      console.log(`   ⚠️  Next insert will try to use ID ${seqValue + 1}, which may already exist!`);
      console.log(`   🔧 Fix needed: Reset sequence to ${maxId}`);
    } else if (seqValue === maxId) {
      console.log(`   ✅ GOOD: Sequence (${seqValue}) matches max ID (${maxId})`);
      console.log(`   ✅ Next insert will use ID ${seqValue + 1}`);
    } else {
      console.log(`   ✅ GOOD: Sequence (${seqValue}) is ahead of max ID (${maxId})`);
      console.log(`   ✅ Next insert will use ID ${seqValue + 1}`);
    }
    
    // Show recent IDs
    console.log('\n📋 Recent Records (last 5):');
    const recent = await prisma.equity.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      select: { id: true, tradeDate: true, security: true }
    });
    
    recent.forEach(r => {
      console.log(`   ID ${r.id}: ${r.tradeDate.toISOString().slice(0, 10)} - ${r.security}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

checkIDSequence();
