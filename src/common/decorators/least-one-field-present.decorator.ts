import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Custom validator for dynamic field validation
@ValidatorConstraint({ async: false })
export class IsAtLeastOneFieldPresentConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const [fields] = args.constraints;
    const object = args.object as any;
    // Check if at least one of the fields has a value
    return fields.some((field: string) => !!object[field]);
  }

  defaultMessage(args: ValidationArguments) {
    const [fields] = args.constraints;
    return `At least one of the fields (${fields.join(', ')}) must be present`;
  }
}

export function IsAtLeastOneFieldPresent(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [fields],
      validator: IsAtLeastOneFieldPresentConstraint,
    });
  };
}
