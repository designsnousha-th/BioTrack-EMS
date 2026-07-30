import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePartDto) {
    return this.prisma.sparePart.create({
      data: dto,
    });
  }

  async findAll(search?: string, lowStockOnly?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { partNumber: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } },
      ];
    }

    const parts = await this.prisma.sparePart.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    if (lowStockOnly === 'true') {
      return parts.filter((part) => part.stock <= part.minStockLevel);
    }

    return parts;
  }

  async update(id: number, dto: Partial<CreatePartDto>) {
    const existing = await this.prisma.sparePart.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Spare part with ID ${id} not found`);
    }

    return this.prisma.sparePart.update({
      where: { id },
      data: dto,
    });
  }

  async findOne(id: number) {
    const part = await this.prisma.sparePart.findUnique({
      where: { id },
      include: {
        partsUsed: {
          include: {
            serviceCall: {
              include: { customer: true },
            },
          },
        },
      },
    });

    if (!part) {
      throw new NotFoundException(`Spare part with ID ${id} not found`);
    }

    return part;
  }
}
