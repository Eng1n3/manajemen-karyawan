import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteEmployeeDto {
  @IsNotEmpty()
  @IsUUID('4', { each: true })
  id: string[];
}
