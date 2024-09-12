import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';

enum SaveTo {
  PDF = 'pdf',
  CSV = 'csv',
}

export class SaveToFileDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(SaveTo)
  saveTo: string;
}
