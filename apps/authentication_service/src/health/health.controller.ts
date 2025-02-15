import { Controller, Get } from '@nestjs/common';
import { HealthCheckResult } from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller({
  version: '1',
  path: 'health',
})
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  public async check(): Promise<HealthCheckResult> {
    return await this.healthService.check();
  }
}
