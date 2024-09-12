import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { PageParametersDto } from 'src/common/dto/page-parameters.dto';
import { CreateFile } from 'src/common/interfaces/create-file.interface';
import { File } from 'src/file/entities/file.entity';
import { EmployeeStatus } from 'src/employee-status/entities/employee-status.entity';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(EmployeeStatus)
    private employeeStatusRepo: Repository<EmployeeStatus>,
  ) {}

  private generateSku(name: string, weight: number): string {
    const randomString = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();
    const employeeCode = name.replace(/\s+/g, '').substring(0, 3).toUpperCase(); // Ambil 3 huruf pertama dari nama produk
    const weightCode = weight.toString().padStart(3, '0'); // Berat produk sebagai kode (minimal 3 digit)

    return `${employeeCode}${weightCode}${randomString}`;
  }

  async deleteEmployee(id: string[]) {
    const isExist = await this.employeeRepo.findBy({
      id: In(id)
    });
    if (!isExist.length) throw new NotFoundException('Data not found');
    await this.employeeRepo.softDelete(id);
  }

  async findOneEmployee(id: string) {
    const role = await this.employeeRepo.findOne({
      where: { id },
      relations: { employeeStatus: true },
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
      relations: { employeeStatus: true },
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
    const isExistsCategory = await this.employeeStatusRepo.findOneBy({
      id: createEmployeeDto.employeeStatusId,
    });
    if (!isExistsCategory) throw new NotFoundException('status not found');
    const employeeCreate = this.employeeRepo.create(createEmployeeDto);
    const employee = this.employeeRepo.create(employeeCreate);
    await this.employeeRepo.save(employee);
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const isExistsCategory = await this.employeeStatusRepo.findOneBy({
      id: createEmployeeDto.employeeStatusId,
    });
    if (!isExistsCategory) throw new NotFoundException('status not found');
    const employeeCreate = this.employeeRepo.create(createEmployeeDto);
    const employee = this.employeeRepo.create(employeeCreate);
    await this.employeeRepo.save(employee);
  }
}
