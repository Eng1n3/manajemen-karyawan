import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class DeleteEmployeeStatusDto {
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  id: number[];
}
