import { NextFunction, Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';

export const checkJwt =
  () => (req: Request, res: Response, next: NextFunction) => {
    const token = <string>req.headers.authorization.slice(7);
    let jwtPayload;
    const secret_key = process.env.SECRET_JWT;

    try {
      jwtPayload = jwt.verify(token, secret_key);
      res.locals.jwtPayload = jwtPayload;
    } catch (e) {
      res.status(401).send();
      return;
    }

    const { userId, email } = jwtPayload;
    const newToken = jwt.sign({ userId, email }, secret_key, {
      expiresIn: '1h',
    });
    res.setHeader('token', newToken);
    next();
  };
