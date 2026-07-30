import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { MachinesModule } from './machines/machines.module';
import { ServiceCallsModule } from './service-calls/service-calls.module';
import { InventoryModule } from './inventory/inventory.module';
import { AccountsModule } from './accounts/accounts.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule.register({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CustomersModule,
    MachinesModule,
    ServiceCallsModule,
    InventoryModule,
    AccountsModule,
    DashboardModule,
  ],
})
export class AppModule {}
