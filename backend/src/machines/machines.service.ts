import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { CreateInstallationDto, CreateAmcDto } from './dto/create-installation.dto';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  // Master Machines
  async createMachine(dto: CreateMachineDto) {
    return this.prisma.machine.create({
      data: dto,
    });
  }

  async findAllMachines(search?: string) {
    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
            { serialNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    return this.prisma.machine.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Installations
  async createInstallation(dto: CreateInstallationDto) {
    const installDate = new Date(dto.installationDate);
    const warrantyYears = dto.warrantyYears || 1;
    const pmIntervalMonths = dto.pmIntervalMonths || 3;

    // Calculate warranty end date
    const warrantyEndDate = new Date(installDate);
    warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + warrantyYears);

    return this.prisma.$transaction(async (tx) => {
      // Create installation record
      const installation = await tx.installation.create({
        data: {
          customerId: dto.customerId,
          machineId: dto.machineId,
          warrantyCardNumber: dto.warrantyCardNumber,
          installationDate: installDate,
          warrantyYears,
          warrantyEndDate,
          pmIntervalMonths,
          engineerId: dto.engineerId,
          invoiceNumber: dto.invoiceNumber,
          customerPo: dto.customerPo,
        },
      });

      // Update installation with QR Code string
      const qrCodeString = `EMS-MACH-${installation.id}`;
      const updatedInstallation = await tx.installation.update({
        where: { id: installation.id },
        data: { qrCode: qrCodeString },
        include: {
          machine: true,
          customer: true,
        },
      });

      // Auto-generate Preventive Maintenance schedules
      const pmSchedules = [];
      const totalPMs = Math.floor((warrantyYears * 12) / pmIntervalMonths);

      for (let i = 1; i <= totalPMs; i++) {
        const scheduledDate = new Date(installDate);
        scheduledDate.setMonth(scheduledDate.getMonth() + i * pmIntervalMonths);

        pmSchedules.push({
          installationId: installation.id,
          scheduledDate,
          status: 'SCHEDULED' as const,
        });
      }

      if (pmSchedules.length > 0) {
        await tx.preventiveMaintenance.createMany({
          data: pmSchedules,
        });
      }

      return updatedInstallation;
    });
  }

  async findAllInstallations(query: {
    customerId?: string;
    warrantyStatus?: 'active' | 'expired' | 'expiring';
    search?: string;
  }) {
    const where: any = {};

    if (query.customerId) {
      where.customerId = parseInt(query.customerId, 10);
    }

    const today = new Date();

    if (query.warrantyStatus === 'active') {
      where.warrantyEndDate = { gte: today };
    } else if (query.warrantyStatus === 'expired') {
      where.warrantyEndDate = { lt: today };
    } else if (query.warrantyStatus === 'expiring') {
      const expiringThreshold = new Date();
      expiringThreshold.setDate(expiringThreshold.getDate() + 30);
      where.warrantyEndDate = {
        gte: today,
        lte: expiringThreshold,
      };
    }

    if (query.search) {
      where.OR = [
        { machine: { name: { contains: query.search, mode: 'insensitive' } } },
        { machine: { serialNumber: { contains: query.search, mode: 'insensitive' } } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.installation.findMany({
      where,
      include: {
        machine: true,
        customer: true,
        engineer: {
          select: { id: true, name: true, role: true },
        },
        amcContracts: {
          orderBy: { endDate: 'desc' },
          take: 1,
        },
        pms: {
          orderBy: { scheduledDate: 'asc' },
        },
      },
      orderBy: { installationDate: 'desc' },
    });
  }

  async findInstallation(id: number) {
    const installation = await this.prisma.installation.findUnique({
      where: { id },
      include: {
        machine: true,
        customer: {
          include: { contacts: true },
        },
        engineer: {
          select: { id: true, name: true, role: true },
        },
        amcContracts: {
          orderBy: { endDate: 'desc' },
        },
        pms: {
          orderBy: { scheduledDate: 'asc' },
          include: {
            engineer: {
              select: { id: true, name: true },
            },
          },
        },
        serviceCalls: {
          orderBy: { createdAt: 'desc' },
          include: {
            assignedEngineer: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!installation) {
      throw new NotFoundException(`Installation with ID ${id} not found`);
    }

    return installation;
  }

  async updateInstallation(id: number, dto: any) {
    const existing = await this.prisma.installation.findUnique({
      where: { id },
      include: { pms: true },
    });
    
    if (!existing) {
      throw new NotFoundException(`Installation with ID ${id} not found`);
    }

    const warrantyYears = dto.warrantyYears ? parseInt(dto.warrantyYears, 10) : existing.warrantyYears;
    const pmIntervalMonths = dto.pmIntervalMonths ? parseInt(dto.pmIntervalMonths, 10) : existing.pmIntervalMonths;
    const installDate = dto.installationDate ? new Date(dto.installationDate) : new Date(existing.installationDate);
    
    const warrantyEndDate = new Date(installDate);
    warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + warrantyYears);

    const updateData: any = {
      warrantyCardNumber: dto.warrantyCardNumber,
      invoiceNumber: dto.invoiceNumber,
      customerPo: dto.customerPo,
      installationDate: installDate,
      warrantyYears,
      warrantyEndDate,
      pmIntervalMonths,
    };

    if (dto.engineerId) {
      updateData.engineerId = parseInt(dto.engineerId, 10);
    }
    if (dto.customerId) {
      updateData.customerId = parseInt(dto.customerId, 10);
    }
    if (dto.machineId) {
      updateData.machineId = parseInt(dto.machineId, 10);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update the installation record
      const updated = await tx.installation.update({
        where: { id },
        data: updateData,
      });

      // 2. If date or interval changed, regenerate scheduled PMs
      if (dto.installationDate || dto.pmIntervalMonths || dto.warrantyYears) {
        // Delete all pending scheduled PMs
        await tx.preventiveMaintenance.deleteMany({
          where: {
            installationId: id,
            status: 'SCHEDULED',
          },
        });

        // Re-generate them based on the new dates!
        const pmSchedules = [];
        const totalPMs = Math.floor((warrantyYears * 12) / pmIntervalMonths);

        for (let i = 1; i <= totalPMs; i++) {
          const scheduledDate = new Date(installDate);
          scheduledDate.setMonth(scheduledDate.getMonth() + i * pmIntervalMonths);

          pmSchedules.push({
            installationId: id,
            scheduledDate,
            status: 'SCHEDULED' as const,
          });
        }

        if (pmSchedules.length > 0) {
          await tx.preventiveMaintenance.createMany({
            data: pmSchedules,
          });
        }
      }

      return updated;
    });
  }

  // AMC Contracts
  async createAmc(dto: CreateAmcDto) {
    return this.prisma.aMCContract.create({
      data: {
        customerId: dto.customerId,
        installationId: dto.installationId,
        contractNumber: dto.contractNumber,
        type: dto.type as any,
        value: dto.value,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: 'ACTIVE',
      },
    });
  }

  async findAllAmcs() {
    return this.prisma.aMCContract.findMany({
      include: {
        customer: true,
        installation: {
          include: { machine: true },
        },
      },
      orderBy: { endDate: 'desc' },
    });
  }
}
