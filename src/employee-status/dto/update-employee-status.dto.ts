import { IsOptional, IsString } from 'class-validator';
import { IsAtLeastOneFieldPresent } from 'src/common/decorators/least-one-field-present.decorator';

export class UpdateEmployeeStatusDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsAtLeastOneFieldPresent(Object.assign(this), {
    message: `At least one of the fields (${Object.assign(this).join(', ')}) must be provided`,
  })
  checkFields: boolean;
}
