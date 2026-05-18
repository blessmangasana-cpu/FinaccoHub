import prisma from '../src/database/prismaClient.js';

const diagnose = async () => {
  try {
    console.log('🔍 Diagnosing ID problem...\n');
    
    // Check for duplicate IDs
    const duplicates = await prisma.$queryRaw`
      SELECT id, COUNT(*) as count
      FROM rse_equities
      GROUP BY id
      HAVING COUNT(*) > 1
      ORDER BY id
      LIMIT 20
    `;
    
    if (duplicates.length > 0) {
      console.log('❌ DUPLICATE IDs FOUND:');
      duplicates.forEach(d => {
        console.log(`   ID ${d.id}: appears ${d.count} times`);
      });
    } else {
      console.log('✅ No duplicate IDs found');
    }
    
    // Show all records with ID 1-10
    console.log('\n📋 Records with ID 1-10:');
    const lowIds = await prisma.equity.findMany({
      where: {
        id: { lte: 10n }
      },
      orderBy: { id: 'asc' },
      select: { id: true, tradeDate: true, security: true }
    });
    
    lowIds.forEach(r => {
      console.log(`   ID ${r.id}: ${r.tradeDate.toISOString().slice(0, 10)} - ${r.security}`);
    });
    
    // Show records with high IDs
    console.log('\n📋 Records with ID 970-979:');
    const highIds = await prisma.equity.findMany({
      where: {
        id: { gte: 970n, lte: 979n }
      },
      orderBy: { id: 'asc' },
      select: { id: true, tradeDate: true, security: true }
    });
    
    highIds.forEach(r => {
      console.log(`   ID ${r.id}: ${r.tradeDate.toISOString().slice(0, 10)} - ${r.security}`);
    });
    
    // Check total count
    const total = await prisma.equity.count();
    console.log(`\n📊 Total records: ${total}`);
    
    // Check if primary key constraint exists
    const pkInfo = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'rse_equities'
      AND constraint_type = 'PRIMARY KEY'
    `;
    
    console.log('\n🔑 Primary Key Status:');
    if (pkInfo.length > 0) {
      console.log(`   ✅ Primary key exists: ${pkInfo[0].constraint_name}`);
    } else {
      console.log('   ❌ No primary key found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

diagnose();
