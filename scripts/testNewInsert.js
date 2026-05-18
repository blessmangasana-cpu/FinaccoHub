import prisma from '../src/database/prismaClient.js';

const testNewInsert = async () => {
  try {
    console.log('🧪 Testing new insert with auto-increment ID...\n');
    
    // Get current state
    const beforeMax = await prisma.$queryRaw`SELECT MAX(id) as max_id FROM rse_equities`;
    const beforeSeq = await prisma.$queryRaw`SELECT last_value FROM rse_equities_id_seq`;
    
    console.log('📊 Before Insert:');
    console.log(`   Max ID: ${beforeMax[0].max_id}`);
    console.log(`   Sequence: ${beforeSeq[0].last_value}`);
    console.log(`   Expected next ID: ${Number(beforeSeq[0].last_value) + 1}`);
    
    // Insert a test record for a future date
    console.log('\n📥 Inserting test record for 2026-05-19...');
    
    const testRecord = await prisma.equity.create({
      data: {
        tradeDate: new Date('2026-05-19'),
        security: 'TEST STOCK',
        openingPrice: 100,
        closingPrice: 105,
        volume: 1000n,
        value: 105000
      }
    });
    
    console.log(`✅ Inserted with ID: ${testRecord.id}`);
    
    // Verify
    const afterMax = await prisma.$queryRaw`SELECT MAX(id) as max_id FROM rse_equities`;
    const afterSeq = await prisma.$queryRaw`SELECT last_value FROM rse_equities_id_seq`;
    
    console.log('\n📊 After Insert:');
    console.log(`   Max ID: ${afterMax[0].max_id}`);
    console.log(`   Sequence: ${afterSeq[0].last_value}`);
    console.log(`   Next ID will be: ${Number(afterSeq[0].last_value) + 1}`);
    
    // Check if ID is continuous
    const expectedId = Number(beforeMax[0].max_id) + 1;
    if (Number(testRecord.id) === expectedId) {
      console.log(`\n✅ SUCCESS: ID is continuous (${testRecord.id} = ${expectedId})`);
    } else {
      console.log(`\n⚠️  WARNING: ID jumped (${testRecord.id} != ${expectedId})`);
    }
    
    // Clean up test record
    console.log('\n🗑️  Cleaning up test record...');
    await prisma.equity.delete({
      where: { id: testRecord.id }
    });
    
    console.log('✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

testNewInsert();
