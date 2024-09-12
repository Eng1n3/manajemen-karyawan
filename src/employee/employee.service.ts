import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageParametersDto } from 'src/common/dto/page-parameters.dto';
import { EmployeeStatus } from 'src/employee-status/entities/employee-status.entity';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { DeleteEmployeeDto } from './dto/delete-employee.dto';
import { ImportEmployeeDto } from './dto/import-employee.dto';
import { Readable } from 'stream';
import * as csv from 'csv-parser';
import { EmployeeImportCsv } from './entities/employee-import-csv.entity';
import { plainToInstance } from 'class-transformer';
import { validateArray } from 'src/common/functions/validate-array.function';
import { File } from 'src/file/entities/file.entity';
import { SaveToFileDto } from './dto/save-to-employee.dto';
import * as PDFDocument from 'pdfkit';
import { join } from 'path';
import { createWriteStream } from 'fs';
import { createFileFunction } from 'src/common/functions/create-file.function';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(File)
    private fileRepo: Repository<File>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(EmployeeStatus)
    private employeeStatusRepo: Repository<EmployeeStatus>,
  ) {}

  private async readFileFromBuffer(buffer: Buffer) {
    // Convert buffer to readable stream
    const stream = Readable.from(buffer);

    // Create array to store CSV data
    const results = [];

    // Use csv-parser to parse the CSV file
    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results)) // Return parsed CSV data
        .on('error', (err) => reject(err));
    });
  }

  async deleteEmployee(deleteEmployeeDto: DeleteEmployeeDto) {
    const isExist = await this.employeeRepo.findBy({
      id: In(deleteEmployeeDto.id),
    });
    if (!isExist.length) throw new NotFoundException('Data not found');
    await this.employeeRepo.softDelete(deleteEmployeeDto.id);
  }

  async findOneEmployee(id: string) {
    const role = await this.employeeRepo.findOne({
      where: { id },
    });
    return role;
  }

  async findAllEmployee(
    pageParametersDto: PageParametersDto & { orderBy: string },
  ) {
    const findOptionsWhere:
      | FindOptionsWhere<Employee>
      | FindOptionsWhere<Employee>[] = pageParametersDto.search
      ? [
          { name: ILike(`%${pageParametersDto.search}%`) },
          {
            employeeNumber: ILike(
              `%${pageParametersDto.search}%`,
            ) as unknown as number,
          },
          { position: ILike(`%${pageParametersDto.search}%`) },
          { department: ILike(`%${pageParametersDto.search}%`) },
        ]
      : {};

    const order: FindOptionsOrder<Employee> | null = pageParametersDto.orderBy
      ? {
          [pageParametersDto.orderBy]: {
            direction: pageParametersDto.direction
              ? pageParametersDto.direction
              : null,
          },
        }
      : null;

    const employees = await this.employeeRepo.find({
      take: pageParametersDto.take,
      skip: pageParametersDto.skip,
      where: findOptionsWhere,
      order,
    });

    const itemCount = await this.employeeRepo.count();

    const pageMetaDto = new PageMetaDto({ itemCount, pageParametersDto });

    return new PageDto(
      HttpStatus.OK,
      'Success get employee',
      employees,
      pageMetaDto,
    );
  }

  async updateEmployee(createEmployeeDto: CreateEmployeeDto & { id: string }) {
    const isExist = await this.employeeRepo.findOne({
      where: {
        id: createEmployeeDto.id,
      },
    });
    if (!isExist) throw new NotFoundException('Data not found');
    const isExistsEmployeeStatus = await this.employeeStatusRepo.findOneBy({
      name: createEmployeeDto.status,
    });
    if (!isExistsEmployeeStatus)
      throw new NotFoundException('status not found');
    const employeeCreate = this.employeeRepo.create(createEmployeeDto);
    const employee = this.employeeRepo.create(employeeCreate);
    await this.employeeRepo.save(employee);
  }

  async savePdfToFile(data: any[], filePath: string): Promise<void> {
    const doc = new PDFDocument();

    // Tentukan lokasi file yang akan disimpan

    // Gunakan fs untuk membuat write stream
    const writeStream = createWriteStream(filePath);

    // Piping PDF stream ke write stream (file lokal)
    doc.pipe(writeStream);

    // Tambahkan konten ke PDF
    doc.fontSize(25).text('Data Export', { align: 'center' });
    doc.moveDown();

    data.forEach((row, index) => {
      doc.fontSize(12).text(`Row ${index + 1}:`);
      doc.text(`Name: ${row.name}`);
      doc.text(`Age: ${row.age}`);
      doc.text(`City: ${row.city}`);
      doc.moveDown();
    });

    // Selesaikan dokumen
    doc.end();

    // Log informasi bahwa file berhasil disimpan
    writeStream.on('finish', () => {
      console.log('PDF file saved locally at:', filePath);
    });
  }

  async saveToFile(saveToFileDto: SaveToFileDto) {
    const saveTo = saveToFileDto.saveTo;
    const data = this.employeeRepo.find();
    const fileValue = await createFileFunction(data, saveTo, 'product-images');
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const isExistsEmployeeStatus = await this.employeeStatusRepo.findOneBy({
      name: createEmployeeDto.status,
    });
    if (!isExistsEmployeeStatus)
      throw new NotFoundException('status not found');
    const isExistEmployeeNumber = await this.employeeRepo.findOneBy({
      employeeNumber: createEmployeeDto.employeeNumber,
    });
    if (isExistEmployeeNumber)
      throw new BadRequestException('employee number already exists!');
    const employeeCreate = this.employeeRepo.create(createEmployeeDto);
    const employee = this.employeeRepo.create(employeeCreate);
    await this.employeeRepo.save(employee);
  }

  async importEmployee(importEmployeeDto: ImportEmployeeDto) {
    const importEmployeeFile = importEmployeeDto.file;
    const csvStream = await this.readFileFromBuffer(importEmployeeFile.buffer);
    const employee = plainToInstance(
      EmployeeImportCsv,
      csvStream,
    ) as unknown as EmployeeImportCsv[];
    const toLowerCaseEmployee = employee.map((value: EmployeeImportCsv) => ({
      ...value,
      name: value.name.toLowerCase(),
      position: value.position.toLowerCase(),
      department: value.department.toLowerCase(),
      status: value.status.toLowerCase(),
    }));
    const employeeCreate = this.employeeRepo.create(toLowerCaseEmployee);
    await this.employeeRepo.save(employeeCreate);
  }
}
