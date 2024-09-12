import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { IsAtLeastOneFieldPresent } from 'src/common/decorators/least-one-field-present.decorator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @ValidateIf(({ value }) => (value ? true : false))
  @Transform(({ value }) => {
    return value.toLowerCase();
  })
  name: string;

  @IsOptional()
  @IsNumber()
  employeeNumber: number;

  @IsOptional()
  @IsString()
  @ValidateIf(({ value }) => (value ? true : false))
  @Transform(({ value }) => {
    return value.toLowerCase();
  })
  position: string;

  @IsOptional()
  @IsString()
  @ValidateIf(({ value }) => (value ? true : false))
  @Transform(({ value }) => {
    return value.toLowerCase();
  })
  department: string;

  @IsOptional()
  @IsString()
  entryDate: Date;

  @IsOptional()
  @IsString()
  @IsUrl()
  photo: string;

  @IsOptional()
  @IsString()
  @ValidateIf(({ value }) => (value ? true : false))
  @Transform(({ value }) => {
    return value.toLowerCase();
  })
  status: string;

  @IsAtLeastOneFieldPresent(
    [
      'status',
      'name',
      'employeeNumber',
      'position',
      'department',
      'entryDate',
      'photo',
    ],
    {
      message: `At least one of the fields (${[
        'status',
        'name',
        'employeeNumber',
        'position',
        'department',
        'entryDate',
        'photo',
      ].join(', ')}) must be provided`,
    },
  )
  checkFields: boolean;
}
