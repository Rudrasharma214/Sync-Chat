import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import { getUserById } from "../repositories/user.repositories.js";
import { STATUS } from "../constant/statusCodes.js";
import { sendErrorResponse } from "../utils/response.js";

export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.cookies.jwt

        if (!token) {
            return sendErrorResponse(res, STATUS.UNAUTHORIZED, "No token provided")
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded) {
            return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Invalid token")
        }

        const user = await getUserById(decoded.userId)

        if (!user) {
            return sendErrorResponse(res, STATUS.UNAUTHORIZED, "User not found")
        }

        req.user = user
        next();
    } catch (e) {
        logger.log("error in authenticate in middleware", e.message)
        return sendErrorResponse(res, STATUS.INTERNAL_ERROR, "Internal server error")
    }
}