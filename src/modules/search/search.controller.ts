import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  @ApiOperation({ summary: 'Search products using Meilisearch' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'factoryId', required: false, description: 'Filter by factory' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Results limit' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Results offset' })
  async searchProducts(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('factoryId') factoryId?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const filters: any = {};

    if (category) filters.category = category;
    if (factoryId) filters.factoryId = factoryId;
    if (tags) filters.tags = tags.split(',').map((t) => t.trim());

    return this.searchService.searchProducts(
      query,
      filters,
      undefined,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }
}
