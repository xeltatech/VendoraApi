import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FactoriesService } from './factories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('factories')
@Controller('factories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() data: any) {
    return this.factoriesService.create(data);
  }

  @Get()
  findAll() {
    return this.factoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.factoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.factoriesService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.factoriesService.remove(id);
  }
}
