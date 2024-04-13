import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { PrometheusModule } from '../prometheus/prometheus.module';
import { AuthModule } from 'apps/authentication_service/src/module';

@Module({
  imports: [AuthModule, PrometheusModule],
  providers: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule {}
