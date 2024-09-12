import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    return value.toLowerCase();
  })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  employeeNumber: number;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    return value.toLowerCase();
  })
  position: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    return value.toLowerCase();
  })
  department: string;

  @IsNotEmpty()
  @IsISO8601()
  entryDate: Date;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  photo: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    return value.toLowerCase();
  })
  status: string;
}
