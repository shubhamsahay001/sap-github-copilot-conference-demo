import type { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
    const status = err instanceof HttpError ? err.status : 500;
    const body: Record<string, unknown> = {
      success: false,
      error: err.message || 'Unexpected error occurred.',
    };

    if (err instanceof HttpError && err.details) {
      body.details = err.details;
    }

    if (process.env.NODE_ENV !== 'production') {
      body.stack = err.stack;
    }

    res.status(status).json(body);
};
