import { STATUS } from "../constant/statusCodes.js";
import * as userRepo from "../repositories/user.repositories.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateRefreshToken, generateToken } from "../utils/token.js";

// Register a new user
export const createUser = async ({ fullname, email, password }) => {
    try {
        const existingUser = await userRepo.getUserByEmail(email)

        if (existingUser) {
            return {
                success: false,
                statusCode: STATUS.CONFLICT,
                message: "User with this email already exists"
            }
        }

        const hashedPassword = await hashPassword(password)
        const newUser = await userRepo.createUser({ fullname, email, password: hashedPassword });

        return {
            success: true,
            message: "User created successfully",
            data: newUser
        };

    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in creating user",
            error: error.message
        }
    }
};

// Login an existing user
export const loginUser = async ({ email, password }) => {
    try {
        const user = await userRepo.getUserByEmail(email);
        if (!user) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "User not found"
            };
        }

        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
            return {
                success: false,
                statusCode: STATUS.UNAUTHORIZED,
                message: "Invalid credentials"
            };
        }

        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);
        await userRepo.updateUser(user._id, { refreshToken });

        return {
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email
                }
            }
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in login",
            error: error.message
        };
    }
};

// Change password for the authenticated user
export const changePassword = async ({ userId, currentPassword, newPassword }) => {
    try {
        const user = await userRepo.getUserById(userId);
        if (!user) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "User not found"
            };
        }

        const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return {
                success: false,
                statusCode: STATUS.UNAUTHORIZED,
                message: "Current password is incorrect"
            };
        }

        const isSamePassword = await verifyPassword(newPassword, user.password);
        if (isSamePassword) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "New password must be different from current password"
            };
        }

        const hashedPassword = await hashPassword(newPassword);
        await userRepo.updateUser(userId, { password: hashedPassword, refreshToken: null });

        return {
            success: true,
            message: "Password changed successfully"
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in changing password",
            error: error.message
        };
    }
};

// Logout the current user
export const logoutUser = async (userId) => {
    try {
        await userRepo.clearRefreshToken(userId);
        return {
            success: true,
            message: "Logout successful"
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in logout",
            error: error.message
        }
    };
};

// Refresh access token using refresh token
export const refreshToken = async (userId, refreshToken) => {
    try {
        const user = await userRepo.getUserById(userId);
        if (!user) {
            return {
                success: false,
                statusCode: STATUS.NOT_FOUND,
                message: "User not found"
            };
        }
        const isValid = await userRepo.verifyRefreshToken(userId, refreshToken);
        if (!isValid) {
            return {
                success: false,
                statusCode: STATUS.UNAUTHORIZED,
                message: "Invalid refresh token"
            };
        }

        const accessToken = generateToken(user);
        return {
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken
            }
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error in refreshing token",
            error: error.message
        };
    }
};

// Search users by name/email (excluding current user) for starting direct chats
export const searchUsersForChat = async (currentUserId, searchTerm) => {
    try {
        if (!currentUserId) {
            return {
                success: false,
                statusCode: STATUS.BAD_REQUEST,
                message: "User ID is required"
            };
        }

        const users = await userRepo.searchUsersForDirectChat(currentUserId, searchTerm, 20);

        return {
            success: true,
            statusCode: STATUS.OK,
            message: "Users fetched successfully",
            data: users,
        };
    } catch (error) {
        return {
            success: false,
            statusCode: STATUS.INTERNAL_ERROR,
            message: "Error searching users",
            error: error.message,
        };
    }
};