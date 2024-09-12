import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Direction } from "../enum/direction.enum";

export class PageParametersDto {
  @ApiPropertyOptional({ enum: Direction })
  @IsEnum(Direction)
  @IsOptional()
  readonly direction?: Direction

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 10;

  @IsOptional()
  @IsString()
  search?: string = ''

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}