import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  const hashedPassword = await bcrypt.hash('prashob123', 10);

  // Update or insert the new Super Admin
  const user = await prisma.user.upsert({
    where: { email: 'Prashob@gmail.com' },
    update: {
      name: 'Prashob',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
    create: {
      email: 'Prashob@gmail.com',
      name: 'Prashob',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  // Clean up the old default superadmin account
  await prisma.user.deleteMany({
    where: {
      email: 'superadmin@biotrack.com',
    },
  });

  console.log('Super Admin successfully updated in database:', user.email);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
