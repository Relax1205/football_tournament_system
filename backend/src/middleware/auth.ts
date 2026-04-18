import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config';

type AuthPayload = {
  userId: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

function readToken(request: Request) {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length).trim();
}

export function authenticate(request: Request, response: Response, next: NextFunction) {
  const token = readToken(request);

  if (!token) {
    return response.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    request.auth = payload;
    next();
  } catch {
    return response.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export function requireRoles(...roles: Role[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.auth) {
      return response.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!roles.includes(request.auth.role)) {
      return response.status(403).json({ success: false, error: 'Forbidden' });
    }

    next();
  };
}
