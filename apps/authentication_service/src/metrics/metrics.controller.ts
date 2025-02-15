import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller({
  version: '1',
  path: 'metrics',
})
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  public metrics(): Promise<string> {
    return this.metricsService.metrics;
  }
}
