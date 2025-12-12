const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    console.log('USERS_COUNT', count);
  } catch (e) {
    console.error('PRISMA_ERROR', e.message);
    if (e.meta) console.error('META', JSON.stringify(e.meta));
  } finally {
    await prisma.$disconnect();
  }
})();
