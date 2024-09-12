import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeStatusService } from './employee-status.service';

describe('EmployeeStatusService', () => {
  let service: EmployeeStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeeStatusService],
    }).compile();

    service = module.get<EmployeeStatusService>(EmployeeStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
