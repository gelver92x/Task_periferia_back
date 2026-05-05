import { type NextFunction, type Request, type Response } from 'express';
import { type ZodTypeAny, ZodError } from 'zod';

import { ValidationError } from '../../../application/errors/app-error';

type ValidationTarget = 'body' | 'params' | 'query';

export const validate =
  (schema: ZodTypeAny, target: ValidationTarget = 'body') =>
  (request: Request, _response: Response, next: NextFunction): void => {
    try {
      request[target] = schema.parse(request[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ValidationError(
            'Validation failed',
            error.errors.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          ),
        );
        return;
      }

      next(error);
    }
  };

