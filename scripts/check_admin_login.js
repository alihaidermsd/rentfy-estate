const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function run() {
  try {
    const email = 'admin@rentfy.com';
    const plain = 'password123';
    console.log(`Checking user ${email}...`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found.');
      process.exitCode = 2;
      return;
    }
    console.log('User found:', { id: user.id, email: user.email, role: user.role });
    if (!user.password) {
      console.log('User has no password set.');
      process.exitCode = 3;
      return;
    }
    const ok = await bcrypt.compare(plain, user.password);
    console.log('Password match:', ok);
    if (!ok) process.exitCode = 4;
  } catch (err) {
    console.error('Error checking admin login:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
