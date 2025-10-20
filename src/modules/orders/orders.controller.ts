import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new order (draft)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Factory or variant not found' })
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(
      createOrderDto,
      user.userId,
      user.organizationId,
    );
  }

  @Post(':id/submit')
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Submit an order',
    description:
      'Submits an order, generates PDF, and sends email to factory via BullMQ job queue',
  })
  @ApiResponse({
    status: 200,
    description: 'Order submitted and queued for processing',
  })
  @ApiResponse({ status: 400, description: 'Order already submitted or has no items' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.submit(id, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @CurrentUser() user?: any,
  ) {
    return this.ordersService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      status,
      userId: user?.role === UserRole.SELLER ? user.userId : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Get PDF URL for an order' })
  @ApiResponse({ status: 200, description: 'PDF URL retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order or PDF not found' })
  getPdf(@Param('id') id: string) {
    return this.ordersService.getPdf(id);
  }
}
