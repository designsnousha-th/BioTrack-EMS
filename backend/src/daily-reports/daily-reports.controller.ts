import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { DailyReportsService } from './daily-reports.service';
import { CreateDailyReportDto, ReviewDailyReportDto } from './dto/daily-reports.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('daily-reports')
export class DailyReportsController {
  constructor(private reportsService: DailyReportsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateDailyReportDto) {
    return this.reportsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.reportsService.findAll(req.user.role, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Put(':id/review')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SERVICE_MANAGER, Role.SALES_MANAGER)
  review(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewDailyReportDto,
  ) {
    return this.reportsService.review(id, req.user.id, dto);
  }
}
