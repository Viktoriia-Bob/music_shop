import { validateOrReject } from 'class-validator';
import express = require('express');

function ValidationMiddlewareFactory() {
  return (Validator) => {
    return (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ): void => {
      const validator = new Validator();
      for (let key in req.body) {
        validator[key] = req.body[key];
      }
      validateOrReject(validator)
        .then(() => next())
        .catch((e) => {
          res.send(e);
        });
    };
  };
}

const ValidationMiddleware = ValidationMiddlewareFactory();
export { ValidationMiddleware };
