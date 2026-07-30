import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  const krishnendhuPassword = await bcrypt.hash('krishnendhu123', 10);

  // Update or insert Service Manager (Krishnendhu)
  const serviceManager = await prisma.user.upsert({
    where: { email: 'krishnendhu@gmail.com' },
    update: {
      name: 'Krishnendhu',
      password: krishnendhuPassword,
      role: 'SERVICE_MANAGER',
    },
    create: {
      email: 'krishnendhu@gmail.com',
      name: 'Krishnendhu',
      password: krishnendhuPassword,
      role: 'SERVICE_MANAGER',
      status: 'ACTIVE',
    },
  });

  // Clean up Jithin's user if it exists
  await prisma.user.deleteMany({
    where: {
      email: 'jithin@gmail.com',
    },
  });

  console.log('Database successfully updated. Service Manager is now:', serviceManager.email);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
