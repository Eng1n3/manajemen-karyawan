import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeStatus } from './entities/employee-status.entity';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Not,
  Repository,
} from 'typeorm';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { PageParametersDto } from 'src/common/dto/page-parameters.dto';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { PageDto } from 'src/common/dto/page.dto';
import { CreateEmployeeStatusDto } from './dto/create-employee-status.dto';

@Injectable()
export class EmployeeStatusService {
  constructor(
    @InjectRepository(EmployeeStatus)
    private employeeStatusRepo: Repository<EmployeeStatus>,
  ) {}

  async deleteEmployeeStatus(id: string) {
    const isExist = await this.employeeStatusRepo.findOneBy({
      id,
    });
    if (!isExist) throw new NotFoundException('Data not found');
    await this.employeeStatusRepo.softDelete(id);
  }

  async updateEmployeeStatus(
    updateEmployeeStatusDto: UpdateEmployeeStatusDto & { id: string },
  ) {
    const isExist = await this.employeeStatusRepo.findOneBy({
      id: updateEmployeeStatusDto.id,
    });
    if (!isExist) throw new NotFoundException('Data not found');
    const isExistNames = await this.employeeStatusRepo.findBy({
      name: updateEmployeeStatusDto.name.toLowerCase(),
      id: Not(updateEmployeeStatusDto.id),
    });
    if (isExistNames.length)
      throw new BadRequestException('Status already exists');
    const employeeStatus = this.employeeStatusRepo.create({
      ...isExist,
      ...updateEmployeeStatusDto,
    });
    await this.employeeStatusRepo.save(employeeStatus);
  }

  async findOneEmployeeStatus(id: string) {
    const role = await this.employeeStatusRepo.findOneBy({ id });
    return role;
  }

  async findAllEmployeeStatus(
    pageParametersDto: PageParametersDto & { orderBy: string },
  ) {
    const findOptionsWhere:
      | FindOptionsWhere<EmployeeStatus>
      | FindOptionsWhere<EmployeeStatus>[] = pageParametersDto.search
      ? [
          { name: ILike(`%${pageParametersDto.search}%`) },
          { description: ILike(`%${pageParametersDto.search}%`) },
        ]
      : {};

    const order: FindOptionsOrder<EmployeeStatus> | null =
      pageParametersDto.orderBy
        ? {
            [pageParametersDto.orderBy]: {
              direction: pageParametersDto.direction
                ? pageParametersDto.direction
                : null,
            },
          }
        : null;

    const status = await this.employeeStatusRepo.find({
      take: pageParametersDto.take,
      skip: pageParametersDto.skip,
      where: findOptionsWhere,
      order,
    });

    const itemCount = await this.employeeStatusRepo.count();

    const pageMetaDto = new PageMetaDto({ itemCount, pageParametersDto });

    return new PageDto(
      HttpStatus.OK,
      'Success get status',
      status,
      pageMetaDto,
    );
  }

  async createEmployeeStatus(createEmployeeStatusDto: CreateEmployeeStatusDto) {
    const isExist = await this.employeeStatusRepo.findOneBy({
      name: createEmployeeStatusDto.name,
    });
    if (isExist) throw new BadRequestException('status already exists');
    const employeeStatus = this.employeeStatusRepo.create(
      createEmployeeStatusDto,
    );
    await this.employeeStatusRepo.save(employeeStatus);
  }
}
