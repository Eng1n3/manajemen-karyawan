import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeStatusController } from './employee-status.controller';

describe('EmployeeStatusController', () => {
  let controller: EmployeeStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeStatusController],
    }).compile();

    controller = module.get<EmployeeStatusController>(EmployeeStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
