import { BaseHealthIndicator } from './base-health.indicator';
import { HealthIndicator } from '../interfaces/health-indicator.interface';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { AnyOtherModuleService } from '../any-other-module/any-other-module.service';
import { PrometheusService } from '../prometheus/prometheus.service';

export class AnyOtherHealthIndicator
  extends BaseHealthIndicator
  implements HealthIndicator
{
  public readonly name = 'AnyOtherCustomHealthIndicator';
  protected readonly help = 'Status of ' + this.name;

  constructor(
    private service: AnyOtherModuleService,
    protected promClientService: PrometheusService,
  ) {
    super();
    //this.registerMetrics();
    this.registerGauges();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = this.service.isConnected;
    this.updatePrometheusData(isHealthy);
    return this.getStatus(this.name, isHealthy);
  }
}
