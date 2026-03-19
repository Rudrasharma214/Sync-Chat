import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const generateToken = (payload) => {
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
  };
  return jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload) => {
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
  };
  return jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token', { cause: error });
  }
};
