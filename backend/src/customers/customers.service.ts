import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { contacts, ...customerData } = createCustomerDto;

    return this.prisma.customer.create({
      data: {
        ...customerData,
        contacts: {
          create: contacts || [],
        },
      },
      include: {
        contacts: true,
      },
    });
  }

  async findAll(query: {
    page?: string;
    limit?: string;
    search?: string;
    state?: string;
    district?: string;
    status?: string;
    tags?: string;
  }) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      status: query.status ? (query.status as any) : { not: 'ARCHIVED' },
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
        { district: { contains: query.search, mode: 'insensitive' } },
        { state: { contains: query.search, mode: 'insensitive' } },
        { gst: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.state) {
      where.state = { equals: query.state, mode: 'insensitive' };
    }

    if (query.district) {
      where.district = { equals: query.district, mode: 'insensitive' };
    }

    if (query.tags) {
      where.tags = { has: query.tags };
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          contacts: true,
          _count: {
            select: { serviceCalls: true, installations: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: true,
        installations: {
          include: {
            machine: true,
            engineer: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        serviceCalls: {
          orderBy: { createdAt: 'desc' },
          include: {
            installation: {
              include: { machine: true },
            },
            assignedEngineer: {
              select: { id: true, name: true },
            },
          },
        },
        amcContracts: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: CreateCustomerDto) {
    const { contacts, ...customerData } = updateCustomerDto;

    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.contact.deleteMany({
        where: { customerId: id },
      });

      return tx.customer.update({
        where: { id },
        data: {
          ...customerData,
          contacts: {
            create: contacts || [],
          },
        },
        include: {
          contacts: true,
        },
      });
    });
  }

  async remove(id: number) {
    return this.prisma.customer.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }
}
