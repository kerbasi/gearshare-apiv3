import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheckService, 
  HealthCheck, 
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ status: 200, description: 'Health check completed' })
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),
      
      // Memory health check (heap used should not exceed 150MB)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      
      // Memory health check (RSS should not exceed 150MB)
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      
      // Disk health check (storage should not exceed 80% of total space)
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.8 
      }),
    ]);
  }

  @Get('database')
  @HealthCheck()
  @ApiOperation({ summary: 'Check database connection health' })
  @ApiResponse({ status: 200, description: 'Database health check completed' })
  checkDatabase() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('memory')
  @HealthCheck()
  @ApiOperation({ summary: 'Check memory usage health' })
  @ApiResponse({ status: 200, description: 'Memory health check completed' })
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }

  @Get('disk')
  @HealthCheck()
  @ApiOperation({ summary: 'Check disk storage health' })
  @ApiResponse({ status: 200, description: 'Disk health check completed' })
  checkDisk() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.8 
      }),
    ]);
  }
}
