import { Injectable } from '@nestjs/common';
// import { HealthService } from '../health/health.service';
import { PrometheusService } from '../prometheus/prometheus.service';

@Injectable()
export class MetricsService {
  public get metrics(): Promise<string> {
    return this.promClientService.metrics;
  }

  constructor(private promClientService: PrometheusService) {}
}
