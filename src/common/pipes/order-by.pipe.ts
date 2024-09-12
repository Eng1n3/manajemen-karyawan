import { BadRequestException, PipeTransform } from '@nestjs/common';
import { isDefined, isEnum } from 'class-validator';

export class OrderByValidationPipe implements PipeTransform {
  constructor(private orderEnum: any) {}

  transform(value: string) {
    if (!value) {
      return;
    } else {
    }
    if (isDefined(value) && isEnum(value, this.orderEnum)) {
      return this.orderEnum[value.toLocaleUpperCase()];
    } else {
      const errorMessage = `the value ${value} is not valid. See the acceptable values:${Object.keys(
        this.orderEnum,
      ).map((key) => [` ${key.toLowerCase()}`])}`;
      throw new BadRequestException(errorMessage);
    }
  }
}
