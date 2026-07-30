import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.partsUsed.deleteMany({});
  await prisma.sparePart.deleteMany({});
  await prisma.preventiveMaintenance.deleteMany({});
  await prisma.aMCContract.deleteMany({});
  await prisma.serviceCall.deleteMany({});
  await prisma.installation.deleteMany({});
  await prisma.machine.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.quotation.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);
  const prashobPassword = await bcrypt.hash('prashob123', 10);
  const krishnendhuPassword = await bcrypt.hash('krishnendhu123', 10);
  const vishnuPassword = await bcrypt.hash('vishnu123', 10);
  const ashwathyPassword = await bcrypt.hash('ashwathy123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'Prashob@gmail.com',
      name: 'Prashob',
      password: prashobPassword,
      role: 'SUPER_ADMIN',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@biotrack.com',
      name: 'John Doe (Admin)',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const salesManager = await prisma.user.create({
    data: {
      email: 'vishnu@gmail.com',
      name: 'Vishnu (Sales Manager)',
      password: vishnuPassword,
      role: 'SALES_MANAGER',
    },
  });

  const ronyPassword = await bcrypt.hash('rony123', 10);

  const salesExecutive = await prisma.user.create({
    data: {
      email: 'rony@gmail.com',
      name: 'Rony',
      password: ronyPassword,
      role: 'SALES_EXECUTIVE',
    },
  });

  const serviceManager = await prisma.user.create({
    data: {
      email: 'krishnendhu@gmail.com',
      name: 'Krishnendhu (Service Manager)',
      password: krishnendhuPassword,
      role: 'SERVICE_MANAGER',
    },
  });

  const ajuPassword = await bcrypt.hash('aju123', 10);

  const serviceEngineer = await prisma.user.create({
    data: {
      email: 'aju@gmail.com',
      name: 'Aju',
      password: ajuPassword,
      role: 'SERVICE_ENGINEER',
    },
  });

  const accounts = await prisma.user.create({
    data: {
      email: 'ashwathy@gmail.com',
      name: 'Ashwathy (Accounts)',
      password: ashwathyPassword,
      role: 'ACCOUNTS',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@biotrack.com',
      name: 'Peter Parker (Viewer)',
      password: hashedPassword,
      role: 'VIEWER',
    },
  });

  console.log('Users seeded.');

  const customer1 = await prisma.customer.create({
    data: {
      name: 'City Heart Multi-Speciality Hospital',
      address: 'Sector 15, Near Central Park',
      district: 'Gurugram',
      state: 'Haryana',
      pin: '122001',
      gst: '06AAAAA1111A1Z1',
      logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=128&auto=format&fit=crop&q=60',
      tags: ['Corporate', 'Key Account'],
      notes: 'Premium healthcare client. Priority service level agreement.',
      contacts: {
        create: [
          { name: 'Dr. Rajan Sharma', designation: 'Medical Director', phone: '9876543210', email: 'director@cityheart.com' },
          { name: 'Sister Mary Joseph', designation: 'Nursing Superintendent', phone: '9876543211', email: 'mary@cityheart.com' },
        ],
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Metro Diagnostics & Research Lab',
      address: '24 Chowringhee Road',
      district: 'Kolkata',
      state: 'West Bengal',
      pin: '700087',
      gst: '19BBBBB2222B1Z2',
      tags: ['Diagnostic Center'],
      notes: 'Fast turn-around service needed. Equipment used heavily.',
      contacts: {
        create: [
          { name: 'Dr. Ananya Roy', designation: 'Chief Pathologist', phone: '9123456789', email: 'ananya@metrolabs.in' },
        ],
      },
    },
  });

  console.log('Customers seeded.');

  const part1 = await prisma.sparePart.create({
    data: { partNumber: 'SP-GE-PROBE-4C', name: 'GE Ultrasound Convex Probe 4C', supplier: 'GE Healthcare India', stock: 5, minStockLevel: 2, unitCost: 45000 },
  });
  const part2 = await prisma.sparePart.create({
    data: { partNumber: 'SP-PH-VENT-TUBE', name: 'Philips Breathing Circuit Tube', supplier: 'Philips Medical', stock: 12, minStockLevel: 5, unitCost: 3500 },
  });
  const part3 = await prisma.sparePart.create({
    data: { partNumber: 'SP-SI-XRAY-TUBE', name: 'Siemens CT X-Ray Tube 7.5M', supplier: 'Siemens Healthineers', stock: 2, minStockLevel: 1, unitCost: 250000 },
  });
  const part4 = await prisma.sparePart.create({
    data: { partNumber: 'SP-MI-BATT-04', name: 'Mindray Backup Battery Pack', supplier: 'Mindray Supplier', stock: 1, minStockLevel: 3, unitCost: 8000 },
  });

  console.log('Spare parts seeded.');

  const machine1 = await prisma.machine.create({
    data: { company: 'Wipro GE', category: 'Ultrasound', name: 'Voluson E10 Expert', model: 'Voluson-E10-2025', serialNumber: 'GE-US-VOL-9874' },
  });

  const machine2 = await prisma.machine.create({
    data: { company: 'Philips', category: 'Ventilator', name: 'Respironics V60 Plus', model: 'V60-Plus-V1', serialNumber: 'PH-VT-RESP-3245' },
  });

  const machine3 = await prisma.machine.create({
    data: { company: 'Siemens', category: 'CT Scanner', name: 'Somatom Definition Edge', model: 'Somatom-Edge-64', serialNumber: 'SI-CT-SOM-1122' },
  });

  const machine4 = await prisma.machine.create({
    data: { company: 'Mindray', category: 'Patient Monitor', name: 'ePM 12 Advanced', model: 'ePM-12-Adv', serialNumber: 'MI-PM-EPM-7788' },
  });

  console.log('Machines seeded.');

  const installDate1 = new Date();
  installDate1.setMonth(installDate1.getMonth() - 6);

  const warrantyEndDate1 = new Date(installDate1);
  warrantyEndDate1.setFullYear(warrantyEndDate1.getFullYear() + 2);

  const install1 = await prisma.installation.create({
    data: {
      customerId: customer1.id,
      machineId: machine1.id,
      warrantyCardNumber: 'WC-GE-8849',
      installationDate: installDate1,
      warrantyYears: 2,
      warrantyEndDate: warrantyEndDate1,
      pmIntervalMonths: 3,
      engineerId: serviceEngineer.id,
      invoiceNumber: 'INV-2026-001',
      customerPo: 'PO-2026-CITY-99',
      qrCode: `EMS-MACH-1`,
    },
  });

  for (let i = 1; i <= 8; i++) {
    const pmDate = new Date(installDate1);
    pmDate.setMonth(pmDate.getMonth() + i * 3);
    await prisma.preventiveMaintenance.create({
      data: {
        installationId: install1.id,
        scheduledDate: pmDate,
        status: pmDate < new Date() ? 'COMPLETED' : 'SCHEDULED',
        engineerId: serviceEngineer.id,
        checklistReport: pmDate < new Date() ? 'All calibration checks passed. Probe checked and cleaned.' : null,
        actualDate: pmDate < new Date() ? pmDate : null,
      },
    });
  }

  const installDate2 = new Date();
  installDate2.setMonth(installDate2.getMonth() - 11);
  installDate2.setDate(installDate2.getDate() - 15);

  const warrantyEndDate2 = new Date(installDate2);
  warrantyEndDate2.setFullYear(warrantyEndDate2.getFullYear() + 1);

  const install2 = await prisma.installation.create({
    data: {
      customerId: customer2.id,
      machineId: machine2.id,
      warrantyCardNumber: 'WC-PH-3344',
      installationDate: installDate2,
      warrantyYears: 1,
      warrantyEndDate: warrantyEndDate2,
      pmIntervalMonths: 4,
      engineerId: serviceEngineer.id,
      invoiceNumber: 'INV-2026-042',
      customerPo: 'PO-METRO-004',
      qrCode: `EMS-MACH-2`,
    },
  });

  for (let i = 1; i <= 3; i++) {
    const pmDate = new Date(installDate2);
    pmDate.setMonth(pmDate.getMonth() + i * 4);
    await prisma.preventiveMaintenance.create({
      data: {
        installationId: install2.id,
        scheduledDate: pmDate,
        status: pmDate < new Date() ? 'COMPLETED' : 'SCHEDULED',
        engineerId: serviceEngineer.id,
        checklistReport: pmDate < new Date() ? 'Filter replaced, battery backup test OK.' : null,
        actualDate: pmDate < new Date() ? pmDate : null,
      },
    });
  }

  console.log('Installations and PM schedules seeded.');

  const call1 = await prisma.serviceCall.create({
    data: {
      callNumber: 'SRV-2026-0001',
      customerId: customer1.id,
      installationId: install1.id,
      reportedProblem: 'Ultrasound touch panel froze during scan, error code US-ERR-09.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedEngineerId: serviceEngineer.id,
    },
  });

  const call2 = await prisma.serviceCall.create({
    data: {
      callNumber: 'SRV-2026-0002',
      customerId: customer2.id,
      installationId: install2.id,
      reportedProblem: 'Ventilator display flashing and unit beeps constantly. Need immediate attention.',
      priority: 'CRITICAL',
      status: 'PENDING',
    },
  });

  const callDate3 = new Date();
  callDate3.setMonth(callDate3.getMonth() - 1);
  const call3 = await prisma.serviceCall.create({
    data: {
      callNumber: 'SRV-2026-0003',
      customerId: customer1.id,
      installationId: install1.id,
      reportedProblem: 'Intermittent power supply failure. System shuts down mid-scan.',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      assignedEngineerId: serviceEngineer.id,
      observation: 'Defective power pack fuse and cable connector corrosion.',
      remarks: 'Replaced power connector and battery block. Tested and found OK.',
      laborCharge: 2500,
      travelCharge: 1200,
      customerSignature: 'Dr. Rajan Sharma',
      createdAt: callDate3,
    },
  });

  await prisma.partsUsed.create({
    data: {
      serviceCallId: call3.id,
      sparePartId: part4.id,
      quantity: 1,
      unitPrice: part4.unitCost,
    },
  });

  console.log('Service Calls seeded.');

  const amcStartDate = new Date();
  amcStartDate.setMonth(amcStartDate.getMonth() - 2);
  const amcEndDate = new Date(amcStartDate);
  amcEndDate.setFullYear(amcEndDate.getFullYear() + 1);

  await prisma.aMCContract.create({
    data: {
      customerId: customer1.id,
      installationId: install1.id,
      contractNumber: 'AMC-2026-0092',
      type: 'PAID',
      value: 65000,
      startDate: amcStartDate,
      endDate: amcEndDate,
      status: 'ACTIVE',
    },
  });

  console.log('AMC contracts seeded.');

  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-100293',
      customerId: customer1.id,
      serviceCallId: call3.id,
      amount: 10500,
      taxAmount: 1890,
      totalAmount: 12390,
      paymentStatus: 'PAID',
      paymentDate: new Date(),
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-100294',
      customerId: customer2.id,
      amount: 18000,
      taxAmount: 3240,
      totalAmount: 21240,
      paymentStatus: 'UNPAID',
    },
  });

  console.log('Invoices seeded.');

  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'USER_LOGIN',
      module: 'AUTH',
      details: 'Super Admin logged in from Gurgaon Office IP.',
      ipAddress: '192.168.1.100',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'INSTALLATION_CREATE',
      module: 'INSTALLATION',
      details: `Installed machine ${machine1.name} (S/N: ${machine1.serialNumber}) at ${customer1.name}.`,
      ipAddress: '192.168.1.102',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: serviceEngineer.id,
      action: 'SERVICE_CALL_COMPLETE',
      module: 'SERVICE',
      details: `Completed service ticket ${call3.callNumber}. Fixed power lines.`,
      ipAddress: '192.168.1.110',
    },
  });

  console.log('Audit logs seeded.');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
