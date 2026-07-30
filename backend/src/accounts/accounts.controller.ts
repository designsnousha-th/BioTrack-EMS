import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post('invoices')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTS, Role.SERVICE_MANAGER)
  createInvoice(@Body() dto: CreateBillingDto) {
    return this.accountsService.createInvoice(dto);
  }

  @Get('invoices')
  findAllInvoices() {
    return this.accountsService.findAllInvoices();
  }

  @Put('invoices/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTS)
  updateInvoiceStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'UNPAID' | 'PARTIAL' | 'PAID',
  ) {
    return this.accountsService.updateInvoiceStatus(id, status);
  }

  @Post('quotations')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTS, Role.SALES_MANAGER, Role.SALES_EXECUTIVE)
  createQuotation(@Body() dto: CreateBillingDto) {
    return this.accountsService.createQuotation(dto);
  }

  @Get('quotations')
  findAllQuotations() {
    return this.accountsService.findAllQuotations();
  }
}
