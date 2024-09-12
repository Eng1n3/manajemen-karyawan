import { Module } from '@nestjs/common';
import { EmployeeStatusController } from './employee-status.controller';
import { EmployeeStatusService } from './employee-status.service';
import { EmployeeStatus } from './entities/employee-status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeStatus])],
  controllers: [EmployeeStatusController],
  providers: [EmployeeStatusService]
})
export class EmployeeStatusModule {}
