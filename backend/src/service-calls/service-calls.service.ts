import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceCallDto, UpdateServiceCallDto, CompletePmDto } from './dto/create-service-call.dto';

@Injectable()
export class ServiceCallsService {
  constructor(private prisma: PrismaService) {}

  // Service Calls
  async create(dto: CreateServiceCallDto, creatorId?: number) {
    const callNumber = `SRV-${Date.now()}`;
    return this.prisma.serviceCall.create({
      data: {
        callNumber,
        customerId: dto.customerId,
        installationId: dto.installationId,
        reportedProblem: dto.reportedProblem,
        priority: dto.priority || 'MEDIUM',
        assignedEngineerId: dto.assignedEngineerId,
        status: dto.assignedEngineerId ? 'ASSIGNED' : 'PENDING',
        creatorId,
      },
      include: {
        customer: true,
        installation: {
          include: { machine: true },
        },
      },
    });
  }

  async findAll(query: {
    status?: string;
    priority?: string;
    engineerId?: string;
    customerId?: string;
    search?: string;
  }) {
    const where: any = {};

    if (query.status) {
      where.status = query.status as any;
    }
    if (query.priority) {
      where.priority = query.priority as any;
    }
    if (query.engineerId) {
      where.assignedEngineerId = parseInt(query.engineerId, 10);
    }
    if (query.customerId) {
      where.customerId = parseInt(query.customerId, 10);
    }

    if (query.search) {
      where.OR = [
        { callNumber: { contains: query.search, mode: 'insensitive' } },
        { reportedProblem: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { installation: { machine: { serialNumber: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }

    return this.prisma.serviceCall.findMany({
      where,
      include: {
        customer: true,
        installation: {
          include: { machine: true },
        },
        assignedEngineer: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const call = await this.prisma.serviceCall.findUnique({
      where: { id },
      include: {
        customer: {
          include: { contacts: true },
        },
        installation: {
          include: { machine: true },
        },
        assignedEngineer: {
          select: { id: true, name: true, role: true },
        },
        partsUsed: {
          include: { sparePart: true },
        },
        creator: {
          select: { id: true, name: true },
        },
      },
    });

    if (!call) {
      throw new NotFoundException(`Service Call with ID ${id} not found`);
    }

    return call;
  }

  async update(id: number, dto: UpdateServiceCallDto) {
    const existing = await this.prisma.serviceCall.findUnique({
      where: { id },
      include: { partsUsed: true },
    });

    if (!existing) {
      throw new NotFoundException(`Service Call with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.status === 'COMPLETED' && existing.status !== 'COMPLETED' && dto.partsUsed) {
        for (const item of dto.partsUsed) {
          const part = await tx.sparePart.findUnique({
            where: { id: item.sparePartId },
          });

          if (!part) {
            throw new NotFoundException(`Spare part with ID ${item.sparePartId} not found`);
          }

          if (part.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for spare part: ${part.name} (Stock: ${part.stock}, Requested: ${item.quantity})`);
          }

          await tx.sparePart.update({
            where: { id: item.sparePartId },
            data: { stock: { decrement: item.quantity } },
          });

          await tx.partsUsed.create({
            data: {
              serviceCallId: id,
              sparePartId: item.sparePartId,
              quantity: item.quantity,
              unitPrice: part.unitCost,
            },
          });
        }
      }

      return tx.serviceCall.update({
        where: { id },
        data: {
          status: dto.status,
          observation: dto.observation,
          remarks: dto.remarks,
          laborCharge: dto.laborCharge,
          travelCharge: dto.travelCharge,
          customerSignature: dto.customerSignature,
        },
        include: {
          partsUsed: {
            include: { sparePart: true },
          },
        },
      });
    });
  }

  async bulkAssign(ids: number[], engineerId: number) {
    return this.prisma.serviceCall.updateMany({
      where: { id: { in: ids } },
      data: {
        assignedEngineerId: engineerId,
        status: 'ASSIGNED',
      },
    });
  }

  async bulkClose(ids: number[]) {
    return this.prisma.serviceCall.updateMany({
      where: { id: { in: ids } },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  // Preventive Maintenance
  async findAllPms(query: { status?: string; engineerId?: string }) {
    const where: any = {};

    if (query.status) {
      where.status = query.status as any;
    }
    if (query.engineerId) {
      where.engineerId = parseInt(query.engineerId, 10);
    }

    return this.prisma.preventiveMaintenance.findMany({
      where,
      include: {
        installation: {
          include: { machine: true, customer: true },
        },
        engineer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async completePm(id: number, dto: CompletePmDto) {
    const existing = await this.prisma.preventiveMaintenance.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`PM Schedule with ID ${id} not found`);
    }

    return this.prisma.preventiveMaintenance.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        checklistReport: dto.checklistReport,
        engineerId: dto.engineerId,
        actualDate: new Date(),
        signature: dto.signature,
      },
    });
  }

  async getCalendarData() {
    const serviceCalls = await this.prisma.serviceCall.findMany({
      select: {
        id: true,
        callNumber: true,
        reportedProblem: true,
        createdAt: true,
        status: true,
        priority: true,
        customer: { select: { name: true } },
      },
    });

    const pmSchedules = await this.prisma.preventiveMaintenance.findMany({
      select: {
        id: true,
        scheduledDate: true,
        status: true,
        installation: {
          select: {
            machine: { select: { name: true } },
            customer: { select: { name: true } },
          },
        },
      },
    });

    const events = [
      ...serviceCalls.map((call) => ({
        id: `call-${call.id}`,
        title: `Service: ${call.callNumber} - ${call.customer.name}`,
        date: call.createdAt.toISOString().split('T')[0],
        type: 'call',
        status: call.status,
        color: call.priority === 'CRITICAL' ? 'red' : call.priority === 'HIGH' ? 'orange' : 'blue',
      })),
      ...pmSchedules.map((pm) => ({
        id: `pm-${pm.id}`,
        title: `PM: ${pm.installation.machine.name} - ${pm.installation.customer.name}`,
        date: pm.scheduledDate.toISOString().split('T')[0],
        type: 'pm',
        status: pm.status,
        color: pm.status === 'COMPLETED' ? 'green' : 'purple',
      })),
    ];

    return events;
  }
}
