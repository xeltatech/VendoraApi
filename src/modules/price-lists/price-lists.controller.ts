import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PriceListsService } from './price-lists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('price-lists')
@Controller('price-lists')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PriceListsController {
  constructor(private readonly priceListsService: PriceListsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() data: any) {
    return this.priceListsService.create(data);
  }

  @Get()
  findAll() {
    return this.priceListsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceListsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.priceListsService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.priceListsService.remove(id);
  }

  @Post(':id/prices')
  @Roles(UserRole.ADMIN)
  addPrice(@Param('id') id: string, @Body() data: any) {
    return this.priceListsService.addPrice(id, data.variantId, data.amount, data.currency, data.minQty);
  }
}
