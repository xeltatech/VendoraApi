import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/services/prisma/prisma.service';

@Injectable()
export class PriceListsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.priceList.create({ data });
  }

  async findAll(skip = 0, take = 50) {
    const [priceLists, total] = await Promise.all([
      this.prisma.priceList.findMany({
        skip,
        take,
        include: { organization: true, prices: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.priceList.count(),
    ]);

    return { data: priceLists, meta: { total, skip, take } };
  }

  async findOne(id: string) {
    const priceList = await this.prisma.priceList.findUnique({
      where: { id },
      include: {
        organization: true,
        prices: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!priceList) {
      throw new NotFoundException('Price list not found');
    }

    return priceList;
  }

  async update(id: string, data: any) {
    return this.prisma.priceList.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.priceList.delete({ where: { id } });
    return { message: 'Price list deleted' };
  }

  async addPrice(priceListId: string, variantId: string, amount: number, currency = 'USD', minQty = 1) {
    return this.prisma.price.create({
      data: {
        priceListId,
        variantId,
        amount,
        currency,
        minQty,
      },
      include: {
        variant: true,
        priceList: true,
      },
    });
  }
}
