import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import env from "../config/env.js";
import { getUserById } from "../repositories/user.repositories.js";
import { STATUS } from "../constant/statusCodes.js";
import { sendErrorResponse } from "../utils/response.js";

const getBearerToken = (authorizationHeader = "") => {
    if (!authorizationHeader || typeof authorizationHeader !== "string") {
        return null;
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return null;
    }

    return token;
};

export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.cookies.jwt || getBearerToken(req.headers.authorization);

        if (!token) {
            return sendErrorResponse(res, STATUS.UNAUTHORIZED, "No token provided")
        }

        const decoded = jwt.verify(token, env.JWT_SECRET)

        if (!decoded) {
            return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Invalid token")
        }

        const userId = decoded.userId || decoded.id
        const user = await getUserById(userId)

        if (!user) {
            return sendErrorResponse(res, STATUS.UNAUTHORIZED, "User not found")
        }

        req.user = user
        next();
    } catch (e) {
        logger.warn("Authentication failed", {
            message: e.message,
            origin: req.headers.origin || null,
            hasCookie: Boolean(req.headers.cookie),
            hasAuthorization: Boolean(req.headers.authorization),
        })

        return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Invalid or expired token")
    }
}