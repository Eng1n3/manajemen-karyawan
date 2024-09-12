import {
  Controller,
  HttpCode,
  Post,
  Body,
  HttpStatus,
  Query,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Delete,
  ParseArrayPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { PageParametersDto } from 'src/common/dto/page-parameters.dto';
import { OrderByValidationPipe } from 'src/common/pipes/order-by.pipe';
import { EmployeeOrderBy } from './enum/employee-order-by.enum';
import { ApiQuery } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { DeleteEmployeeDto } from './dto/delete-employee.dto';
import { ImportEmployeeDto } from './dto/import-employee.dto';
import { FormDataRequest } from 'nestjs-form-data';
import { SaveToFileDto } from './dto/save-to-employee.dto';
import { FileOrderBy } from 'src/file/enum/file-order-by.enum';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Controller('employee')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteEmployee(@Body() deleteEmployeeDto: DeleteEmployeeDto) {
    await this.employeeService.deleteEmployee(deleteEmployeeDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success deleted status',
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    await this.employeeService.updateEmployee({
      ...updateEmployeeDto,
      id,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Success updated status',
    };
  }

  @Get('files')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'order_by', enum: FileOrderBy })
  @UseInterceptors(ClassSerializerInterceptor)
  async findAllFiles(
    @Query() pageParametersDto: PageParametersDto,
    @Query('order_by', new OrderByValidationPipe(FileOrderBy))
    orderBy?: string,
  ) {
    return await this.employeeService.findAllFiles({
      skip: pageParametersDto.skip,
      ...pageParametersDto,
      orderBy,
    });
  }

  @Get('download/:id')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'order_by', enum: FileOrderBy })
  @UseInterceptors(ClassSerializerInterceptor)
  async download(
    @Res({ passthrough: true }) res: Response,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StreamableFile> {
    const { originalName, path, contentType, mimeType } =
      await this.employeeService.download(id);
    const file = createReadStream(join(process.cwd(), path));
    file.pipe(res);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${originalName}.${mimeType}"`,
    });
    return new StreamableFile(file);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOneEmployee(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.employeeService.findOneEmployee(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Success get status',
      data,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'order_by', enum: EmployeeOrderBy })
  @UseInterceptors(ClassSerializerInterceptor)
  async findAllEmployee(
    @Query() pageParametersDto: PageParametersDto,
    @Query('order_by', new OrderByValidationPipe(EmployeeOrderBy))
    orderBy?: string,
  ) {
    return await this.employeeService.findAllEmployee({
      skip: pageParametersDto.skip,
      ...pageParametersDto,
      orderBy,
    });
  }

  @Post('save-to')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  async saveTo(@Body() saveToFileDto: SaveToFileDto) {
    await this.employeeService.saveToFile(saveToFileDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Succes created status',
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    await this.employeeService.createEmployee(createEmployeeDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Succes created status',
    };
  }

  @Post('import')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  @FormDataRequest()
  async importEmployee(@Body() importEmployeeDto: ImportEmployeeDto) {
    await this.employeeService.importEmployee(importEmployeeDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Succes import data',
    };
  }
}
