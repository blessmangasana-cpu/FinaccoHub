import prisma from '../src/database/prismaClient.js';

const rows = await prisma.$queryRaw`
  SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE opening_price IS NULL)::int AS opening_nulls,
    COUNT(*) FILTER (WHERE closing_price IS NULL)::int AS closing_nulls,
    COUNT(*) FILTER (WHERE volume IS NULL)::int AS volume_nulls,
    COUNT(*) FILTER (WHERE value IS NULL)::int AS value_nulls
  FROM rse_equities
`;

console.log(JSON.stringify(rows[0], null, 2));

await prisma.$disconnect();
