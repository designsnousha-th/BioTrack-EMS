import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  const ronyPassword = await bcrypt.hash('rony123', 10);

  // Update or insert Sales Executive (Rony)
  const salesExecutive = await prisma.user.upsert({
    where: { email: 'rony@gmail.com' },
    update: {
      name: 'Rony',
      password: ronyPassword,
      role: 'SALES_EXECUTIVE',
    },
    create: {
      email: 'rony@gmail.com',
      name: 'Rony',
      password: ronyPassword,
      role: 'SALES_EXECUTIVE',
      status: 'ACTIVE',
    },
  });

  // Clean up old default email
  await prisma.user.deleteMany({
    where: {
      email: 'salesexec@biotrack.com',
    },
  });

  console.log('Database successfully updated with Sales Executive account:', salesExecutive.email);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
