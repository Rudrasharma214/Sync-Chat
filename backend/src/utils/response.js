import { STATUS } from '../constant/statusCodes.js';

export const sendResponse = (res, statusCode = STATUS.OK, message = 'Success', data) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    status: statusCode,
  });
};

export const sendErrorResponse = (
  res,
  statusCode = STATUS.BAD_REQUEST,
  message = 'Error',
  data = null
) => {
  res.status(statusCode).json({
    success: false,
    message,
    data,
    status: statusCode,
  });
};
