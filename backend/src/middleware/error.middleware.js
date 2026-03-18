import { STATUS } from '../constant/statusCodes.js';
import AppError from '../utils/appError.js';
import env from '../config/env.js';

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err instanceof AppError ? err.statusCode : STATUS.INTERNAL_ERROR;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong',
    status: statusCode,
    stack: env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
