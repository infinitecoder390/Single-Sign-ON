import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// Custom Decorator for non-empty object validation
export function IsNonEmptyObject(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isNonEmptyObject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            value && typeof value === 'object' && Object.keys(value).length > 0
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a non-empty object`;
        },
      },
    });
  };
}
