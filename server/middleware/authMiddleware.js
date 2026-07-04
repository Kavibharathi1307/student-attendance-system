import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { httpError } from '../utils/httpError.js';

export function authenticate(request, _response, next) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(httpError(401, 'Authentication token is required.'));
  }

  try {
    request.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(httpError(401, 'Invalid or expired token.'));
  }
}

export function authorizeRoles(...roles) {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(httpError(403, 'You do not have permission to access this resource.'));
    }

    return next();
  };
}
