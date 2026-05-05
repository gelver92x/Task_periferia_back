import { type ErrorRequestHandler } from 'express';

import { AppError } from '../../../application/errors/app-error';

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
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

