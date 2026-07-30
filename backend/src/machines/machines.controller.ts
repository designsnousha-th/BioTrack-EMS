import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe, Put } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { CreateInstallationDto, CreateAmcDto } from './dto/create-installation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MachinesController {
  constructor(private machinesService: MachinesService) {}

  // Master Machines
  @Post('machines')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SERVICE_MANAGER)
  createMachine(@Body() createMachineDto: CreateMachineDto) {
    return this.machinesService.createMachine(createMachineDto);
  }

  @Get('machines')
  findAllMachines(@Query('search') search?: string) {
    return this.machinesService.findAllMachines(search);
  }

  // Installations
  @Post('installations')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SERVICE_MANAGER, Role.SERVICE_ENGINEER)
  createInstallation(@Body() createInstallationDto: CreateInstallationDto) {
    return this.machinesService.createInstallation(createInstallationDto);
  }

  @Get('installations')
  findAllInstallations(
    @Query() query: {
      customerId?: string;
      warrantyStatus?: 'active' | 'expired' | 'expiring';
      search?: string;
    },
  ) {
    return this.machinesService.findAllInstallations(query);
  }

  @Get('installations/:id')
  findInstallation(@Param('id', ParseIntPipe) id: number) {
    return this.machinesService.findInstallation(id);
  }

  @Put('installations/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SERVICE_MANAGER)
  updateInstallation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.machinesService.updateInstallation(id, dto);
  }

  // AMC Contracts
  @Post('amcs')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SERVICE_MANAGER, Role.ACCOUNTS)
  createAmc(@Body() createAmcDto: CreateAmcDto) {
    return this.machinesService.createAmc(createAmcDto);
  }

  @Get('amcs')
  findAllAmcs() {
    return this.machinesService.findAllAmcs();
  }
}
