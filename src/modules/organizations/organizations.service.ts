import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/services/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.organization.create({ data });
  }

  async findAll(skip = 0, take = 50) {
    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.organization.count(),
    ]);

    return { data: organizations, meta: { total, skip, take } };
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: { users: true, priceLists: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(id: string, data: any) {
    return this.prisma.organization.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.organization.delete({ where: { id } });
    return { message: 'Organization deleted' };
  }
}
