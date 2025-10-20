import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'System metrics endpoint' })
  @ApiResponse({ status: 200, description: 'System metrics' })
  getMetrics() {
    return this.appService.getMetrics();
  }
}
