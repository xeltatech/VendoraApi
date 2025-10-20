import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/services/prisma/prisma.service';
import { MeilisearchService } from '@/services/meilisearch/meilisearch.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private meilisearch: MeilisearchService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
      include: {
        factory: true,
        variants: true,
      },
    });

    // Index in Meilisearch
    await this.meilisearch.indexProduct(product);

    return product;
  }

  async findAll(options: { skip?: number; take?: number; factoryId?: string } = {}) {
    const { skip = 0, take = 50, factoryId } = options;

    const where = factoryId ? { factoryId } : {};

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          factory: true,
          variants: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        factory: true,
        variants: {
          include: {
            prices: {
              include: {
                priceList: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        factory: true,
        variants: true,
      },
    });

    // Update in Meilisearch
    await this.meilisearch.updateProduct(id, product);

    return product;
  }

  async remove(id: string) {
    await this.prisma.product.delete({
      where: { id },
    });

    // Remove from Meilisearch
    await this.meilisearch.deleteProduct(id);

    return { message: 'Product deleted successfully' };
  }

  async reindexAll() {
    const products = await this.prisma.product.findMany({
      include: {
        factory: true,
        variants: true,
      },
    });

    await this.meilisearch.indexProducts(products);

    return { message: `Reindexed ${products.length} products` };
  }
}
