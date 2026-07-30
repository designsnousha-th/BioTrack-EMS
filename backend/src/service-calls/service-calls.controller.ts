import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { ServiceCallsService } from './service-calls.service';
import { CreateServiceCallDto, UpdateServiceCallDto, CompletePmDto } from './dto/create-service-call.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ServiceCallsController {
  constructor(private serviceCallsService: ServiceCallsService) {}

  // Service Calls
  @Post('service-calls')
  create(@Body() createDto: CreateServiceCallDto, @Request() req: any) {
    return this.serviceCallsService.create(createDto, req.user.id);
  }

  @Get('service-calls')
  findAll(
    @Query() query: {
      status?: string;
      priority?: string;
      engineerId?: string;
      customerId?: string;
      search?: string;
    },
  ) {
    return this.serviceCallsService.findAll(query);
  }

  @Get('service-calls/calendar')
  getCalendarData() {
    return this.serviceCallsService.getCalendarData();
  }

  @Get('service-calls/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceCallsService.findOne(id);
  }

  @Put('service-calls/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateServiceCallDto) {
    return this.serviceCallsService.update(id, updateDto);
  }

  @Post('service-calls/bulk-assign')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SERVICE_MANAGER)
  bulkAssign(@Body() body: { ids: number[]; engineerId: number }) {
    return this.serviceCallsService.bulkAssign(body.ids, body.engineerId);
  }

  @Post('service-calls/bulk-close')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SERVICE_MANAGER)
  bulkClose(@Body() body: { ids: number[] }) {
    return this.serviceCallsService.bulkClose(body.ids);
  }

  // Preventive Maintenance
  @Get('pms')
  findAllPms(@Query() query: { status?: string; engineerId?: string }) {
    return this.serviceCallsService.findAllPms(query);
  }

  @Put('pms/:id/complete')
  completePm(@Param('id', ParseIntPipe) id: number, @Body() dto: CompletePmDto) {
    return this.serviceCallsService.completePm(id, dto);
  }
}
