import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyReportDto, ReviewDailyReportDto } from './dto/daily-reports.dto';

@Injectable()
export class DailyReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateDailyReportDto) {
    return this.prisma.dailyReport.create({
      data: {
        userId,
        workCompleted: dto.workCompleted,
        problems: dto.problems,
        tomorrowPlan: dto.tomorrowPlan,
        hospitalVisits: dto.hospitalVisits || [],
        meetings: dto.meetings || [],
        calls: dto.calls || [],
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  async findAll(role: string, userId: number) {
    // Managers and Admins can see all reports.
    // Engineers and Executives see their own.
    const isManager = ['SUPER_ADMIN', 'ADMIN', 'SERVICE_MANAGER', 'SALES_MANAGER'].includes(role);

    return this.prisma.dailyReport.findMany({
      where: isManager ? {} : { userId },
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Daily report with ID ${id} not found`);
    }

    return report;
  }

  async review(id: number, reviewerId: number, dto: ReviewDailyReportDto) {
    const report = await this.findOne(id);

    return this.prisma.dailyReport.update({
      where: { id: report.id },
      data: {
        status: dto.status,
        reviewRemarks: dto.reviewRemarks,
        reviewedById: reviewerId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
