import { Module } from '@nestjs/common';
import { EmployeeStatusController } from './employee-status.controller';
import { EmployeeStatusService } from './employee-status.service';

@Module({
  controllers: [EmployeeStatusController],
  providers: [EmployeeStatusService]
})
export class EmployeeStatusModule {}
