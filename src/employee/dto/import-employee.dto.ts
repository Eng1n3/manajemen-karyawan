import { Transform } from 'class-transformer';
import { ValidateIf } from 'class-validator';
import {
  HasMimeType,
  IsFile,
  MaxFileSize,
  MemoryStoredFile,
} from 'nestjs-form-data';

export class ImportEmployeeDto {
  @IsFile()
  @MaxFileSize(5 * 1024 * 1024)
  @HasMimeType(['text/csv'])
  file: MemoryStoredFile;
}
