import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/services/prisma/prisma.service';

@Injectable()
export class FactoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.factory.create({ data });
  }

  async findAll(skip = 0, take = 50) {
    const [factories, total] = await Promise.all([
      this.prisma.factory.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.factory.count(),
    ]);

    return { data: factories, meta: { total, skip, take } };
  }

  async findOne(id: string) {
    const factory = await this.prisma.factory.findUnique({
      where: { id },
      include: { products: true, orders: true },
    });

    if (!factory) {
      throw new NotFoundException('Factory not found');
    }

    return factory;
  }

  async update(id: string, data: any) {
    return this.prisma.factory.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.factory.delete({ where: { id } });
    return { message: 'Factory deleted' };
  }
}
