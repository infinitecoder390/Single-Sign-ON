import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusService } from '../prometheus/prometheus.service';
import { AnyOtherModuleService } from '../any-other-module/any-other-module.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      providers: [HealthService, PrometheusService, AnyOtherModuleService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
