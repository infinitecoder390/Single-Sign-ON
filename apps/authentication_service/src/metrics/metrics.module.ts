import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { UserModule } from '../user/user.module';
import { PrometheusModule } from '../prometheus/prometheus.module';

@Module({
  imports: [UserModule, PrometheusModule],
  providers: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule {}
