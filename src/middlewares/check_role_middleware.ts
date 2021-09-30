import { NextFunction, Response, Request } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../users/entities/users_entity';

export const checkRole = (role) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = await res.locals.jwtPayload.userId;
    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (e) {
      res.send(e);
    }
    if (role === user.role) next();
    else {
      res.send('Access denied');
    }
    return;
  };
};
