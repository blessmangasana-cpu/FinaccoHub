import prisma from '../src/database/prismaClient.js';

const resetSequence = async () => {
  try {
    console.log('🔧 Resetting ID sequence to match current max ID...\n');
    
    // Get current max ID
    const result = await prisma.$queryRaw`
      SELECT MAX(id) as max_id FROM rse_equities
    `;
    
    const maxId = Number(result[0].max_id);
    console.log(`📊 Current max ID: ${maxId}`);
    
    // Get current sequence value
    const seqBefore = await prisma.$queryRaw`
      SELECT last_value FROM rse_equities_id_seq
    `;
    
    console.log(`🔢 Sequence before: ${seqBefore[0].last_value}`);
    
    // Reset sequence to max ID
    await prisma.$executeRaw`
      SELECT setval('rse_equities_id_seq', ${maxId}, true)
    `;
    
    // Verify
    const seqAfter = await prisma.$queryRaw`
      SELECT last_value FROM rse_equities_id_seq
    `;
    
    console.log(`🔢 Sequence after: ${seqAfter[0].last_value}`);
    console.log(`\n✅ Sequence reset complete!`);
    console.log(`✅ Next insert will use ID ${Number(seqAfter[0].last_value) + 1}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

resetSequence();
