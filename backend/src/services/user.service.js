import { STATUS } from "../constant/statusCodes.js";
import * as userRepo from "../repositories/user.repositories";
import { hashPassword } from "../utils/password";
import { generateRefreshToken, generateToken } from "../utils/token.js";

export const createUser = async ({fullname, email, password}) => {
    try {
        const existingUser = await userRepo.getUserByEmail(email)

        if(existingUser) {
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

        const isMatch = await userRepo.comparePassword(password, user.password);
        if (!isMatch) {
            return {
                success: false,
                statusCode: STATUS.UNAUTHORIZED,
                message: "Invalid credentials"
            };
        }

        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);

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

export const logoutUser = async (userId) => {
    try{
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