import * as authService from "../services/auth.service.js";
import { STATUS } from "../constant/statusCodes.js";
import { sendResponse, sendErrorResponse } from '../utils/response.js'
import env from "../config/env.js";
import { verifyToken } from "../utils/token.js";

// Register a new user
export const signup = async (req, res, next) => {
    try {
        const { fullname, email, password } = req.body
        if (!fullname || !email || !password) {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, "All fields are required.")
        }

        const result = await authService.createUser({ fullname, email, password })

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, STATUS.CREATED, "User created successfully", result.data)
    } catch (error) {
        next(error);
    }
}

// Login an existing user
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, "Email and password are required.");
        }

        const result = await authService.loginUser({ email, password });

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        res.cookie("accessToken", result.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: env.JWT_ACCESS_COOKIE_MAX_AGE
        });

        res.cookie("refreshToken", result.data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: env.JWT_REFRESH_COOKIE_MAX_AGE
        });

        return sendResponse(res, STATUS.OK, "Login successful", result.data.user);
    } catch (error) {
        next(error);
    }
};

// Logout the current user
export const logout = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;

        const result = await authService.logoutUser(userId);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return sendResponse(res, STATUS.OK, "Logout successful");
    } catch (error) {
        next(error);
    }
};

// Refresh access token using refresh token
export const refreshToken = async (req, res, next) => {
    try {
        const refreshTokenCookie = req.cookies.refreshToken;

        if (!refreshTokenCookie) {
            return sendErrorResponse(res, STATUS.UNAUTHORIZED, "No refresh token provided");
        }

        const decoded = verifyToken(refreshTokenCookie);
        const userId = decoded.userId || decoded.id;

        const result = await authService.refreshToken(userId, refreshTokenCookie);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        res.cookie("accessToken", result.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: env.JWT_ACCESS_COOKIE_MAX_AGE
        });

        return sendResponse(res, STATUS.OK, "Token refreshed successfully", { accessToken: result.data.accessToken });
    } catch (error) {
        next(error);
    }
};

// Change password for authenticated user
export const changePassword = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, "Current password and new password are required.");
        }

        if (newPassword.length < 6) {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, "New password must be at least 6 characters long.");
        }

        const result = await authService.changePassword({ userId, currentPassword, newPassword });

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return sendResponse(res, STATUS.OK, "Password changed successfully");
    } catch (error) {
        next(error);
    }
};

// Get current authenticated user
export const getMe = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return sendErrorResponse(res, STATUS.UNAUTHORIZED, "Unauthorized");
        }

        return sendResponse(res, STATUS.OK, "User fetched successfully", {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
        });
    } catch (error) {
        next(error);
    }
};

// Search users for starting direct conversations
export const searchUsers = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const searchTerm = typeof req.query?.search === "string" ? req.query.search : "";

        const result = await authService.searchUsersForChat(userId, searchTerm);

        if (!result.success) {
            return sendErrorResponse(res, result.statusCode, result.message, result.error);
        }

        return sendResponse(res, result.statusCode, result.message, result.data);
    } catch (error) {
        next(error);
    }
};