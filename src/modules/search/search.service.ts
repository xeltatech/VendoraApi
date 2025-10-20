import { Injectable } from '@nestjs/common';
import { MeilisearchService } from '@/services/meilisearch/meilisearch.service';

@Injectable()
export class SearchService {
  constructor(private meilisearch: MeilisearchService) {}

  async searchProducts(query: string, filters?: any, sort?: string[], limit = 20, offset = 0) {
    const filterStrings = [];

    if (filters?.category) {
      filterStrings.push(`category = "${filters.category}"`);
    }

    if (filters?.factoryId) {
      filterStrings.push(`factoryId = "${filters.factoryId}"`);
    }

    if (filters?.isActive !== undefined) {
      filterStrings.push(`isActive = ${filters.isActive}`);
    }

    if (filters?.tags && filters.tags.length > 0) {
      const tagFilters = filters.tags.map((tag: string) => `tags = "${tag}"`).join(' OR ');
      filterStrings.push(`(${tagFilters})`);
    }

    const results = await this.meilisearch.searchProducts(query, {
      filter: filterStrings.length > 0 ? filterStrings.join(' AND ') : undefined,
      sort,
      limit,
      offset,
    });

    return results;
  }
}
