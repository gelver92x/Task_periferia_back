import { type ErrorRequestHandler } from 'express';

import { AppError } from '../../../application/errors/app-error';

type HttpParseError = SyntaxError & {
  status?: number;
  type?: string;
};

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  if (isJsonParseError(error)) {
    response.status(400).json({
      error: true,
      status: 400,
      message: 'Invalid JSON payload',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: true,
      status: error.statusCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  response.status(500).json({
    error: true,
    status: 500,
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
};

const isJsonParseError = (error: unknown): error is HttpParseError =>
  error instanceof SyntaxError &&
  typeof error === 'object' &&
  error !== null &&
  (error as HttpParseError).status === 400 &&
  (error as HttpParseError).type === 'entity.parse.failed';

