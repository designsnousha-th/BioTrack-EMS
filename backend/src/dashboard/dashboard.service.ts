import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const [
      totalCustomers,
      totalMachines,
      installedMachines,
      pendingCalls,
      completedCalls,
      todaysCalls,
      pmDue,
      warrantyExpiring,
      amcExpiring,
      invoices,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { status: 'ACTIVE' } }),
      this.prisma.machine.count({ where: { status: 'ACTIVE' } }),
      this.prisma.installation.count(),
      this.prisma.serviceCall.count({ where: { status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      this.prisma.serviceCall.count({ where: { status: 'COMPLETED' } }),
      this.prisma.serviceCall.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),
      this.prisma.preventiveMaintenance.count({
        where: {
          status: 'SCHEDULED',
          scheduledDate: { lte: endOfToday },
        },
      }),
      this.prisma.installation.count({
        where: {
          warrantyEndDate: {
            gte: new Date(),
            lte: new Date(new Date().setDate(new Date().getDate() + 30)),
          },
        },
      }),
      this.prisma.aMCContract.count({
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: new Date(),
            lte: new Date(new Date().setDate(new Date().getDate() + 30)),
          },
        },
      }),
      this.prisma.invoice.findMany({
        where: { paymentStatus: 'PAID' },
      }),
    ]);

    const serviceRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const taxRevenue = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      totalCustomers,
      totalMachines,
      installedMachines,
      pendingCalls,
      completedCalls,
      todaysCalls,
      pmDue,
      warrantyExpiring,
      amcExpiring,
      revenue: {
        serviceRevenue,
        taxRevenue,
        totalRevenue,
      },
    };
  }

  async getChartsData() {
    const invoices = await this.prisma.invoice.findMany({
      where: { paymentStatus: 'PAID' },
      select: { totalAmount: true, createdAt: true },
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevMap = new Map<string, number>();

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyRevMap.set(label, 0);
    }

    invoices.forEach((inv) => {
      const d = new Date(inv.createdAt);
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyRevMap.has(label)) {
        monthlyRevMap.set(label, (monthlyRevMap.get(label) || 0) + inv.totalAmount);
      }
    });

    const revenueTrend = Array.from(monthlyRevMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    const calls = await this.prisma.serviceCall.findMany({
      select: { status: true },
    });
    const statusCounts = calls.reduce((acc: any, call) => {
      acc[call.status] = (acc[call.status] || 0) + 1;
      return acc;
    }, {});
    const callsDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const installations = await this.prisma.installation.findMany({
      include: { machine: true },
    });
    const brandCounts = installations.reduce((acc: any, inst) => {
      const company = inst.machine.company;
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {});
    const brandDistribution = Object.entries(brandCounts).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      revenueTrend,
      callsDistribution,
      brandDistribution,
    };
  }

  async getRecentActivities() {
    return this.prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });
  }
}
