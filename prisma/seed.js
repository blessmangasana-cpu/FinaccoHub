import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed data if needed
  // Example:
  // const equity = await prisma.equity.create({
  //   data: {
  //     tradeDate: new Date('2024-01-01'),
  //     security: 'EXAMPLE',
  //     openingPrice: 100.00,
  //     closingPrice: 101.50,
  //     volume: 1000000,
  //     value: 101500000,
  //   },
  // });
  // console.log('Seeded:', equity);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
