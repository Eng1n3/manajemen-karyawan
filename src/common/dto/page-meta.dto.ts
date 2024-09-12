import { ApiProperty } from "@nestjs/swagger";
import { PageMetaDtoParameters } from "../interfaces/page-meta-parameter.interface";

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ pageParametersDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageParametersDto.page;
    this.take = pageParametersDto.take;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take) || 1;
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}