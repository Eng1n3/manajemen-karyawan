import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeStatus } from 'src/employee-status/entities/employee-status.entity';
import { File } from 'src/file/entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, EmployeeStatus, File])],
  controllers: [EmployeeController],
  providers: [EmployeeService],
})
export class EmployeeModule {}
