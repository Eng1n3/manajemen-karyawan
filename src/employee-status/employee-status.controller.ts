import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { EmployeeStatusService } from './employee-status.service';
import { ApiQuery } from '@nestjs/swagger';
import { PageParametersDto } from 'src/common/dto/page-parameters.dto';
import { CreateEmployeeStatusDto } from './dto/create-employee-status.dto';
import { EmployeeStatusOrderBy } from './enum/employee-status-order-by.enum';
import { OrderByValidationPipe } from '../common/pipes/order-by.pipe';
import { DeleteEmployeeStatusDto } from './dto/delete-employee-status.dto';

@Controller('employee-status')
export class EmployeeStatusController {
  constructor(private employeeStatusService: EmployeeStatusService) {}

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteEmployee(@Body() deleteEmployeeStatusDto: DeleteEmployeeStatusDto) {
    await this.employeeStatusService.deleteEmployeeStatus(deleteEmployeeStatusDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success deleted status',
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateEmployeeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeStatusDto: UpdateEmployeeStatusDto,
  ) {
    await this.employeeStatusService.updateEmployeeStatus({
      ...updateEmployeeStatusDto,
      id,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Success updated status',
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOneEmployeeStatus(@Param('id', ParseUUIDPipe) id: number) {
    const data = await this.employeeStatusService.findOneEmployeeStatus(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success get status',
      data,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'order_by', enum: EmployeeStatusOrderBy })
  async findAllEmployeeStatus(
    @Query() pageParametersDto: PageParametersDto,
    @Query('order_by', new OrderByValidationPipe(EmployeeStatusOrderBy))
    orderBy?: string,
  ) {
    return await this.employeeStatusService.findAllEmployeeStatus({
      skip: pageParametersDto.skip,
      ...pageParametersDto,
      orderBy,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEmployeeStatus(
    @Body() createEmployeeStatusDto: CreateEmployeeStatusDto,
  ) {
    await this.employeeStatusService.createEmployeeStatus(
      createEmployeeStatusDto,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Succes created status',
    };
  }
}
