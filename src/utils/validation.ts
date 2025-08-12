import { validateOrReject, ValidationError } from "class-validator";


export async function validateDto(dto: any): Promise<void> {
    try {
      await validateOrReject(dto, { whitelist: true });
    } catch (errors) {
      const validationErrors = flattenValidationErrors(errors as ValidationError[]);
      const error = new Error('Validation failed');
      (error as any).validationErrors = validationErrors;
      throw error;
    }
}

function flattenValidationErrors(errors: ValidationError[]): any[] {
    const result: any[] = [];
  
    for (const error of errors) {
      if (error.constraints) {
        result.push({
          property: error.property,
          constraints: error.constraints,
        });
      }
  
      if (error.children && error.children.length > 0) {
        const childrenErrors = flattenValidationErrors(error.children);
        for (const childError of childrenErrors) {
          result.push({
            property: `${error.property}.${childError.property}`,
            constraints: childError.constraints,
          });
        }
      }
    }
  
    return result;
  }