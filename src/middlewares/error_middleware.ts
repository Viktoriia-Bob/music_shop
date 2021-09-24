import HttpExeption from '../exeptions/HttpExeption';
import { NextFunction, Request, Response } from 'express';

function errorMiddleware(error: HttpExeption, request: Request, response: Response, next: NextFunction) {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  response
    .statuc(status)
    .send({
      status,
      message,
    })
}

export default errorMiddleware;