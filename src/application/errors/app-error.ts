export class ApplicationError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = 'Resource not found') {
    super(message);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, details);
  }
}

