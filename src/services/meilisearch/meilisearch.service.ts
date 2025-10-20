import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliSearch;
  private productsIndex: Index;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MEILI_HOST', 'http://localhost:7700');
    const apiKey = this.configService.get<string>('MEILI_MASTER_KEY');

    this.client = new MeiliSearch({
      host,
      apiKey,
    });
  }

  async onModuleInit() {
    try {
      await this.initializeIndexes();
      this.logger.log('Meilisearch indexes initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Meilisearch', error);
    }
  }

  private async initializeIndexes() {
    // Products index
    this.productsIndex = this.client.index('products');

    // Configure searchable attributes
    await this.productsIndex.updateSearchableAttributes([
      'name',
      'description',
      'sku',
      'category',
      'tags',
      'variants.name',
      'variants.sku',
      'variants.color',
      'variants.size',
    ]);

    // Configure filterable attributes
    await this.productsIndex.updateFilterableAttributes([
      'category',
      'tags',
      'factoryId',
      'isActive',
      'variants.color',
      'variants.size',
    ]);

    // Configure sortable attributes
    await this.productsIndex.updateSortableAttributes(['createdAt', 'name']);

    this.logger.log('Products index configured');
  }

  async indexProduct(product: any) {
    try {
      await this.productsIndex.addDocuments([product]);
      this.logger.log(`Product indexed: ${product.id}`);
    } catch (error) {
      this.logger.error('Error indexing product', error);
      throw error;
    }
  }

  async indexProducts(products: any[]) {
    try {
      const task = await this.productsIndex.addDocuments(products);
      this.logger.log(`Indexed ${products.length} products. Task UID: ${task.taskUid}`);
      return task;
    } catch (error) {
      this.logger.error('Error indexing products', error);
      throw error;
    }
  }

  async updateProduct(productId: string, data: any) {
    try {
      await this.productsIndex.updateDocuments([{ id: productId, ...data }]);
      this.logger.log(`Product updated in index: ${productId}`);
    } catch (error) {
      this.logger.error('Error updating product in index', error);
      throw error;
    }
  }

  async deleteProduct(productId: string) {
    try {
      await this.productsIndex.deleteDocument(productId);
      this.logger.log(`Product deleted from index: ${productId}`);
    } catch (error) {
      this.logger.error('Error deleting product from index', error);
      throw error;
    }
  }

  async searchProducts(query: string, options: any = {}) {
    try {
      const searchOptions: any = {
        limit: options.limit || 20,
        offset: options.offset || 0,
      };

      if (options.filter) {
        searchOptions.filter = options.filter;
      }

      if (options.sort) {
        searchOptions.sort = options.sort;
      }

      const results = await this.productsIndex.search(query, searchOptions);

      return {
        hits: results.hits,
        total: results.estimatedTotalHits,
        limit: searchOptions.limit,
        offset: searchOptions.offset,
        processingTimeMs: results.processingTimeMs,
      };
    } catch (error) {
      this.logger.error('Error searching products', error);
      throw error;
    }
  }

  async clearProductsIndex() {
    try {
      await this.productsIndex.deleteAllDocuments();
      this.logger.log('Products index cleared');
    } catch (error) {
      this.logger.error('Error clearing products index', error);
      throw error;
    }
  }

  async getIndexStats() {
    try {
      const stats = await this.productsIndex.getStats();
      return stats;
    } catch (error) {
      this.logger.error('Error getting index stats', error);
      throw error;
    }
  }

  getClient(): MeiliSearch {
    return this.client;
  }

  getProductsIndex(): Index {
    return this.productsIndex;
  }
}
