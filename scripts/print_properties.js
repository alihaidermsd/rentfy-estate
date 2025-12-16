const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const properties = await prisma.property.findMany({
      where: { isActive: true },
      include: {
        user: { select: { id: true, email: true, name: true } },
        agent: { select: { id: true } },
        developer: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    console.log('TOTAL_PROPERTIES', properties.length);
    console.log(JSON.stringify(properties, null, 2));
  } catch (err) {
    console.error('Failed to read properties from DB:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
