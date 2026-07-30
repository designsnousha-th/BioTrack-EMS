import { Controller, Post, Body, Get, UseGuards, Request, Put, Delete, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('engineers')
  getEngineers() {
    return this.authService.getEngineers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('users')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  createUser(@Body() dto: any) {
    return this.authService.createUser(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('users')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  getUsers() {
    return this.authService.getUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('users/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  updateUser(@Param('id') id: string, @Body() dto: any) {
    return this.authService.updateUser(parseInt(id, 10), dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('users/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(parseInt(id, 10));
  }
}
