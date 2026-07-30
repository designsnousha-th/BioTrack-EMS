import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreatePartDto } from './dto/create-part.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SERVICE_MANAGER)
  create(@Body() createDto: CreatePartDto) {
    return this.inventoryService.create(createDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('lowStockOnly') lowStockOnly?: string,
  ) {
    return this.inventoryService.findAll(search, lowStockOnly);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SERVICE_MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: Partial<CreatePartDto>) {
    return this.inventoryService.update(id, updateDto);
  }
}
