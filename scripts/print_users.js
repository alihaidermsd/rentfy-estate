const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, password: true, isActive: true },
      orderBy: { createdAt: 'asc' }
    });
    console.log('TOTAL_USERS', users.length);
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Failed to read users from DB:', err.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
