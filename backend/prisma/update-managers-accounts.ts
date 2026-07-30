import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  const jithinPassword = await bcrypt.hash('jithin123', 10);
  const vishnuPassword = await bcrypt.hash('vishnu123', 10);
  const ashwathyPassword = await bcrypt.hash('ashwathy123', 10);

  // 1. Service Manager (Jithin)
  const serviceManager = await prisma.user.upsert({
    where: { email: 'jithin@gmail.com' },
    update: {
      name: 'Jithin',
      password: jithinPassword,
      role: 'SERVICE_MANAGER',
    },
    create: {
      email: 'jithin@gmail.com',
      name: 'Jithin',
      password: jithinPassword,
      role: 'SERVICE_MANAGER',
      status: 'ACTIVE',
    },
  });

  // 2. Sales Manager (Vishnu)
  const salesManager = await prisma.user.upsert({
    where: { email: 'vishnu@gmail.com' },
    update: {
      name: 'Vishnu',
      password: vishnuPassword,
      role: 'SALES_MANAGER',
    },
    create: {
      email: 'vishnu@gmail.com',
      name: 'Vishnu',
      password: vishnuPassword,
      role: 'SALES_MANAGER',
      status: 'ACTIVE',
    },
  });

  // 3. Accounts (Ashwathy)
  const accounts = await prisma.user.upsert({
    where: { email: 'ashwathy@gmail.com' },
    update: {
      name: 'Ashwathy',
      password: ashwathyPassword,
      role: 'ACCOUNTS',
    },
    create: {
      email: 'ashwathy@gmail.com',
      name: 'Ashwathy',
      password: ashwathyPassword,
      role: 'ACCOUNTS',
      status: 'ACTIVE',
    },
  });

  // Clean up old default emails if they exist
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['salesmanager@biotrack.com', 'servicemanager@biotrack.com', 'accounts@biotrack.com'],
      },
    },
  });

  console.log('Database successfully updated with new role accounts:');
  console.log('- Service Manager:', serviceManager.email);
  console.log('- Sales Manager:', salesManager.email);
  console.log('- Accounts:', accounts.email);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
