import HttpException from '../exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'class-validator';

export const errorMiddleware = (
  error: HttpException,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (error instanceof ValidationError) {
    response.status(500).json(error);
  }
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  response.status(status).send({
    status,
    message,
  });
};
