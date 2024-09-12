import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { IsAtLeastOneFieldPresent } from 'src/common/decorators/least-one-field-present.decorator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  employeeStatusId: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  employeeNumber: number;

  @IsOptional()
  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  department: string;

  @IsOptional()
  @IsString()
  entryDate: Date;

  @IsOptional()
  @IsString()
  @IsUrl()
  photo: string;

  @IsAtLeastOneFieldPresent(['name'], {
    message: `At least one of the fields (${Object.assign(this).join(', ')}) must be provided`,
  })
  checkFields: boolean;
}
