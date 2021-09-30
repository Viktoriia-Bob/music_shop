import HttpException from '../exceptions/HttpException';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

function errorMiddleware(
  error: HttpException,
  request: Request,
  response: Response
) {
  if (error instanceof ValidationError) {
    response.status(500).json(error);
  }
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  response.send({
    status,
    message,
  });
}

export default errorMiddleware;
