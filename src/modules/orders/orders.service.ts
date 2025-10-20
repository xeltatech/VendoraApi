import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/services/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string, organizationId: string) {
    // Validate factory
    const factory = await this.prisma.factory.findUnique({
      where: { id: createOrderDto.factoryId },
    });

    if (!factory) {
      throw new NotFoundException('Factory not found');
    }

    // Validate variants and calculate prices
    const items = await Promise.all(
      createOrderDto.items.map(async (item) => {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: true,
            prices: {
              where: createOrderDto.priceListId
                ? { priceListId: createOrderDto.priceListId }
                : {},
              take: 1,
            },
          },
        });

        if (!variant) {
          throw new NotFoundException(`Variant ${item.variantId} not found`);
        }

        // Get price
        const price = variant.prices[0];
        if (!price) {
          throw new BadRequestException(
            `No price found for variant ${variant.sku}`,
          );
        }

        const unitPrice = price.amount;
        const totalPrice = new Decimal(unitPrice.toString())
          .mul(item.quantity)
          .toDecimalPlaces(2);

        return {
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          notes: item.notes,
        };
      }),
    );

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum.add(item.totalPrice),
      new Decimal(0),
    );

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        status: 'DRAFT',
        totalAmount,
        currency: 'USD',
        notes: createOrderDto.notes,
        organizationId,
        userId,
        factoryId: createOrderDto.factoryId,
        priceListId: createOrderDto.priceListId,
        items: {
          create: items,
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        organization: true,
        factory: true,
        user: true,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Order',
        entityId: order.id,
        userId,
        orderId: order.id,
        changes: {
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount.toString(),
          itemsCount: items.length,
        },
      },
    });

    return order;
  }

  async submit(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        factory: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'DRAFT') {
      throw new BadRequestException('Order has already been submitted');
    }

    if (order.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // Create email job
    const emailJob = await this.prisma.emailJob.create({
      data: {
        to: [order.factory.contactEmail],
        subject: `New Order: ${order.orderNumber}`,
        status: 'PENDING',
        orderId: order.id,
        factoryId: order.factoryId,
      },
    });

    // Enqueue email job with BullMQ
    await this.emailQueue.add(
      'send-order-email',
      {
        orderId: order.id,
        emailJobId: emailJob.id,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'SUBMIT_ORDER',
        entityType: 'Order',
        entityId: order.id,
        userId,
        orderId: order.id,
        changes: {
          orderNumber: order.orderNumber,
          status: 'SUBMITTED',
        },
      },
    });

    return {
      message: 'Order submitted successfully',
      orderId: order.id,
      orderNumber: order.orderNumber,
      emailJobId: emailJob.id,
    };
  }

  async findAll(options: { skip?: number; take?: number; userId?: string; status?: string } = {}) {
    const { skip = 0, take = 50, userId, status } = options;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          organization: true,
          factory: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        organization: true,
        factory: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        priceList: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        emailJobs: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getPdf(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        pdfUrl: true,
        status: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.pdfUrl) {
      throw new NotFoundException('PDF not yet generated for this order');
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      pdfUrl: order.pdfUrl,
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    return `ORD-${year}-${sequence}`;
  }
}
