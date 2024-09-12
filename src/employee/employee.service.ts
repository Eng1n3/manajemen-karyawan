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
import { File } from 'src/file/entities/file.entity';
import { SaveToFileDto } from './dto/save-to-employee.dto';
import * as PDFDocument from 'pdfkit';
import { createWriteStream, writeFileSync } from 'fs';
import {
  createFileFunction,
  getSize,
} from 'src/common/functions/create-file.function';
import { SaveTo } from './enum/save-to.enum';
import { createObjectCsvStringifier } from 'csv-writer';
import { capitalizeWords } from 'src/common/functions/capitalize-word.function';

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

  async download(id: string) {
    const file = await this.fileRepo.findOneBy({ id });
    if (!file) throw new BadRequestException('Data file tidak ada');
    const { originalName, path, mimeType } = file;
    let contentType: string
    if (mimeType === 'pdf') contentType = 'application/pdf'
    contentType = 'text/csv'
    return { originalName, path, mimeType, contentType };
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

  async findAllFiles(
    pageParametersDto: PageParametersDto & { orderBy: string },
  ) {
    const findOptionsWhere: FindOptionsWhere<File> | FindOptionsWhere<File>[] =
      pageParametersDto.search
        ? [
            { originalName: ILike(`%${pageParametersDto.search}%`) },
            {
              mimeType: ILike(`%${pageParametersDto.search}%`),
            },
          ]
        : {};

    const order: FindOptionsOrder<File> | null = pageParametersDto.orderBy
      ? {
          [pageParametersDto.orderBy]: {
            direction: pageParametersDto.direction
              ? pageParametersDto.direction
              : null,
          },
        }
      : null;

    const files = await this.fileRepo.find({
      take: pageParametersDto.take,
      skip: pageParametersDto.skip,
      where: findOptionsWhere,
      order,
    });

    const itemCount = await this.fileRepo.count();

    const pageMetaDto = new PageMetaDto({ itemCount, pageParametersDto });

    return new PageDto(
      HttpStatus.OK,
      'Success get employee',
      files,
      pageMetaDto,
    );
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

  async savePdfToFile(data: Employee[], filePath: string) {
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
      doc.text(`nama: ${row.name}`);
      doc.text(`nomor: ${row.employeeNumber}`);
      doc.text(`jabatan: ${row.position}`);
      doc.text(`departmen: ${row.department}`);
      doc.text(`tanggal_masuk: ${row.entryDate}`);
      doc.text(`foto: ${row.photo}`);
      doc.text(`status: ${row.status}`);
      doc.moveDown();
    });

    // Selesaikan dokumen
    doc.end();

    // Log informasi bahwa file berhasil disimpan
    writeStream.on('finish', () => {
      console.log('PDF file saved locally at:', filePath);
    });

    return filePath;
  }

  async saveCsvToFile(data: Employee[], filePath: string) {
    const dataUpperCase = data.map((value: EmployeeImportCsv) => ({
      ...value,
      name: capitalizeWords(value.name),
      position: capitalizeWords(value.position),
      department: capitalizeWords(value.department),
      status: value.status.toLowerCase(),
    }));
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'nama' },
        { id: 'employeeNumber', title: 'nomor' },
        { id: 'position', title: 'jabatan' },
        { id: 'department', title: 'departmen' },
        { id: 'entryDate', title: 'tanggal_masuk' },
        { id: 'photo', title: 'foto' },
        { id: 'status', title: 'status' },
      ],
    });

    const header = csvStringifier.getHeaderString();
    const csvContent = csvStringifier.stringifyRecords(dataUpperCase);
    const result = header + csvContent;

    // Gunakan fs untuk menulis file
    writeFileSync(filePath, result, 'utf8');
    console.log('CSV file saved locally at:', filePath);

    return filePath;
  }

  async saveToFile(saveToFileDto: SaveToFileDto) {
    const data = await this.employeeRepo.find();
    const fileValue = createFileFunction(
      saveToFileDto.saveTo,
      saveToFileDto.fileName,
      'employee-files',
    );
    if (saveToFileDto.saveTo === SaveTo.PDF) {
      await this.savePdfToFile(data, fileValue.path);
      // size = getSize(filePath);
    } else {
      await this.saveCsvToFile(data, fileValue.path);
    }
    const size = getSize(fileValue.path);
    const file = this.fileRepo.create({
      isMain: true,
      mimeType: fileValue.mime,
      originalName: fileValue.originalFilename,
      path: fileValue.path,
      size,
    });
    await this.fileRepo.save(file);
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
    const toLowerCaseEmployee: EmployeeImportCsv[] = employee.map(
      (value: EmployeeImportCsv) => ({
        ...value,
        status: value.status.toLowerCase(),
      }),
    );
    const employeeCreate = this.employeeRepo.create(toLowerCaseEmployee);
    await this.employeeRepo.save(employeeCreate);
  }
}
