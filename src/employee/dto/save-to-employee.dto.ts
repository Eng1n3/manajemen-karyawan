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
import { SaveTo } from '../enum/save-to.enum';

export class SaveToFileDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(SaveTo)
  saveTo: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;
}
