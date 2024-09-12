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
import {
  createWriteStream,
  stat,
  statSync,
  writeFile,
  writeFileSync,
} from 'fs';
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
    let contentType: string;
    if (mimeType === 'pdf') contentType = 'application/pdf';
    contentType = 'text/csv';
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

  // async savePdfToFile(data: Employee[], filePath: string) {
  //   const doc = new PDFDocument();

  //   // Tentukan lokasi file yang akan disimpan

  //   // Gunakan fs untuk membuat write stream
  //   const writeStream = createWriteStream(filePath);

  //   // Piping PDF stream ke write stream (file lokal)
  //   doc.pipe(writeStream);

  //   // Tambahkan konten ke PDF
  //   doc.fontSize(25).text('Data Export', { align: 'center' });
  //   doc.moveDown();

  //   data.forEach((row, index) => {
  //     doc.fontSize(12).text(`Row ${index + 1}:`);
  //     doc.text(`nama: ${row.name}`);
  //     doc.text(`nomor: ${row.employeeNumber}`);
  //     doc.text(`jabatan: ${row.position}`);
  //     doc.text(`departmen: ${row.department}`);
  //     doc.text(`tanggal_masuk: ${row.entryDate}`);
  //     doc.text(`foto: ${row.photo}`);
  //     doc.text(`status: ${row.status}`);
  //     doc.moveDown();
  //   });

  //   // Selesaikan dokumen
  //   doc.end();

  //   // Log informasi bahwa file berhasil disimpan
  //   writeStream.on('finish', () => {
  //     console.log('PDF file saved locally at:', filePath);
  //   });

  //   return new Promise((resolve) => {
  //     writeStream.on('end', async () => {
  //       resolve(stats);
  //     });
  //   });
  // }

  // async function createPDF(filePath: string) {
  //   const doc = new PDFDocument();
  //   const chunks: Buffer[] = [];

  //   doc.text('Hello, PDF world!');

  //   // Buffer the output
  //   doc.on('data', (chunk) => chunks.push(chunk));
  //   doc.on('end', async () => {
  //     const result = Buffer.concat(chunks);
  //     const stats = getSize(filePath); // Simpan file dan kembalikan stats
  //     console.log('Returned stats:', stats);
  //   });

  //   doc.end();

  //   // Mengembalikan stat di akhir
  //   return new Promise((resolve) => {
  //     doc.on('end', async () => {
  //       const result = Buffer.concat(chunks);
  //       const stats = getSize(filePath);
  //       resolve(stats);
  //     });
  //   });
  // }

  createProductTablePDF(data: Employee[], filePath: string) {
    const doc = new PDFDocument();
    const writeStream = createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header Judul
    doc.fontSize(18).text('Product List', { align: 'center' });
    doc.moveDown();

    // Header Tabel
    doc.fontSize(12);
    const tableTop = 100;
    const rowHeight = 20;

    const headers = [
      'nama',
      'nomor',
      'jabatan',
      'departmen',
      'tanggal_masuk',
      'photo',
      'status',
    ];
    let currentY = tableTop;

    // Tulis Header Kolom
    headers.forEach((header, i) => {
      doc.text(header, 50 + i * 80, currentY);
    });

    // Garis bawah header
    doc
      .moveTo(50, currentY + 15)
      .lineTo(550, currentY + 15)
      .stroke();
    currentY += rowHeight;

    // Isi Tabel
    data.forEach((row) => {
      doc.text(row.name.toString(), 50, currentY);
      doc.text(row.employeeNumber.toString(), 130, currentY);
      doc.text(row.position.toString(), 210, currentY);
      doc.text(row.department.toString(), 290, currentY);
      doc.text(row.entryDate.toString(), 370, currentY);
      doc.text(row.photo.toString(), 450, currentY);
      doc.text(row.status.toString(), 530, currentY);

      currentY += rowHeight;
    });

    // Garis bawah tabel
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();

    // Akhiri dan simpan dokumen
    doc.end();

    writeStream.on('finish', () => {
      console.log('PDF created successfully.');
    });
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

    const stats = statSync(filePath);
    const fileSizeInBytes = stats.size;
    return fileSizeInBytes;
  }

  async saveToFile(saveToFileDto: SaveToFileDto) {
    const data = await this.employeeRepo.find();
    const fileValue = createFileFunction(
      saveToFileDto.saveTo,
      saveToFileDto.fileName,
      'employee-files',
    );
    let size: number;
    if (saveToFileDto.saveTo === SaveTo.PDF) {
      this.createProductTablePDF(data, fileValue.path);
      // size = await this.savePdfToFile(data, fileValue.path);
      // size = getSize(filePath);
      size = 0;
    } else {
      size = await this.saveCsvToFile(data, fileValue.path);
    }
    console.log(size);
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
