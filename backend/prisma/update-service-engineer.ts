import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  const ajuPassword = await bcrypt.hash('aju123', 10);

  // Update or insert Service Engineer (Aju)
  const serviceEngineer = await prisma.user.upsert({
    where: { email: 'aju@gmail.com' },
    update: {
      name: 'Aju',
      password: ajuPassword,
      role: 'SERVICE_ENGINEER',
    },
    create: {
      email: 'aju@gmail.com',
      name: 'Aju',
      password: ajuPassword,
      role: 'SERVICE_ENGINEER',
      status: 'ACTIVE',
    },
  });

  // Clean up old default email
  await prisma.user.deleteMany({
    where: {
      email: 'serviceengineer@biotrack.com',
    },
  });

  console.log('Database successfully updated with Service Engineer account:', serviceEngineer.email);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
