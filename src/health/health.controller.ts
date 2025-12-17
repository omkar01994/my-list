import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { HealthCheckService } from '../common/services/health-check.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @ApiOperation({ summary: 'Check service health status' })
  @ApiOkResponse({ description: 'Service health status' })
  async checkHealth() {
    return this.healthCheckService.checkHealth();
  }
}