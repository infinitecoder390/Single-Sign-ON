import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { PrometheusService } from '../prometheus/prometheus.service';

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [MetricsService, PrometheusService],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
